"use strict";

const moneyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});
const countFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 10 });

function element(tag, className, content) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (content !== undefined) item.textContent = String(content);
  return item;
}

function fullDate(value, precision = "day") {
  const date = new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-IN", {
    day: precision === "day" ? "numeric" : undefined,
    month: precision === "day" ? "short" : "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function shortMonth(value) {
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}-01T00:00:00Z`));
}

function validDate(value, allowMonth = false) {
  if (typeof value !== "string") return false;
  if (allowMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return true;
  if (!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is missing`);
}

function validateRecords(data) {
  if (!data || data.schemaVersion !== 1 || !validDate(data.publishedAt)) throw new Error("Invalid public record header");
  for (const key of ["entries", "finance", "attendance", "materials"]) {
    if (!Array.isArray(data[key])) throw new Error(`${key} must be a list`);
    const ids = new Set();
    for (const record of data[key]) {
      requireText(record.id, `${key} id`);
      if (ids.has(record.id)) throw new Error(`Duplicate ${key} id`);
      ids.add(record.id);
      if (!validDate(record.date, key === "entries")) throw new Error(`Invalid ${key} date`);
    }
  }
  for (const entry of data.entries) {
    requireText(entry.title, "entry title");
    requireText(entry.body, "entry body");
    requireText(entry.source, "entry source");
  }
  for (const item of data.finance) {
    if (!["quote", "invoice", "payment", "refund"].includes(item.kind)) throw new Error("Invalid finance kind");
    if (!Number.isSafeInteger(item.amountPaise) || item.amountPaise < 0) throw new Error("Invalid finance amount");
    requireText(item.description, "finance description");
    requireText(item.category, "finance category");
    requireText(item.source, "finance source");
  }
  const attendanceDates = new Set();
  for (const day of data.attendance) {
    if (attendanceDates.has(day.date)) throw new Error("Duplicate attendance date");
    attendanceDates.add(day.date);
    if (!["worked", "no_work", "unknown"].includes(day.state)) throw new Error("Invalid attendance state");
    if (day.state === "worked" && day.workers !== undefined && (!Number.isInteger(day.workers) || day.workers < 1)) throw new Error("Invalid worker count");
    requireText(day.source, "attendance source");
  }
  for (const item of data.materials) {
    if (!["purchased", "delivered", "used", "returned"].includes(item.action)) throw new Error("Invalid material action");
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) throw new Error("Invalid material quantity");
    requireText(item.name, "material name");
    requireText(item.unit, "material unit");
    requireText(item.source, "material source");
  }
}

function replaceWithNote(id, message) {
  document.getElementById(id).replaceChildren(element("p", "empty-note", message));
}

function renderJournal(entries) {
  const list = document.getElementById("journal-list");
  if (!entries.length) return replaceWithNote("journal-list", "No dated notes published yet.");
  const items = entries.slice().sort((a, b) => b.date.localeCompare(a.date)).map((entry) => {
    const article = element("article", "journal-entry");
    const date = element("time", "entry-date", fullDate(entry.date, entry.date.length === 7 ? "month" : "day"));
    date.dateTime = entry.date;
    const body = element("div", "entry-body");
    body.append(element("h3", "", entry.title), element("p", "", entry.body), element("span", "entry-source", entry.source));
    article.append(date, body);
    return article;
  });
  list.replaceChildren(...items);
}

function renderMetrics(data) {
  const cash = data.finance.filter((item) => item.kind === "payment" || item.kind === "refund");
  const spent = document.getElementById("spent-value");
  if (cash.length) {
    const total = cash.reduce((sum, item) => sum + (item.kind === "refund" ? -item.amountPaise : item.amountPaise), 0);
    if (!Number.isSafeInteger(total)) throw new Error("Spending total exceeds safe range");
    spent.textContent = moneyFormat.format(total / 100);
    document.getElementById("spent-context").textContent = `Net of ${cash.length} published cash ${cash.length === 1 ? "entry" : "entries"}; quotes and bills excluded`;
  } else {
    spent.textContent = "Not recorded";
    spent.classList.add("is-unknown");
    document.getElementById("spent-context").textContent = "No payments or refunds published";
  }

  const days = data.attendance.filter((day) => day.state === "worked");
  const workday = document.getElementById("workday-value");
  const workerday = document.getElementById("workerday-value");
  if (!data.attendance.length) {
    workday.textContent = "Not recorded";
    workerday.textContent = "Not recorded";
    workday.classList.add("is-unknown");
    workerday.classList.add("is-unknown");
    return;
  }
  workday.textContent = countFormat.format(days.length);
  document.getElementById("workday-context").textContent = `${data.attendance.length} date${data.attendance.length === 1 ? "" : "s"} with published attendance; other dates unknown`;
  const knownCounts = days.filter((day) => Number.isInteger(day.workers));
  const totalWorkers = knownCounts.reduce((sum, day) => sum + day.workers, 0);
  if (knownCounts.length === days.length) {
    workerday.textContent = countFormat.format(totalWorkers);
    document.getElementById("workerday-context").textContent = "Sum of published daily headcounts";
  } else if (knownCounts.length) {
    workerday.textContent = `At least ${countFormat.format(totalWorkers)}`;
    document.getElementById("workerday-context").textContent = "Some worked dates have no headcount";
  } else {
    workerday.textContent = "Not recorded";
    workerday.classList.add("is-unknown");
    document.getElementById("workerday-context").textContent = "Worked dates have no published headcounts";
  }
}

