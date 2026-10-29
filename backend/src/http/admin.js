// Read-only bookings page. Served as three static files so the strict CSP (no inline script) can stay on.
export const adminPage = `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bookings</title><link rel="stylesheet" href="/admin/app.css">
<h1>Bookings</h1><p id="note">Loading...</p>
<table><thead><tr><th>Ref</th><th>Guest</th><th>Email</th><th>Check-in</th><th>Check-out</th><th>Nights</th><th>Guests</th><th>Total</th><th>Status</th><th>Created</th></tr></thead><tbody id="rows"></tbody></table>
<script src="/admin/app.js"></script></html>`;

export const adminCss = `body{font:14px system-ui;margin:32px;color:#222}table{border-collapse:collapse;width:100%}
th,td{padding:8px 12px;border-bottom:1px solid #ddd;text-align:left}th{background:#f7f7f7}.cancelled{color:#999;text-decoration:line-through}`;

export const adminAppJs = `
const note = document.getElementById("note");
const rows = document.getElementById("rows");
const cell = (text) => { const td = document.createElement("td"); td.textContent = text; return td; };  // textContent => no XSS

async function load(token) {
  const res = await fetch("/api/bookings", { headers: token ? { Authorization: "Bearer " + token } : {} });
  if (res.status === 401) {
    const t = prompt("Admin token");
    if (t) { sessionStorage.setItem("adminToken", t); return load(t); }
    note.textContent = "Admin token required.";
    return;
  }
  const { items } = await res.json();
  note.textContent = items.length + " booking(s)";
  rows.replaceChildren(...items.map((b) => {
    const tr = document.createElement("tr");
    tr.className = b.status;
    [b.reference, b.guest.name, b.guest.email, b.checkIn, b.checkOut, b.nights,
     (b.guests.adults + b.guests.children) + " + " + b.guests.infants + " inf, " + b.guests.pets + " pet",
     b.price.total.toLocaleString("en-IN"), b.status, b.createdAt].forEach((v) => tr.append(cell(v)));
    return tr;
  }));
}
load(sessionStorage.getItem("adminToken"));
`;
