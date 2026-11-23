# Ledgerline

Ledgerline is a full-stack expense tracker for money in and money out, denominated in Rwandan Francs (RWF). Add income and expenses, filter them, see your balance, six-month net trend and spending by category. The React frontend is a static Netlify site; the Express API runs on Render and stores data in a JSON file.

<!-- Screenshot placeholder: add docs/screenshot.png and reference it here -->
![Ledgerline dashboard](docs/screenshot.png)

## Tech stack

- **Frontend:** React 18, Vite 5, plain CSS (design tokens in `index.css`), inline SVG chart. No UI or chart libraries.
- **Backend:** Node.js (ES modules), Express 4, cors, dotenv. Nodemon for development.
- **Storage:** `backend/data/transactions.json` via `fs/promises`.
- **Hosting:** Netlify (frontend), Render (backend).

## Local setup

Run the backend and the frontend in two separate terminals.

**Terminal 1: backend**

```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

The API runs at `http://localhost:4000`. Check it with `http://localhost:4000/api/health`.

**Terminal 2: frontend**

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

| App | Variable | Default | Purpose |
|---|---|---|---|
| backend | `PORT` | `4000` | Port the API listens on. Render sets this automatically. |
| backend | `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated list of allowed frontend origins. |
| frontend | `VITE_API_URL` | `http://localhost:4000/api` | Base URL of the API, including `/api`. |

Production values:

- `CORS_ORIGIN` on Render: your Netlify URL, for example `https://ledgerline-xyz.netlify.app` (no trailing slash).
- `VITE_API_URL` on Netlify: your Render URL plus `/api`, for example `https://ledgerline-api.onrender.com/api`.

## API reference

Base URL: `/api`. All bodies are JSON.

| Method | Route | Behavior | Success | Errors |
|---|---|---|---|---|
| GET | `/api/transactions` | List transactions, newest date first. Optional `type` (`income`, `expense`) and `category` filters. Invalid filter values are ignored. | `200` array | `500` |
| POST | `/api/transactions` | Create a transaction. Body: `type`, `amount`, `category`, `description`, `date`. | `201` saved transaction | `400` `{ "errors": [...] }`, `500` |
| DELETE | `/api/transactions/:id` | Delete a transaction. | `204` no body | `404` `{ "error": "Transaction not found" }`, `500` |
| GET | `/api/summary` | `totalIncome`, `totalExpenses`, `balance`, `byCategory` (expenses per category), `monthly` (last 6 months, oldest first, zero months included). | `200` object | `500` |
| GET | `/api/health` | Uptime check. | `200` `{ "ok": true }` | |

Unknown `/api` routes return `404` JSON. Malformed JSON bodies return `400`. Unexpected server errors return `500` `{ "error": "Something went wrong" }`; the real error is logged on the server only.

### Transaction shape

```json
{
  "id": "1793404800009",
  "type": "income",
  "amount": 1200000,
  "category": "Salary",
  "description": "November salary",
  "date": "2026-11-01",
  "createdAt": "2026-11-01T08:00:00.000Z"
}
```

Categories: `Food`, `Transport`, `Rent`, `Utilities`, `Salary`, `Other`. Amounts are whole RWF between 1 and 1,000,000,000.

## Deployment

### Backend on Render

1. In Render, choose **New > Web Service** and connect the `PAULRUSIBANA/Ledgerline` GitHub repository.
2. Set **Root Directory** to `backend`, **Build Command** to `npm install`, **Start Command** to `npm start`.
3. Add the environment variable `CORS_ORIGIN` with your Netlify URL.
4. Deploy. `backend/render.yaml` contains the same settings for Blueprint deploys.

### Frontend on Netlify

1. In Netlify, choose **Add new site > Import an existing project** and pick the GitHub repository.
2. Set **Base directory** to `frontend`, **Build command** to `npm run build`, **Publish directory** to `frontend/dist`. `frontend/netlify.toml` contains these and the SPA redirect.
3. Add the environment variable `VITE_API_URL` set to your Render URL plus `/api`.
4. Deploy.

### Redeploying

Both hosts deploy automatically when you push to `main`:

```powershell
git add -A
git commit -m "Describe the change"
git push origin main
```

## Project structure

```
Ledgerline/
├── backend/
│   ├── server.js                 Express app, CORS, error handling
│   ├── routes/transactions.js    All /api routes
│   ├── lib/store.js              Reads and writes data/transactions.json
│   ├── lib/validate.js           Validation rules
│   ├── data/transactions.json    Seed data (10 sample transactions)
│   ├── render.yaml               Render service definition
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── netlify.toml
│   ├── public/favicon.svg
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── index.css             Design tokens and base styles
│       ├── App.css               Layout and component styles
│       ├── api.js                All fetch calls
│       ├── hooks/useTransactions.js
│       ├── utils/format.js       RWF and date formatting
│       ├── utils/validate.js     Form validation (mirrors the backend)
│       └── components/           Header, BalanceCard, SummaryTiles, TrendChart,
│                                 CategoryBars, TransactionForm, FilterBar,
│                                 TransactionList, Toast, icons
├── DEMO.md                       Two-minute walkthrough for presenting
└── README.md
```

