// GET /calendar.ics → an iCal feed of bookings confirmed on newriverlogcabinretreat.com.
// Paste this link into Airbnb ("Import calendar") and VRBO ("Import calendar") so
// direct bookings block those dates there too. Guest names are never included.
import { getDirectBookings, SITE_URL } from "../lib/shared.mjs";

const ymd = (iso) => iso.replace(/-/g, "");
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export default async () => {
  const bookings = await getDirectBookings();
  const now = stamp();
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//New River Log Cabin Retreat//Direct Bookings//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:New River Log Cabin Retreat (direct)",
  ];
  for (const b of bookings) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${b.id}@newriverlogcabinretreat.com`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${ymd(b.checkin)}`,
      `DTEND;VALUE=DATE:${ymd(b.checkout)}`,
      "SUMMARY:Reserved (direct booking)",
      `URL:${SITE_URL}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=300" },
  });
};

export const config = { path: "/calendar.ics" };
