export type DataMode = "scenario" | "record";

export function DataModeControl({ mode, onChange }: { mode: DataMode; onChange: (mode: DataMode) => void }) {
  return <nav className="data-mode-control" aria-label="Data source">
    <button type="button" aria-current={mode === "scenario" ? "page" : undefined} onClick={() => onChange("scenario")}>Illustrative model</button>
    <button type="button" aria-current={mode === "record" ? "page" : undefined} onClick={() => onChange("record")}>Owner record</button>
  </nav>;
}
