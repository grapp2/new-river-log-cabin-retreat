# New River Log Cabin Retreat: website setup

This folder is the complete website for **newriverlogcabinretreat.com**. It runs on Netlify's free plan. Setup takes about 30 minutes and is a one-time job.

## What's inside

| File | What it does |
|---|---|
| `index.html` | The public site: photos, About, availability calendar, inquiry form |
| `admin.html` | Your private owner page for adding direct bookings |
| `images/` | All the cabin photos |
| `netlify/functions/` | The behind-the-scenes code: reads your Airbnb/VRBO calendars, stores direct bookings, publishes your calendar link |

## 1. Put the site on Netlify

1. Create a free account at **github.com**, then make a new repository called `new-river-log-cabin-retreat`.
2. On the repository page, choose **Add file → Upload files** and drag in everything from this folder (`index.html`, `admin.html`, `netlify.toml`, `package.json`, and the `images` and `netlify` folders).
3. Create a free account at **netlify.com** and sign in with GitHub.
4. Choose **Add new project → Import an existing project → GitHub** and pick the repository. Leave the build settings as they are and click **Deploy**.

## 2. Add your settings (environment variables)

In Netlify open **Project configuration → Environment variables** and add:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | A password you choose for the owner page |
| `AIRBNB_ICAL_URL` | Your Airbnb **export** calendar link (see below) |
| `VRBO_ICAL_URL` | Your VRBO **export** calendar link (see below) |

**Getting the links:**

- **Airbnb:** Calendar → Availability → Connect calendars (or "Sync calendars") → **Export calendar** → copy the link.
- **VRBO:** Calendar → **Import & export** → Export calendar → copy the link.

After adding them, go to **Deploys → Trigger deploy** so the site picks them up.

## 3. Get inquiry emails

1. In Netlify open **Forms** and click **Enable form detection**, then redeploy once.
2. Open **Project configuration → Notifications → Emails and webhooks → Form submission notifications → Add notification → Email notification**.
3. Enter `grapp@newriverlogcabinretreat.com` and choose the form named **inquiry**.

Every inquiry then arrives in your inbox with the guest's dates, number of guests, contact details and message. Submissions are also saved under **Forms** in Netlify.

## 4. Send your direct bookings to Airbnb and VRBO

Your site publishes its own calendar link:

**https://newriverlogcabinretreat.com/calendar.ics**

Paste it into each platform once:

- **Airbnb:** Calendar → Availability → Connect calendars → **Import calendar** → paste the link, name it "Direct bookings".
- **VRBO:** Calendar → Import & export → **Import a calendar** → paste the link.

From then on, whenever you add a booking on your owner page, those dates get blocked on Airbnb and VRBO too. Each platform re-checks the link on its own schedule (usually every few hours), so block the dates by hand there as well if a direct booking is for the next day or two.

## 5. Connect your domain

In Netlify open **Domain management → Add a domain** and enter `newriverlogcabinretreat.com`. Netlify shows you one or two DNS records to add.

**Important:** your email (`grapp@newriverlogcabinretreat.com`) runs on this domain. Add only the records Netlify asks for at your current domain provider, and don't change your nameservers or delete any MX records, or your email could stop working.

## Using it day to day

1. A guest sends an inquiry. You get an email.
2. You reply, agree on the price with the 10% discount, and take payment however you prefer.
3. Open **newriverlogcabinretreat.com/admin.html**, sign in with your `ADMIN_PASSWORD`, and add the booking. The dates are blocked on your site right away and on Airbnb and VRBO at their next sync.

The owner page also shows whether your Airbnb and VRBO calendars are loading correctly.

## Good to know

- The calendar on the site refreshes from Airbnb and VRBO about every 15 minutes.
- Guest names and notes you enter on the owner page stay private. The calendar link only says "Reserved".
- The QR code in the guest binder points to `https://newriverlogcabinretreat.com/#book`, which opens straight to the booking calendar.
