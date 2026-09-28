import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpenText, Building2, House, Layers3, PanelLeftClose, PanelLeftOpen, ReceiptText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { parsedRecords, type PublicRecords } from "./lib/records";
import { readScenarioSelection, writeScenarioSelection, type ScenarioSelection, type ScenarioSelectionPatch } from "./lib/scenario-url";
import { DataModeControl, type DataMode } from "./components/DataModeControl";
import { HomeView } from "./views/HomeView";
import { JourneyView } from "./views/JourneyView";
import { OverviewView } from "./views/OverviewView";
import { RecordsView } from "./views/RecordsView";

type View = "overview" | "journey" | "records" | "home";
type Route = { view: View; entryId?: string };

const navigation: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: Layers3 },
  { id: "journey", label: "Journey", icon: BookOpenText },
  { id: "records", label: "Records", icon: ReceiptText },
  { id: "home", label: "Home", icon: House }
];
const navigationPreferenceKey = "rk-compact-nav-v2";

function currentRoute(): Route {
  const [view, entryId] = window.location.hash.slice(1).split("/");
  if (!navigation.some((item) => item.id === view)) return { view: "overview" };
  return { view: view as View, entryId: view === "journey" ? entryId : undefined };
}

function scrollToContentTop() {
  document.getElementById("content")?.scrollTo({ top: 0, behavior: "auto" });
  window.scrollTo({ top: 0, behavior: "auto" });
}

function readCompactPreference(): boolean {
  try { return window.localStorage.getItem(navigationPreferenceKey) !== "false"; }
  catch { return true; }
}

function readDataMode(): DataMode {
  return new URLSearchParams(window.location.search).get("mode") === "record" ? "record" : "scenario";
}

function FocusOnRoute({ route, navigated }: { route: Route; navigated: boolean }) {
  useEffect(() => {
    const current = currentRoute();
    if (!navigated || route.entryId || current.view !== route.view || current.entryId !== route.entryId) return;
    document.getElementById("content")?.focus({ preventScroll: true });
  }, [navigated, route.view, route.entryId]);
  return null;
}

function NavigationLinks({ view, mobile = false }: { view: View; mobile?: boolean }) {
  return (
    <nav className={mobile ? "mobile-navigation" : "rail-navigation"} aria-label={mobile ? "Mobile sections" : "Sections"}>
      {navigation.map(({ id, label, icon: Icon }) => (
        <a className="navigation-link" href={`#${id}`} key={id} aria-label={label} aria-current={view === id ? "page" : undefined} onClick={scrollToContentTop}>
          <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

function AppShell({ records }: { records: PublicRecords }) {
  const [route, setRoute] = useState<Route>(currentRoute);
  const [compact, setCompact] = useState(readCompactPreference);
  const [dataMode, setDataMode] = useState<DataMode>(readDataMode);
  const [scenarioSelection, setScenarioSelection] = useState<ScenarioSelection>(() => readScenarioSelection(window.location.search, readDataMode()));
  const navigated = useRef(false);
  const restoringHistory = useRef(false);
  const reducedMotion = useReducedMotion();
  const { view } = route;

  useEffect(() => {
    const update = (event: Event) => {
      navigated.current = true;
      if (event.type === "popstate") {
        restoringHistory.current = true;
        window.setTimeout(() => { restoringHistory.current = false; }, 0);
      }
      setRoute(currentRoute());
      setDataMode(readDataMode());
      setScenarioSelection(readScenarioSelection(window.location.search, readDataMode()));
      if (event.type === "hashchange" && !restoringHistory.current) scrollToContentTop();
    };
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
    };
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(navigationPreferenceKey, String(compact)); }
    catch { /* The navigation still works when storage is unavailable. */ }
  }, [compact]);

  function changeDataMode(mode: DataMode) {
    if (mode === dataMode) return;
    setDataMode(mode);
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    if (mode === "record") {
      url.searchParams.delete("month");
      url.searchParams.delete("cost");
      url.searchParams.delete("day");
      setScenarioSelection(readScenarioSelection(url.search, mode));
    }
    window.history.pushState(window.history.state, "", url);
  }

  function changeScenarioSelection(patch: ScenarioSelectionPatch) {
    const url = new URL(window.location.href);
    const search = writeScenarioSelection(url.search, patch);
    url.search = search;
    const routeChanged = Boolean(patch.recordCategory && url.hash !== "#records");
    if (routeChanged) url.hash = "#records";
    if (url.href === window.location.href) return;
    window.history[routeChanged ? "pushState" : "replaceState"](window.history.state, "", url);
    setScenarioSelection(readScenarioSelection(url.search, dataMode));
    if (routeChanged) {
      navigated.current = true;
      setRoute(currentRoute());
      scrollToContentTop();
    }
  }

  const content = {
    overview: <OverviewView records={records} mode={dataMode} selection={scenarioSelection} onSelectionChange={changeScenarioSelection} />,
    journey: <JourneyView records={records} mode={dataMode} selectedEntryId={route.entryId} />,
    records: <RecordsView records={records} mode={dataMode} selection={scenarioSelection} onSelectionChange={changeScenarioSelection} />,
    home: <HomeView records={records} mode={dataMode} />
  }[view];

  return (
    <div className={`app-layout${compact ? " app-layout--compact" : ""}`}>
      <a className="skip-link" href="#content" onClick={(event) => {
        event.preventDefault();
        const content = document.getElementById("content");
        content?.focus({ preventScroll: true });
        scrollToContentTop();
      }}>Skip to content</a>
      <aside className="rail surface-dark" aria-label="Site navigation">
        <div className="brand"><span className="brand-mark"><Building2 size={19} aria-hidden="true" /></span><span className="brand-name">Ravanan Kudil</span></div>
        <div className="rail-divider" />
        <NavigationLinks view={view} />
        <div className="rail-bottom">
          <button className="rail-toggle" type="button" onClick={() => setCompact((value) => !value)} aria-label={compact ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!compact}>
            {compact ? <PanelLeftOpen size={19} strokeWidth={1.8} /> : <PanelLeftClose size={19} strokeWidth={1.8} />}
            <span>{compact ? "Expand sidebar" : "Collapse sidebar"}</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <main className="main-content" id="content" tabIndex={-1} aria-label={`${navigation.find((item) => item.id === view)?.label} content`}>
          {(view === "overview" || view === "records") && <DataModeControl mode={dataMode} onChange={changeDataMode} />}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="view-frame"
              key={view}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.16, ease: "easeOut" }}
            >
              <FocusOnRoute route={route} navigated={navigated.current} />
              {content}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
      <NavigationLinks view={view} mobile />
    </div>
  );
}

export function App() {
  if (!parsedRecords.success) {
    console.error("Public records need correction", parsedRecords.error);
    return <main className="data-error"><span className="brand-mark"><Building2 size={19} aria-hidden="true" /></span><h1>The public record needs correction.</h1><p>The dates and figures are temporarily unavailable. The source data must be checked before this page can show them.</p></main>;
  }
  return <AppShell records={parsedRecords.data} />;
}
