import { attendanceByMonth, formatDate, type PublicRecords } from "../lib/records";

export function MonthlyAttendance({ records }: { records: PublicRecords }) {
  const months = attendanceByMonth(records);
  if (!months.length) return null;

  const largestWorkdays = Math.max(1, ...months.map((month) => month.workdays));
  const largestWorkerDays = Math.max(1, ...months.map((month) => month.knownWorkerDays));

  return (
    <section className="monthly-attendance" aria-labelledby="monthly-attendance-title">
      <div className="card-heading">
        <h2 id="monthly-attendance-title">Attendance by month</h2>
      </div>
      <div className="attendance-month-list">
        {months.map((month) => {
          const workerDays = month.missingHeadcounts
            ? month.knownWorkerDays > 0 ? `At least ${month.knownWorkerDays}` : "Not recorded"
            : String(month.knownWorkerDays);
          return (
            <div className="attendance-month" key={month.month}>
              <div className="attendance-month-label">
                <time dateTime={month.month}>{formatDate(month.month)}</time>
                <span>{month.recordedDates} {month.recordedDates === 1 ? "date" : "dates"} on record</span>
              </div>
              <div className="attendance-measure">
                <span>Confirmed workdays</span>
                <div className="attendance-track" aria-hidden="true"><span style={{ width: `${month.workdays / largestWorkdays * 100}%` }} /></div>
                <strong className="tabular-nums">{month.workdays}</strong>
              </div>
              <div className={`attendance-measure${month.missingHeadcounts ? " attendance-measure--incomplete" : ""}`}>
                <span>Worker-days</span>
                <div className="attendance-track" aria-hidden="true"><span style={{ width: `${month.knownWorkerDays / largestWorkerDays * 100}%` }} /></div>
                <strong className="tabular-nums">{workerDays}</strong>
                {month.missingHeadcounts > 0 && <small>{month.missingHeadcounts} {month.missingHeadcounts === 1 ? "work date has" : "work dates have"} no headcount</small>}
              </div>
            </div>
          );
        })}
      </div>
      <p>Bars compare counts within each measure, not attendance rates. Only months with an attendance entry appear; unlisted dates and months remain unknown. Missing headcounts make shown worker-day figures lower bounds.</p>
    </section>
  );
}
