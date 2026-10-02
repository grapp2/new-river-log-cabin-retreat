// GET /api/availability → every booked night from Airbnb, VRBO and direct bookings.
// The public site uses this to grey out dates in the inquiry calendar.
import { importFeeds, fetchFeed, getDirectBookings, nightsBetween, json } from "../lib/shared.mjs";

export default async () => {
  const today = new Date().toISOString().slice(0, 10);
  const [feeds, direct] = await Promise.all([Promise.all(importFeeds().map(fetchFeed)), getDirectBookings()]);
  const booked = new Set();
  for (const f of feeds) for (const e of f.events) nightsBetween(e.start, e.end).forEach((n) => booked.add(n));
  for (const b of direct) nightsBetween(b.checkin, b.checkout).forEach((n) => booked.add(n));
  return json(
    {
      booked: [...booked].filter((d) => d >= today).sort(),
      updated: new Date().toISOString(),
      sources: feeds.map((f) => ({ source: f.source, ok: f.ok })).concat([{ source: "Direct", ok: true }]),
    },
    200,
    { "Cache-Control": "public, max-age=0, s-maxage=900" } // cached at the edge for 15 minutes
  );
};

export const config = { path: "/api/availability" };
