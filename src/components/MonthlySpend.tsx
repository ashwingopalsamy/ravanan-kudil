import { formatDate, formatMoney, monthlySpend, type PublicRecords } from "../lib/records";

export function MonthlySpend({ records }: { records: PublicRecords }) {
  const months = monthlySpend(records);
  if (!months.length) return null;
  const largest = Math.max(...months.map((item) => Math.abs(item.paise)), 1);
  return <section className="monthly-spend" aria-labelledby="monthly-spend-title"><div className="card-heading"><div><h2 id="monthly-spend-title">Spending by month</h2><p>Payments less refunds.</p></div></div><div className="monthly-spend-rows">{months.map(({ month, paise }) => <div className="monthly-spend-row" key={month}><time dateTime={month}>{formatDate(month)}</time><div className="monthly-spend-track" aria-hidden="true"><span className={paise < 0 ? "monthly-spend-bar monthly-spend-bar--refund" : "monthly-spend-bar"} style={{ width: `${Math.abs(paise) / largest * 100}%` }} /></div><strong className="tabular-nums">{formatMoney(paise)}</strong></div>)}</div><p>Each bar comes from dated payments and refunds in the register above. A quotation or bill does not affect it.</p></section>;
}