## Design decisions

- **Palette.** Charcoal surfaces, sand text and one electric blue accent. Blue marks interactive and active state only (primary button, chart, active filter, focus ring, live dot). Green and coral appear only on amounts and their small indicators, so the meaning of a colour never depends on hue alone: income has a `+`, expenses a `−`.
- **Typography.** Inter Tight for headings and numbers, Instrument Serif italic for one accent word per heading, Inter for body text, JetBrains Mono for labels, dates and amounts. Labels and tabular numbers in mono make columns scan easily.
- **The chart.** An inline SVG path with a monotone cubic curve (Fritsch-Carlson). The curve never overshoots the data, so a month with no activity cannot draw a false peak. The path is computed in the component; there is no chart library. The SVG uses `preserveAspectRatio="none"` so it fills the card at any width, with `vector-effect: non-scaling-stroke` keeping the line width constant, and the end-point marker is a positioned HTML element so it stays circular.
- **Why the backend does the calculations.** Totals, balances, monthly buckets and category sums come from `/api/summary`, computed from the one source of truth on the server. The frontend never re-sums its own list, so the summary stays correct even when a filter narrows the list shown. The frontend still validates input for fast feedback, but the server is the authority.

## Decisions I made

1. **Seed data.** 10 transactions across September to November 2026, covering all six categories and both types.
2. **Currency display.** `en-RW` renders the RWF symbol as `RF`, so amounts are shown as `RWF 1,200,000` using the ISO code, with no decimals. The balance card shows `RWF` as a separate unit label.
3. **Dates.** Shown as `DD MMM YYYY` (for example `23 Nov 2026`). Dates are parsed from their parts rather than through `Date` strings to avoid timezone shifts. "Future" means more than one day after today's UTC date.
4. **`byCategory`** counts expenses only and always includes all six category keys, so `Salary` is `0`. The spending chart shows the five expense categories.
5. **`monthly`** covers the current calendar month and the five before it, in UTC. The trend chart plots the running total of income minus expenses inside that window, starting from zero at the first month. It is therefore a six-month trend, not the all-time balance.
6. **Summary tiles.** The "Transactions" tile counts the rows currently shown, so it changes with filters. Totals always cover all transactions.
7. **Delete.** The row animates out for 240 ms, then the list updates optimistically. If the request fails, the list rolls back and a toast shows the error. After any add or delete, the list and summary are refetched.
8. **Form.** Validation runs on submit first and then live. The form keeps the chosen type and date after a successful add, resets the category to the type's default, and keeps every value after an error. The form's rules are duplicated in `frontend/src/utils/validate.js` to match the backend.
9. **Income and expense categories.** Expenses offer Food, Transport, Rent, Utilities, Other. Income offers Salary, Other. The backend accepts all six for either type, because the spec's validation rules did not restrict combinations.
10. **IDs.** `Date.now().toString()`, as the spec asked. Two requests within the same millisecond could collide. This is acceptable for a single-user demo and is listed under limitations.
11. **CORS.** Requests from origins not in `CORS_ORIGIN` are processed but receive no CORS headers, so browsers block them. Requests with no `Origin` header (curl, health checks) work normally.
12. **Malformed JSON** returns `400` with the same `errors` array as validation, rather than falling through to the `500` handler.
13. **Toast position.** Bottom centre on mobile and bottom right on desktop, as specified. The toast region is always in the DOM with `role="status"`, so screen readers announce each message.
14. **Reduced motion.** A global media query shortens all animations and transitions to effectively zero, and the count-up and pulse respect it.
15. **Render plan.** Free tier with `healthCheckPath: /api/health`. `render.yaml` sets `NODE_VERSION` to 20, and `package.json` declares `node >= 18`.
16. **Repository name.** `Ledgerline` with a capital L, used for the folder, the GitHub repository and the README.

## Known limitations

- **JSON file storage.** No database, and no locking. Two simultaneous writes can lose one of them. Fine for a single user, not for real traffic. The upgrade path is SQLite (for example `better-sqlite3`) behind the same `lib/store.js` interface, or Postgres when hosting moves off Render's free tier.
- **Ephemeral disk on Render's free tier.** `transactions.json` lives on the instance disk, so it resets on redeploy and when the free instance restarts. Data you add on the live site can disappear. The seed data returns on each deploy. Use a persistent disk (paid) or a database for real data.
- **No authentication.** Anyone with the URL can read, add and delete transactions. Do not store anything sensitive.
- **Single currency.** RWF only, with no decimals.
- **Cold starts.** Render's free tier sleeps after inactivity, so the first request after a pause can take 30 seconds or more.
- **ID collisions** are possible if two creates happen in the same millisecond.
