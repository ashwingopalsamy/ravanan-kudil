import { formatArea, formatDate, type PublicRecords } from "../lib/records";

export function HomeView({ records }: { records: PublicRecords }) {
  const { groundFloor, firstFloor, porchMin, porchMax } = records.project.areasSqFt;
  const { lintelHeightApproxFeet, brickworkHeightApproxFeet, asOf, groundFloorRoof } = records.currentStatus;
  const roofCast = groundFloorRoof === "cast";
  const areaWidth = (value: number) => `${Math.min(value / groundFloor, 1) * 100}%`;
  const lintelMark = `${Math.min(lintelHeightApproxFeet / brickworkHeightApproxFeet, 1) * 100}%`;

  return <>
    <header className="view-intro home-intro">
      <h1>The home</h1>
    </header>

    <section className="home-profile" aria-labelledby="home-profile-title">
      <div className="home-section-heading home-profile-lead"><h2 id="home-profile-title">Approximate areas</h2><span>Owner estimate</span></div>
      <div className="home-area-study" role="group" aria-label="Approximate floor and porch areas, compared by size">
        <div className="home-area-row"><div><span>Ground floor</span><strong className="tabular-nums">≈{formatArea(groundFloor)} sq ft</strong></div><div className="home-area-track"><span style={{ width: areaWidth(groundFloor) }} /></div></div>
        <div className="home-area-row"><div><span>Planned first floor</span><strong className="tabular-nums">≈{formatArea(firstFloor)} sq ft</strong></div><div className="home-area-track"><span style={{ width: areaWidth(firstFloor) }} /></div></div>
        <div className="home-area-row"><div><span>Extendable RCC porch</span><strong className="tabular-nums">≈{formatArea(porchMin)}–{formatArea(porchMax)} sq ft</strong></div><div className="home-area-track"><span style={{ width: areaWidth(porchMin) }} /><i style={{ left: areaWidth(porchMin), width: areaWidth(porchMax - porchMin) }} /></div></div>
      </div>
      <p className="home-study-caption">Areas are not a reconciled total; bars do not show construction progress.</p>
    </section>

    <div className="home-detail-grid">
      <section className="home-height-study" aria-labelledby="height-title">
        <div className="home-section-heading"><h2 id="height-title">Ground-floor height</h2><span>Owner report · {formatDate(asOf)}</span></div>
        <div className="home-height-graphic" aria-hidden="true"><div className="home-height-wall"><span className="home-height-lintel" style={{ bottom: lintelMark }} /></div><span className="home-height-top">≈{brickworkHeightApproxFeet} ft</span><span className="home-height-middle" style={{ bottom: lintelMark }}>≈{lintelHeightApproxFeet} ft</span><span className="home-height-base">Ground</span></div>
        <dl className="home-height-facts"><div><dt>Brickwork</dt><dd>Red-brick walls near {brickworkHeightApproxFeet} ft</dd></div><div><dt>Lintel</dt><dd>Complete near {lintelHeightApproxFeet} ft</dd></div><div><dt>RCC roof</dt><dd>{roofCast ? "Cast" : "Not cast"}</dd></div></dl>
        <p className="home-study-caption">Height comparison only · stage dates unrecorded.</p>
      </section>
      <section className="home-materials" aria-labelledby="home-materials-title"><div className="home-section-heading"><h2 id="home-materials-title">Construction approach</h2><span>Owner description</span></div><dl><div><dt>Reinforced concrete</dt><dd>Ground-floor RCC roof {roofCast ? "cast" : "still to be cast"}</dd></div><div><dt>Steel rods</dt><dd>TMT steel in reported spend; sizes and quantities unrecorded</dd></div><div><dt>Red brick</dt><dd>Ground-floor walls</dd></div></dl></section>
    </div>

    <p className="home-privacy-note">Plans, exact location and personal records remain private.</p>
  </>;
}
