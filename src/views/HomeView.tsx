import type { DataMode } from "../components/DataModeControl";
import { formatArea, formatDate, type PublicRecords } from "../lib/records";

export function HomeView({ records, mode }: { records: PublicRecords; mode: DataMode }) {
  const { groundFloor, firstFloor, porchMin, porchMax } = records.project.areasSqFt;
  const { lintelHeightApproxFeet, brickworkHeightApproxFeet, asOf, groundFloorRoof } = records.currentStatus;
  const roofCast = groundFloorRoof === "cast";
  const areaWidth = (value: number) => `${Math.min(value / groundFloor, 1) * 100}%`;
  const lintelMark = `${Math.min(lintelHeightApproxFeet / brickworkHeightApproxFeet, 1) * 100}%`;

  return <>
    <header className="view-intro home-intro">
      <h1>The home</h1>
      <p>{mode === "scenario" ? "The scope and present build state below are owner reports. The illustrative ledger does not describe the house itself." : "A contemporary owner-managed home in Tamil Nadu, built with reinforced concrete, steel and red brick."}</p>
    </header>

    <section className="home-profile" aria-labelledby="home-profile-title">
      <div className="home-profile-lead"><h2 id="home-profile-title">Known scope</h2><p>Ground-floor work is under way. The first floor and porch are planned areas; these estimates do not form a reconciled total.</p></div>
      <div className="home-area-study" role="group" aria-label="Approximate planned areas, compared within their own bands">
        <div className="home-area-row"><div><span>Ground floor</span><strong className="tabular-nums">≈{formatArea(groundFloor)} sq ft</strong></div><div className="home-area-track"><span style={{ width: areaWidth(groundFloor) }} /></div></div>
        <div className="home-area-row"><div><span>Planned first floor</span><strong className="tabular-nums">≈{formatArea(firstFloor)} sq ft</strong></div><div className="home-area-track"><span style={{ width: areaWidth(firstFloor) }} /></div></div>
        <div className="home-area-row"><div><span>Extendable RCC porch</span><strong className="tabular-nums">≈{formatArea(porchMin)}–{formatArea(porchMax)} sq ft</strong></div><div className="home-area-track"><span style={{ width: areaWidth(porchMin) }} /><i style={{ left: areaWidth(porchMin), width: areaWidth(porchMax - porchMin) }} /></div></div>
      </div>
      <p className="home-study-caption">Band lengths compare approximate areas only. They do not show completed construction or a floor plan.</p>
    </section>

    <div className="home-detail-grid">
      <section className="home-height-study" aria-labelledby="height-title">
        <div className="home-section-heading"><h2 id="height-title">Ground-floor height</h2><span>Owner report · {formatDate(asOf)}</span></div>
        <div className="home-height-graphic" aria-hidden="true"><div className="home-height-wall"><span className="home-height-lintel" style={{ bottom: lintelMark }} /></div><span className="home-height-top">≈{brickworkHeightApproxFeet} ft</span><span className="home-height-middle" style={{ bottom: lintelMark }}>≈{lintelHeightApproxFeet} ft</span><span className="home-height-base">Ground</span></div>
        <dl className="home-height-facts"><div><dt>Brickwork</dt><dd>Red-brick walls near {brickworkHeightApproxFeet} ft</dd></div><div><dt>Lintel</dt><dd>Complete near {lintelHeightApproxFeet} ft</dd></div><div><dt>RCC roof</dt><dd>{roofCast ? "Cast" : "Not cast"}</dd></div></dl>
        <p className="home-study-caption">A height relationship, not an engineering drawing. Exact stage-completion dates were not supplied.</p>
      </section>
      <section className="home-materials" aria-labelledby="home-materials-title"><div className="home-section-heading"><h2 id="home-materials-title">Construction approach</h2><span>Owner description</span></div><dl><div><dt>Reinforced concrete</dt><dd>The ground-floor RCC roof {roofCast ? "has been cast" : "is still to be cast"}.</dd></div><div><dt>Steel rods</dt><dd>TMT steel is included in the reported overall spend; sizes and quantities are unrecorded.</dd></div><div><dt>Red brick</dt><dd>Ground-floor walls have been raised to roughly {brickworkHeightApproxFeet} ft.</dd></div></dl></section>
    </div>

    <p className="home-privacy-note">Detailed plans, wiring, exact location, worker identities and raw receipts remain private.</p>
  </>;
}
