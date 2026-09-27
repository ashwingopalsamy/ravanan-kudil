import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpenText, ChevronLeft, ChevronRight, House, Layers3, PanelLeftClose, PanelLeftOpen, ReceiptText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDate, parsedRecords, type PublicRecords } from "./lib/records";
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
  { id: "home", label: "The home", icon: House }
];

function currentRoute(): Route {
  const [view, entryId] = window.location.hash.slice(1).split("/");
  if (!navigation.some((item) => item.id === view)) return { view: "overview" };
  return { view: view as View, entryId: view === "journey" ? entryId : undefined };
}

function readCompactPreference(): boolean {
  try { return window.localStorage.getItem("rk-compact-nav") === "true"; }
  catch { return false; }
}

function NavigationLinks({ view, mobile = false }: { view: View; mobile?: boolean }) {
  return (
    <nav className={mobile ? "mobile-navigation" : "rail-navigation"} aria-label={mobile ? "Mobile sections" : "Sections"}>
      {navigation.map(({ id, label, icon: Icon }) => (
        <a className="navigation-link" href={`#${id}`} key={id} aria-current={view === id ? "page" : undefined} title={mobile ? undefined : label} onClick={() => window.scrollTo(0, 0)}>
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
  const reducedMotion = useReducedMotion();
  const { view } = route;

  useEffect(() => {
    const update = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("rk-compact-nav", String(compact)); }
    catch { /* The navigation still works when storage is unavailable. */ }
  }, [compact]);

  const content = {
    overview: <OverviewView records={records} />,
    journey: <JourneyView records={records} selectedEntryId={route.entryId} />,
    records: <RecordsView records={records} />,
    home: <HomeView records={records} />
  }[view];

  return (
    <div className={`app-layout${compact ? " app-layout--compact" : ""}`}>
      <a className="skip-link" href="#content" onClick={(event) => {
        event.preventDefault();
        const content = document.getElementById("content");
        content?.focus();
        content?.scrollIntoView({ block: "start" });
      }}>Skip to content</a>
      <aside className="rail surface-dark" aria-label="Site navigation">
        <a className="brand" href="#overview" aria-label="Ravanan Kudil overview"><span className="brand-mark">RK</span><span className="brand-name">Ravanan Kudil</span></a>
        <div className="rail-divider" />
        <NavigationLinks view={view} />
        <div className="rail-bottom">
          <span className="rail-caption">A public build record</span>
          <button className="rail-toggle" type="button" onClick={() => setCompact((value) => !value)} aria-label={compact ? "Expand navigation" : "Shrink navigation"} aria-expanded={!compact}>
            {compact ? <PanelLeftOpen size={19} strokeWidth={1.8} /> : <PanelLeftClose size={19} strokeWidth={1.8} />}
            <span>{compact ? "Expand" : "Shrink"}</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-identity"><span className="mobile-brand-mark">RK</span><span>Ravanan Kudil</span><ChevronRight aria-hidden="true" size={14} /><strong>{navigation.find((item) => item.id === view)?.label}</strong></div>
          <span className="topbar-updated"><span>Record updated </span>{formatDate(records.publishedAt)}</span>
        </header>

        <main className="main-content" id="content" tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="view-frame"
              key={view}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="app-footer"><span>Ravanan Kudil <span aria-hidden="true">·</span> Tamil Nadu</span><span>Owner-managed, openly documented</span><a href="#overview"><ChevronLeft size={15} aria-hidden="true" /> Back to overview</a></footer>
      </div>
      <NavigationLinks view={view} mobile />
    </div>
  );
}

export function App() {
  if (!parsedRecords.success) {
    console.error("Public records need correction", parsedRecords.error);
    return <main className="data-error"><span className="brand-mark">RK</span><h1>The public record needs correction.</h1><p>The dates and figures are temporarily unavailable. The source data must be checked before this page can show them.</p></main>;
  }
  return <AppShell records={parsedRecords.data} />;
}
