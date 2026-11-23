# Ledgerline: two-minute demo script

Goal: show a full-stack app with a clean API, a real data flow, and a designed interface. Keep it to about two minutes.

## Before you start

- Live site open in one tab, the GitHub repo in a second tab.
- Optional: the backend health check (`/api/health`) in a third tab.
- Your browser window at about 1280px wide, so the two-column layout shows.

## 0:00 to 0:20: What it is

**Show:** the dashboard, top of the page.

**Click:** nothing yet.

**Say:** "Ledgerline is an expense tracker I built in React and Express. It tracks income and spending in Rwandan francs. The frontend is on Netlify and the API is on Render. Everything you see is calculated on the server, and the browser only renders what it gets back."

## 0:20 to 0:45: The dashboard

**Show:** point at the balance card, then the three summary tiles, then the chart.

**Say:** "The balance card is the hero. The balance, and this month's income and expenses, come from one summary endpoint. The tiles count up when the data changes. The chart is an inline SVG with a smooth curve I calculate myself, so there is no chart library. It shows the running net for the last six months, and it has an empty state for a new account."

## 0:45 to 1:05: Add a transaction

**Click:** the **Income** pill, then **Expense** again to show the toggle.

**Click:** in the amount field and type `4500`. Pick **Transport** and type "Taxi to the airport" as the description.

**Click:** **Add transaction**.

**Say:** "Validation lives in two places. The form gives instant feedback, and the backend enforces the same rules. Watch: the toast confirms the save, the list and totals update from the server, and the form keeps the type and date but clears the rest."

## 1:05 to 1:25: Filter and delete

**Click:** **Income** in the Type filter. The list narrows.

**Click:** **Clear filters**.

**Click:** the trash icon on the test transaction, then **Yes**.

**Say:** "Filters go to the API as query parameters, so the server does the filtering. Deleting asks for confirmation inline, not with a browser alert. The row animates out and the summary is refetched, so the numbers always match the data."

## 1:25 to 1:45: Keyboard and responsiveness

**Click:** Tab through the form. Point out the blue focus ring.

**Resize:** narrow the window to phone width. The two columns become one, in this order: balance, tiles, form, chart, categories, filters, list.

**Say:** "Every control is a real button, label or select with a visible focus ring. Colour is never the only signal: income has a plus sign and expenses a minus. Animations turn off when the system asks for reduced motion."

## 1:45 to 2:00: How it is built, and what I would change

**Show:** the GitHub repo, then the README sections "Design decisions" and "Known limitations".

**Say:** "The backend is a small Express app with a JSON file store, validation in one module, and a single error handler that logs the real error and returns a safe message. The biggest limitation is the storage: a JSON file is fine for a demo, but Render's free disk resets on redeploy. The next step is SQLite behind the same store module, then authentication. The README lists every choice I made on my own."

## If something goes wrong during the demo

- **The first load is slow.** Render's free tier sleeps. Say so and wait, or load `/api/health` first to wake it.
- **The data reset.** Expected on free hosting. Say: "The seed data is in the repo, and the storage limitation is in the README."
- **A CORS error in the console.** Check that `CORS_ORIGIN` on Render matches the Netlify URL exactly, with no trailing slash.

## Questions you might get

- **Why not a database?** A file store keeps the setup to two commands. The `lib/store.js` module is the only place that touches storage, so swapping in SQLite changes one file.
- **Why does the server do the maths?** One source of truth. The list can be filtered, but the totals always cover all transactions.
- **How do you test it?** Every route was tested with curl, and the UI was checked at phone and desktop widths for overflow.