function renderSpending(finance) {
  const cash = finance.filter((item) => item.kind === "payment" || item.kind === "refund");
  if (!cash.length) return replaceWithNote("spending-chart", "No payment records published yet.");
  const monthly = new Map();
  for (const item of cash) {
    const month = item.date.slice(0, 7);
    monthly.set(month, (monthly.get(month) || 0) + (item.kind === "refund" ? -item.amountPaise : item.amountPaise));
    if (!Number.isSafeInteger(monthly.get(month))) throw new Error("Monthly spending exceeds safe range");
  }
  const largest = Math.max(...Array.from(monthly.values(), Math.abs), 1);
  const rows = Array.from(monthly.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, amount]) => {
    const row = element("div", "bar-row");
    const label = element("span", "bar-month", shortMonth(month));
    const track = element("div", "bar-track");
    const bar = element("span", `bar-fill${amount < 0 ? " is-refund" : ""}`);
    bar.style.width = `${Math.abs(amount) / largest * 100}%`;
    track.append(bar);
    row.append(label, track, element("strong", "bar-value", moneyFormat.format(amount / 100)));
    return row;
  });
  document.getElementById("spending-chart").replaceChildren(...rows);
}

function renderAttendance(attendance) {
  if (!attendance.length) return replaceWithNote("attendance-list", "No attendance dates published yet.");
  const labels = { worked: "Work recorded", no_work: "No work recorded", unknown: "Unconfirmed" };
  const rows = attendance.slice().sort((a, b) => b.date.localeCompare(a.date)).map((day) => {
    const row = element("div", "material-row");
    const name = element("div");
    name.append(element("strong", "", fullDate(day.date)), element("span", "", [day.note, `Source: ${day.source}`].filter(Boolean).join(" · ")));
    const count = day.state === "worked" && Number.isInteger(day.workers) ? ` · ${day.workers} ${day.workers === 1 ? "worker" : "workers"}` : "";
    row.append(name, element("span", "material-amount", `${labels[day.state]}${count}`));
    return row;
  });
  document.getElementById("attendance-list").replaceChildren(...rows);
}

function renderMaterials(materials) {
  if (!materials.length) return replaceWithNote("materials-list", "No material quantities published yet.");
  const rows = materials.slice().sort((a, b) => b.date.localeCompare(a.date)).map((item) => {
    const row = element("div", "material-row");
    const name = element("div");
    const specification = item.specification ? ` · ${item.specification}` : "";
    name.append(element("strong", "", `${item.name}${specification}`), element("span", "", `${fullDate(item.date)} · ${item.action} · Source: ${item.source}`));
    row.append(name, element("span", "material-amount", `${countFormat.format(item.quantity)} ${item.unit}`));
    return row;
  });
  document.getElementById("materials-list").replaceChildren(...rows);
}

function renderLedger(finance) {
  if (!finance.length) return replaceWithNote("ledger-list", "No financial entries published yet. Quotations and bills will appear here separately from payments.");
  const kindLabels = { quote: "Quotation", invoice: "Bill", payment: "Payment", refund: "Refund" };
  const rows = finance.slice().sort((a, b) => b.date.localeCompare(a.date)).map((item) => {
    const details = element("details", "ledger-entry");
    const summary = element("summary");
    const main = element("span", "ledger-main");
    main.append(element("span", "ledger-title", item.description), element("span", "ledger-type", kindLabels[item.kind]));
    summary.append(
      element("time", "ledger-date", fullDate(item.date)),
      main,
      element("strong", "ledger-amount", moneyFormat.format((item.kind === "refund" ? -1 : 1) * item.amountPaise / 100)),
      element("span", "ledger-expand", "+")
    );
    summary.querySelector("time").dateTime = item.date;
    const detail = element("div", "ledger-detail");
    detail.append(
      detailLine("Type", kindLabels[item.kind]),
      detailLine("Category", item.category),
      detailLine("Source", item.source),
      detailLine("Spend total", item.kind === "payment" || item.kind === "refund" ? "Included" : "Not included")
    );
    if (item.note) detail.append(detailLine("Note", item.note));
    if (item.relatedId) detail.append(detailLine("Related record", item.relatedId));
    details.append(summary, detail);
    return details;
  });
  document.getElementById("ledger-list").replaceChildren(...rows);
}

function detailLine(label, value) {
  const line = element("p");
  line.append(element("strong", "", `${label}: `), document.createTextNode(value));
  return line;
}

function showRecordError() {
  const message = "The public records need correction before figures can be shown.";
  for (const id of ["journal-list", "spending-chart", "attendance-list", "materials-list", "ledger-list"]) replaceWithNote(id, message);
  for (const id of ["spent-value", "workday-value", "workerday-value"]) {
    const value = document.getElementById(id);
    value.textContent = "Unavailable";
    value.classList.add("is-unknown");
  }
}

async function loadRecords() {
  try {
    const response = await fetch("./data/public-records.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Public records could not be loaded");
    const data = await response.json();
    validateRecords(data);
    renderJournal(data.entries);
    renderMetrics(data);
    renderSpending(data.finance);
    renderAttendance(data.attendance);
    renderMaterials(data.materials);
    renderLedger(data.finance);
    document.getElementById("record-date").textContent = `Public record updated ${fullDate(data.publishedAt)}`;
  } catch (error) {
    console.error("Ravanan Kudil public records:", error);
    showRecordError();
  }
}

loadRecords();
