// /api/bookings — owner-only. Add, list and remove bookings confirmed directly with guests.
// Requires the ADMIN_PASSWORD environment variable; the admin page sends it as a header.
import { getDirectBookings, saveDirectBookings, importFeeds, fetchFeed, nightsBetween, isISODate, isAdmin, json } from "../lib/shared.mjs";

export default async (req) => {
  if (!process.env.ADMIN_PASSWORD) return json({ error: "ADMIN_PASSWORD is not set in Netlify yet." }, 503);
  if (!isAdmin(req)) return json({ error: "Wrong password." }, 401);

  if (req.method === "GET") {
    const feeds = await Promise.all(importFeeds().map(fetchFeed));
    return json({
      bookings: await getDirectBookings(),
      feeds: feeds.map((f) => ({ source: f.source, ok: f.ok, error: f.error || null, reservations: f.events.length })),
    });
  }

  if (req.method === "POST") {
    let body; try { body = await req.json(); } catch { return json({ error: "Bad request." }, 400); }
    const { checkin, checkout } = body;
    const name = String(body.name || "").slice(0, 80);
    const note = String(body.note || "").slice(0, 300);
    if (!isISODate(checkin) || !isISODate(checkout) || checkout <= checkin) return json({ error: "Check-out must be after check-in." }, 400);

    // Refuse overlaps with Airbnb, VRBO or another direct booking.
    const wanted = new Set(nightsBetween(checkin, checkout));
    const list = await getDirectBookings();
    const clashDirect = list.find((b) => nightsBetween(b.checkin, b.checkout).some((n) => wanted.has(n)));
    if (clashDirect && !body.force) return json({ error: `Overlaps a direct booking (${clashDirect.checkin} to ${clashDirect.checkout}).` }, 409);
    const feeds = await Promise.all(importFeeds().map(fetchFeed));
    for (const f of feeds) for (const e of f.events)
      if (nightsBetween(e.start, e.end).some((n) => wanted.has(n)) && !body.force)
        return json({ error: `Overlaps an existing ${f.source} reservation (${e.start} to ${e.end}).` }, 409);

    const booking = { id: crypto.randomUUID(), checkin, checkout, name, note, created: new Date().toISOString() };
    list.push(booking);
    await saveDirectBookings(list);
    return json({ booking });
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    const list = await getDirectBookings();
    const next = list.filter((b) => b.id !== id);
    if (next.length === list.length) return json({ error: "Booking not found." }, 404);
    await saveDirectBookings(next);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed." }, 405);
};

export const config = { path: "/api/bookings" };
