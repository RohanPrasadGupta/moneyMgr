# MoneyMgr — Personal Finance Manager

A personal finance web app for tracking day-to-day transactions, analyzing spending, managing categories and currencies, keeping sticky notes, exporting records, and monitoring investments (stock trades, stock capital, crypto/coin, and SIP). Built with **Next.js** and **Material UI**, with a light/dark theme, a shared vibrant-gradient design language across every page, and multi-currency support (THB and NPR today, extensible via a managed currency list).

![Transaction Dashboard](https://github.com/user-attachments/assets/a019d9b6-29ec-496b-a30f-208f7873665d)

## Tech stack

| Layer | Technologies |
|--------|----------------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | React 19, [MUI](https://mui.com/) 7 (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`), Emotion, styled-components |
| Data fetching | [TanStack Query](https://tanstack.com/query) v5 |
| Charts | [Highcharts](https://www.highcharts.com/) + `highcharts-react-official` (analysis, SIP, gauges), Recharts (portfolio & investment overview) |
| Dates | Day.js, `date-fns`, MUI X Date Pickers |
| Export | jsPDF, jspdf-autotable |
| Feedback | react-hot-toast |
| Types | TypeScript (`app/types/index.ts`, `app/services/*.ts`) alongside JS/JSX components |

This is a **frontend-only** app — there are no Next.js API routes in the repo. It talks to two independent, sibling Express/Mongoose backends over REST, configured through `NEXT_PUBLIC_API_URL*` environment variables:

- **`moneyMgrBackend`** — transactions, categories, the managed currency list, and sticky notes (`NEXT_PUBLIC_API_URL`)
- **`stock_analysis_backend`** — the per-trade stock ledger, and stock/coin/SIP investment capital (`NEXT_PUBLIC_API_URL_STOCK`, `NEXT_PUBLIC_API_URL_STOCK_CAPITAL`, `NEXT_PUBLIC_API_URL_COIN_CAPITAL`)

There is **no authentication** anywhere in the stack — this is a single-user app by design.

## Multi-currency model

- **THB is the default currency** everywhere except stock/SIP capital, which defaults to **NPR**.
- **Coin investments are always THB** — there is no currency selector on the Coin form; the backend fixes it to `"THB"`. The existing manual **BHT → NPR exchange-rate** display feature (selectable rate, applied to stat cards, chart tooltips, and a dedicated NPR table column) is unaffected by the multi-currency system and stays a separate, purely cosmetic conversion.
- Every other place a currency can be set (categories, transactions, stock capital, SIP capital, the stock ledger) has a real currency dropdown, sourced from a single shared list fetched from `moneyMgrBackend`'s `/api/currency` endpoint (`app/services/useCurrencyServices.ts`) — even from pages that otherwise talk to `stock_analysis_backend`. That backend never needs to know the currency list exists; it just stores whatever code string the frontend sends.
- **Currency badges**: transaction rows render a MUI `Badge` showing the record's currency (`currencyBadgeSx` in `themeStyles.js`), so mixed-currency history stays legible at a glance.
- **Manage Currencies**: the Categories page includes a small CRUD UI for the currency list itself (add / edit / delete, mark one as default) on top of the read-only dropdowns everywhere else.
- Sticky **notes** are not currency-aware — they are free-form title + body reminders stored on `moneyMgrBackend`.
- Because Mongoose `default` only applies to newly-created documents, records saved before the `currency` field existed simply don't have it — the frontend always falls back gracefully (`|| "THB"` for moneyMgrBackend data, `|| "NPR"` for stock/SIP data, `|| "THB"` for Coin) rather than crashing on legacy rows.
- **Out of scope by design**: there's no live FX conversion or per-currency subtotal breakdown — totals across the app (day/month totals, portfolio totals) naively sum `amount` regardless of currency.

## Features

### Home — transactions (`/pages/home`)

- Floating action button opens a themed add-transaction dialog: type selector (Income/Expense), date & time picker, Cash/Online account, category chips filtered by type, a currency dropdown (defaults from the selected category's own currency, freely overridable), amount, and an optional note
- Client-side validation — amount must be greater than 0 and a category must be selected
- Quick-add a new category directly from the transaction form
- Dropdown-only month/year selector (no prev/next stepper) driving a day-grouped transaction list with per-day income and expense totals, rendered as dense bordered cards
- Summary cards for **Income**, **Expense**, and **Net**
- Every row shows its currency as a MUI `Badge` on the type-icon avatar
- Search and filter bar:
  - free-text search across category and note
  - type filter (All / Income / Expense)
  - account filter (All / Cash / Online)
  - sort by date or amount, ascending or descending
  - removable "filters applied" chips, and an empty state that explains when results are filtered out
- Inline edit and delete dialogs for every transaction (edit includes the currency dropdown, always defaulted to the row's existing currency)
- Real-time refresh after adds via a `transactions:changed` window event plus React Query invalidation

### Analysis (`/pages/analysis`)

- Three view modes: **Monthly**, **Yearly**, and **View All** (all-time), plus a THB ⇄ NPR display toggle with a selectable exchange rate, applied to every stat, chart, tooltip, and axis label
- Vibrant gradient KPI header cards (Income / Expense / Net Balance / Savings Rate) with fixed-width grid tracks that widen on larger screens without reflowing as values change length
- A **savings-rate radial gauge** with a colored threshold legend (Overspending / Low buffer / Healthy savings)
- Charts:
  - Expense and Income donut splits (category breakdown), using the app's saturated chart palette
  - Top 10 Expense and Top 10 Income categories as ranked horizontal bars, each bar its own vivid hue
  - **Top categories — 12 month trend**: a stacked area chart of the biggest expense categories over the trailing year, computed independently of the period filter above
  - Monthly income vs expense column chart for a chosen year
  - Monthly net (income − expense) and cumulative net (year to date) areaspline charts
- Every section header uses a small gradient icon-avatar + title pattern, consistent across the whole app
- All charts read colors from the active MUI theme (and a mode-aware chart-color helper), so they render correctly in both light and dark mode

![Analysis Dashboard](https://github.com/user-attachments/assets/7dbf82f1-dea1-456a-9b6c-b115ac4621a7)

### Categories (`/pages/categories`)

- Unified, searchable category list (not split into separate panels) with clickable filter stat cards (All / Income / Expense) that double as summary counts
- Each row shows its type and currency as `InvestmentStatCard`-style badges, with a per-row pending spinner while a mutation is in flight
- Add, **edit**, and delete categories (name, type, and currency), with a confirmation dialog for deletes
- **Manage Currencies** panel: add/edit/delete entries in the shared currency list and mark one as the default

![Category Management](https://github.com/user-attachments/assets/5d6b5b74-6814-4e54-bb55-9b669729796b)

### Notes (`/pages/notes`)

Pinned reminders and details, presented as a sticky-note board rather than a table.

- Desktop sidebar and mobile speed dial both include a **Notes** item (sticky-note icon)
- Colored sticky cards (pin, ruled paper, slight tilt) in a responsive grid, with search across title and body
- **Add Note** opens a large sticky-note editor; **title and body are both required** — the save button stays disabled until both are filled, and empty saves are rejected with a toast
- Tap a card to open it for editing: the page fetches the latest copy via `GET /api/getNote/:id`, then saves with `PUT /api/updateNote/:id` (again requiring both title and content)
- Delete from the card or from the open sticky, using the shared confirmation dialog (`InvestmentDeleteDialog`)
- Loading, error, and empty states match the rest of the app; create / update / delete surface success and failure toasts
- Notes API is unauthenticated; write calls send `Content-Type: application/json` (no `credentials`)

### Export (`/pages/exportinfo`)

- Vibrant gradient header with KPI cards (Transactions / Income / Expense) for the currently filtered range
- Pill quick-range toggle (Last 7d / 30d / 90d) plus manual start/end date pickers and an optional single-category filter
- Live preview before download: transaction count and the first five rows, each with a currency badge
- **CSV export** (UTF-8 BOM, quote-escaped) and **PDF export** (jsPDF + autotable, lazy-loaded, with a totals header)
- Emoji prefixes are stripped from legacy category names in both output formats

![Export Functionality](https://github.com/user-attachments/assets/12c73b70-1e8a-408a-a584-e47e8ba4ec48)

### Stock portfolio (`/pages/stocks`)

Per-trade stock tracking against its own API — separate from the capital tracker under Investments.

- Full CRUD on BUY/SELL trades, with symbol/name autocomplete drawn from existing trades and a currency dropdown (defaults NPR)
- Trades grouped into a collapsible accordion per stock symbol
- Portfolio-level metrics: total stocks, total transactions, Overall Invested, Current Invested, Total Sold, Overall P/L, plus a donut of capital at stake per symbol
- Per-symbol metrics: Avg Price, Total Bought, Sold, Remaining, Realized P/L, and latest buy/sell price chips
- Zero-holding positions are dimmed and sorted to the bottom
- **"Use For Avg" toggle** — each BUY row has a switch controlling whether it feeds the displayed **Avg Price**. Total Bought, Remaining, and P/L intentionally ignore the toggle and always use all trades. The update request tries `PUT` and falls back to `PATCH`.

### Investments (`/pages/investments`)

A tabbed hub — **Overview** (default), **Stock**, **Coin**, **SIP** — where selecting a tracker tab shows only that tracker's own charts and data (Overview is not shown underneath).

| Tab | Purpose |
|-----|---------|
| **Overview** | Portfolio-wide dashboard: stat strip (Stock/SIP/NPR-combined/Coin totals), an NPR allocation donut (Stock + SIP, same-currency combination only), a 12-month stacked area trend of capital added, a proportional "entries by type" bar, and a merged Recent Activity feed across all three trackers |
| **Stock** | NPR capital contributions. Glass stat-strip cards (total invested, average per entry, last investment), a yearly bar chart, and an "Investment Momentum" area+line chart of monthly contributions vs running total |
| **Coin** | BHT amounts plus transaction charges — currency fixed to THB, no dropdown. Glass stat-strip cards, a selectable **BHT→NPR rate** reflected in stat cards, chart tooltips, and a dedicated NPR table column; yearly bar chart |
| **SIP** | Mutual fund SIP entries (Nabil / NIC), NPR by default. Glass stat-strip cards, a stacked bar by year & fund, a donut distribution by fund, and a full transaction table — fund colors are theme-adaptive, softened tints rather than raw neon |

The SIP tab also includes a standalone **SIP returns calculator**: enter monthly contribution, expected annual return rate, and duration to get total invested, estimated returns, maturity value, and a yearly invested-vs-returns bar chart.

Every sub-tab shares one `InvestmentStatCard` component and a common softened, mode-adaptive color system, so stat cards look like one connected strip rather than mismatched boxes. Other shared investment form pieces: dialog headers, inset panels, themed pill buttons, and delete confirmation dialogs, all in `InvestmentFormUi.jsx`.

## Theming

- **Light and dark mode** with a toggle in the desktop sidebar and the mobile speed dial (`ThemeContext` + `MuiThemeProvider`)
- Dark is the default. The choice is held in React state and resets on reload — it is not persisted yet
- Dark palette: background `#0f1115`, paper `#1e222a`, primary blue `#64b5f6`, semantic green/red for income/expense
- Light palette: background `#f5f7fa`, paper `#ffffff`, primary blue `#1976d2`; error/success `main` colors use the same "Dark" tint as the dark palette so charts and badges stay legible instead of glowing on a white background
- Chart color helpers (`investmentChartColors`, per-page `chartAxisColor`/`chartGridColor`) are **mode-aware functions**, not static objects, so axis/grid/legend colors and chart accents adapt correctly when the mode is toggled

## Design system

Central styling lives under `app/`:

- **`themeStyles.js`** — single source of design tokens: `colors`, `gradients`, `chartPalette`/`chartPieGradients` (real hex values for Recharts/Highcharts, which can't consume MUI theme paths), card/dialog/button `sx` presets, `statCardSx(variant, mode)`, `investmentChartColors(mode)`, `currencyBadgeSx(code)`
- **`MuiThemeProvider.jsx`** — builds full MUI themes for both light and dark modes via `createTheme`, with component style overrides
- **`context/ThemeContext.jsx`** — `ThemeModeProvider` and the `useThemeMode` hook
- **`navConfig.js`** — unified navigation config shared by the sidebar and speed dial
- **`InvestmentFormUi.jsx`** — reusable dialog header, form shell, delete dialog, `InvestmentStatCard`, and `accentFieldSx` (used by investments, categories, transactions, and notes delete confirm)
- Design language conventions used across every page: pill-shaped buttons/toggles/badges (`borderRadius: "999px"`), glass stat cards with a colored top accent bar, gradient icon-avatar section headers, and vibrant gradient KPI cards on dashboard-style pages (Analysis, Export)

## Navigation & layout

| Route | Page |
|-------|------|
| `/` | Redirects to `/pages/home` |
| `/pages/home` | Transaction dashboard |
| `/pages/analysis` | Financial analysis & charts |
| `/pages/exportinfo` | Data export |
| `/pages/categories` | Category & currency management |
| `/pages/notes` | Sticky notes (add / view / edit / delete) |
| `/pages/stocks` | Stock portfolio (per-trade) |
| `/pages/investments` | Overview / Stock / Coin / SIP investments |

- **Desktop (≥ md):** fixed sidebar (`Navbar`) with pill nav items, icon avatars, and the theme toggle at the bottom
- **Mobile/tablet:** floating speed-dial navigation (`SpeedDialNavbar`) with its own theme toggle
- All page content is wrapped in a class-based `ErrorBoundary` with a "Try Again" recovery button
- Every page has explicit loading, error, and empty states; toasts provide feedback on mutations

## Project structure

```
moneyMgr/
├── app/
│   ├── components/
│   │   ├── analysisComp/       # AnalysisPage
│   │   ├── categoryComp/       # CategoryPage
│   │   ├── common/             # ErrorBoundary
│   │   ├── exportPage/         # ExportPage
│   │   ├── header/             # TitleHeader
│   │   ├── investmentsComp/    # InvestmentsPage, Stock/Coin/SIP, InvestmentFormUi
│   │   ├── navbar/             # Navbar, SpeedDialNavbar
│   │   ├── notesComp/          # NotesPage (sticky-note board + editor)
│   │   ├── stocksComp/         # StocksPage
│   │   ├── transactions/       # TransactionView, AddTransaction
│   │   └── Homepage.jsx
│   ├── context/                # ThemeContext (light/dark mode)
│   ├── pages/                  # App Router routes (home, analysis, notes, …)
│   ├── services/               # React Query hooks (categories, currencies, transactions, notes)
│   ├── types/                  # Shared TypeScript interfaces
│   ├── constant/
│   ├── themeStyles.js
│   ├── navConfig.js
│   ├── layout.js               # Root layout + Toaster
│   └── MuiThemeProvider.jsx
├── public/
├── next.config.mjs
└── package.json
```

## Getting started

### Prerequisites

- Node.js 18+
- npm
- Both backend APIs running (see [Environment variables](#environment-variables)) — `moneyMgrBackend` for transactions/categories/currencies/notes, `stock_analysis_backend` for the stock ledger and investment capital

### Install and run

```bash
git clone https://github.com/RohanPrasadGupta/moneyMgr.git
cd moneyMgr
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal).

### Production build

```bash
npm run build
npm start
```

## Environment variables

Create a `.env.local` in the project root (not committed). Example:

```env
# moneyMgrBackend — transactions, categories, currencies, notes
NEXT_PUBLIC_API_URL=https://your-money-mgr-backend.example.com

# stock_analysis_backend — stock ledger, stock/SIP capital, coin capital
NEXT_PUBLIC_API_URL_STOCK=https://your-stock-analysis-backend.example.com
NEXT_PUBLIC_API_URL_STOCK_CAPITAL=https://your-stock-analysis-backend.example.com
NEXT_PUBLIC_API_URL_COIN_CAPITAL=https://your-stock-analysis-backend.example.com
```

| Variable | Backend | Used for |
|----------|---------|----------|
| `NEXT_PUBLIC_API_URL` | moneyMgrBackend | Transactions, categories, currencies, notes, analysis, and export report endpoints |
| `NEXT_PUBLIC_API_URL_STOCK` | stock_analysis_backend | Stock portfolio / per-trade page |
| `NEXT_PUBLIC_API_URL_STOCK_CAPITAL` | stock_analysis_backend | Stock capital investments and SIP |
| `NEXT_PUBLIC_API_URL_COIN_CAPITAL` | stock_analysis_backend | Coin/crypto investment entries |

`NEXT_PUBLIC_API_URL_STOCK`, `NEXT_PUBLIC_API_URL_STOCK_CAPITAL`, and `NEXT_PUBLIC_API_URL_COIN_CAPITAL` typically all point at the same `stock_analysis_backend` deployment — they're kept as separate variables because each corresponds to a different route prefix. Transaction/category/currency/analysis/export requests are sent with `credentials: "include"`; notes, investment, and stock-portfolio APIs are called without credentials.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Run production server |

## API surface (frontend expectations)

The UI expects REST-style endpoints such as:

**`NEXT_PUBLIC_API_URL`**
- `GET /api/data`, `POST /api/data`
- `GET /api/data/:id`, `PUT /api/data/:id`, `DELETE /api/data/:id`
- `GET /api/data/:year/:month`
- `GET /api/dataPerYear/:year` → `{ data: { IncomeArray, ExpensesArray } }`
- `GET /api/dataAnalysis/:year[/:month]` and `GET /api/dataReportAll` → `{ incomeTypes, expenseTypes }`
- `GET /api/data/report?startDate=&endDate=[&category=]`
- `GET /api/category`, `POST /api/category`, `PUT /api/category/:id`, `DELETE /api/category/:id`
- `GET /api/currency`, `POST /api/currency`, `PUT /api/currency/:id`, `DELETE /api/currency/:id`
- Notes (`Content-Type: application/json` on writes; no auth):
  - `GET /api/allnotes` → `{ message, data: Note[] }` (sorted by date desc)
  - `GET /api/getNote/:id` → `{ message, data: Note }`
  - `POST /api/addNote` with `{ title, content }` (optional `date`) → `201` `{ message, data: Note }`
  - `PUT /api/updateNote/:id` with `{ title?, content?, date? }` → `{ message, data: Note }`
  - `DELETE /api/deleteNote/:id` → `{ message: "note deleted successfully" }` (no `data` field)

  Note shape: `{ _id, title, content, date, __v }`. The UI always sends both `title` and `content` on create and update.

**`NEXT_PUBLIC_API_URL_STOCK_CAPITAL`**
- `GET/POST /capital`, `PUT/DELETE /capital/:id`
- `GET/POST /sip-capital`, `PUT/DELETE /sip-capital/:id`

**`NEXT_PUBLIC_API_URL_COIN_CAPITAL`**
- `GET/POST /coin-capital`, `PUT/DELETE /coin-capital/:id`

**`NEXT_PUBLIC_API_URL_STOCK`**
- `GET/POST /transactions`, `GET/PUT/PATCH/DELETE /transactions/:id`
- `PATCH /transactions/use-for-avg-price/:id` with `{ useForAvgPrice: boolean }`
- `GET /portfolio/summary`

Exact contracts are defined by the two backend repositories (`moneyMgrBackend`, `stock_analysis_backend`).

## Known gaps / not wired up

- Theme choice is not persisted across page reloads
- There's no true multi-currency aggregation — totals sum `amount` regardless of currency; adding live FX conversion or per-currency subtotal breakdowns is a possible future improvement
- `app/theme.js` is a legacy, dark-only static theme object superseded by `MuiThemeProvider.jsx` — not imported anywhere
- `app/services/categoryMapping.js` (canonical category matching), `useMonthlyTransactions` in `app/services/useTransactionServices.ts`, and `MockDataTransactions` in `app/constant/constant.js` are currently unused by any component

## Author

Developed by [RohanPrasadGupta](https://github.com/RohanPrasadGupta)
