// Shared helpers for the New River Log Cabin Retreat booking functions.
import { getStore } from "@netlify/blobs";

export const SITE_URL = "https://newriverlogcabinretreat.com";

// ---------- Date helpers (all dates are plain YYYY-MM-DD, no time zones) ----------
export const isISODate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + "T00:00:00Z"));
export const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
// Every night from check-in up to (not including) check-out.
export function nightsBetween(checkin, checkout) {
  const out = []; let d = checkin; let guard = 0;
  while (d < checkout && guard++ < 400) { out.push(d); d = addDays(d, 1); }
  return out;
}

// ---------- iCal parsing (Airbnb / VRBO export feeds) ----------
function icsDate(value) {
  // Accepts 20261003, 20261003T150000Z, 20261003T150000
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(value.trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
export function parseICS(text) {
  const lines = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/); // unfold
  const events = []; let cur = null;
  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) cur = {};
    else if (line.startsWith("END:VEVENT")) { if (cur?.start) events.push(cur); cur = null; }
    else if (cur) {
      const i = line.indexOf(":"); if (i < 0) continue;
      const key = line.slice(0, i).split(";")[0].toUpperCase(); const val = line.slice(i + 1);
      if (key === "DTSTART") cur.start = icsDate(val);
      if (key === "DTEND") cur.end = icsDate(val);
    }
  }
  return events.map((e) => ({ start: e.start, end: e.end && e.end > e.start ? e.end : addDays(e.start, 1) }));
}

// The calendars to import, set in Netlify > Site configuration > Environment variables.
export function importFeeds() {
  const feeds = [];
  if (process.env.AIRBNB_ICAL_URL) feeds.push({ source: "Airbnb", url: process.env.AIRBNB_ICAL_URL });
  if (process.env.VRBO_ICAL_URL) feeds.push({ source: "VRBO", url: process.env.VRBO_ICAL_URL });
  (process.env.EXTRA_ICAL_URLS || "").split(",").map((s) => s.trim()).filter(Boolean)
    .forEach((url, i) => feeds.push({ source: `Calendar ${i + 1}`, url }));
  return feeds;
}

export async function fetchFeed(feed) {
  try {
    const res = await fetch(feed.url, { headers: { "User-Agent": "NewRiverLogCabinRetreat/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const events = parseICS(await res.text());
    return { source: feed.source, ok: true, events };
  } catch (err) {
    return { source: feed.source, ok: false, error: String(err.message || err), events: [] };
  }
}

// ---------- Direct bookings, stored in Netlify Blobs ----------
const store = () => getStore({ name: "direct-bookings", consistency: "strong" });
export async function getDirectBookings() {
  const data = await store().get("bookings", { type: "json" });
  return Array.isArray(data) ? data : [];
}
export async function saveDirectBookings(list) {
  list.sort((a, b) => a.checkin.localeCompare(b.checkin));
  await store().setJSON("bookings", list);
}

export const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...extra } });

export function isAdmin(req) {
  const pw = process.env.ADMIN_PASSWORD;
  return Boolean(pw) && req.headers.get("x-admin-password") === pw;
}
