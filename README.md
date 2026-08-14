# MoneyMgr — Personal Finance Manager

A personal finance web app for tracking day-to-day transactions, analyzing spending, managing categories, exporting records, and monitoring investments (stock trades, stock capital, crypto/coin, and SIP). Built with **Next.js** and **Material UI**, with a light/dark theme, shared form/dialog patterns, and a THB-first workflow with NPR conversion where it matters.

![Transaction Dashboard](https://github.com/user-attachments/assets/a019d9b6-29ec-496b-a30f-208f7873665d)

## Tech stack

| Layer | Technologies |
|--------|----------------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | React 19, [MUI](https://mui.com/) 7, Emotion, styled-components |
| Data fetching | [TanStack Query](https://tanstack.com/query) v5 |
| Charts | [Highcharts](https://www.highcharts.com/) (analysis, SIP donut), Recharts (portfolio & investments) |
| Dates | Day.js, MUI X Date Pickers |
| Export | jsPDF, jspdf-autotable |
| Feedback | react-hot-toast |
| Types | TypeScript (`app/types/index.ts`) alongside JS/JSX components |

This is a **frontend-only** app. All data is served by external REST APIs configured through `NEXT_PUBLIC_API_URL*` environment variables; there are no Next.js API routes in the repo.

## Features

### Home — transactions (`/pages/home`)

- Floating action button opens a themed add-transaction dialog: type selector (Income/Expense), date & time picker, Cash/Online account, category chips filtered by type, amount in THB, optional note
- Client-side validation — amount must be greater than 0 and a category must be selected
- Quick-add a new category directly from the transaction form
- Month/year selector (±5 years) driving a day-grouped transaction list with per-day income and expense totals
- Summary cards for **Income**, **Expense**, and **Net**
- Search and filter bar:
  - free-text search across category and note
  - type filter (All / Income / Expense)
  - account filter (All / Cash / Online)
  - sort by date or amount, ascending or descending
  - removable "filters applied" chips, and an empty state that explains when results are filtered out
- Inline edit and delete dialogs for every transaction
- Real-time refresh after adds via a `transactions:changed` window event plus React Query invalidation

### Analysis (`/pages/analysis`)

- Three view modes: **Monthly**, **Yearly**, and **View All** (all-time)
- **Currency switch THB ⇄ NPR** with a selectable exchange rate (3.9 – 5.5 NPR per THB) applied to every stat, chart, tooltip, and axis label
- Header stats: Income, Expense, Net Balance for the selected view
- Charts:
  - Expense and Income donut splits (category breakdown)
  - Top 10 Expense and Top 10 Income categories as ranked horizontal bars
  - Monthly income vs expense column chart for a chosen year
  - Monthly net (income − expense) areaspline
  - Cumulative net (year to date) areaspline
- All charts read colors from the active MUI theme, so they render correctly in both light and dark mode

![Analysis Dashboard](https://github.com/user-attachments/assets/7dbf82f1-dea1-456a-9b6c-b115ac4621a7)

### Categories (`/pages/categories`)

- Separate **Income** and **Expense** category lists with live search
- Add categories (name + type) and delete them with a confirmation dialog
- Summary stat cards: total, income count, expense count
- Shared dialog UI from `InvestmentFormUi`

![Category Management](https://github.com/user-attachments/assets/5d6b5b74-6814-4e54-bb55-9b669729796b)

### Export (`/pages/exportinfo`)

- Date range picker with quick-range chips (Last 7d / 30d / 90d)
- Optional single-category filter, or export everything
- Live preview before download: transaction count, income total, expense total, and the first five rows
- **CSV export** (UTF-8 BOM, quote-escaped) and **PDF export** (jsPDF + autotable, lazy-loaded, with a totals header)
- Emoji prefixes are stripped from legacy category names in both output formats

![Export Functionality](https://github.com/user-attachments/assets/12c73b70-1e8a-408a-a584-e47e8ba4ec48)

### Stock portfolio (`/pages/stocks`)

Per-trade stock tracking against its own API — separate from the capital tracker under Investments.

- Full CRUD on BUY/SELL trades, with symbol/name autocomplete drawn from existing trades
- Trades grouped into a collapsible accordion per stock symbol
- Portfolio-level metrics: total stocks, total transactions, Overall Invested, Current Invested, Total Sold, Overall P/L, plus a donut of capital at stake per symbol
- Per-symbol metrics: Avg Price, Total Bought, Sold, Remaining, Realized P/L, and latest buy/sell price chips
- Zero-holding positions are dimmed and sorted to the bottom
- **"Use For Avg" toggle** — each BUY row has a switch controlling whether it feeds the displayed **Avg Price**. Total Bought, Remaining, and P/L intentionally ignore the toggle and always use all trades. The update request tries `PUT` and falls back to `PATCH`.

### Investments (`/pages/investments`)

Tabbed hub for three trackers:

| Tab | Purpose |
|-----|---------|
| **Stock** | NPR capital contributions. CRUD, stat cards (total invested, average per entry, last investment), yearly bar chart, and an "Investment Momentum" area+line chart of monthly contributions vs running total |
| **Coin** | BHT amounts plus transaction charges. CRUD, selectable **BHT→NPR rate (4.1 – 5.2)** reflected in stat cards, chart tooltips, and a dedicated NPR table column; yearly bar chart |
| **SIP** | Mutual fund SIP entries (Nabil / NIC). CRUD, stacked bar by year & fund, donut distribution by fund, and a full transaction table |

The SIP tab also includes a standalone **SIP returns calculator**: enter monthly contribution, expected annual return rate, and duration to get total invested, estimated returns, maturity value, and a yearly invested-vs-returns bar chart.

Shared investment form components: dialog headers, inset panels, themed buttons, and delete confirmation dialogs.

## Theming

- **Light and dark mode** with a toggle in the desktop sidebar and the mobile speed dial (`ThemeContext` + `MuiThemeProvider`)
- Dark is the default. The choice is held in React state and resets on reload — it is not persisted yet
- Dark palette: background `#0f1115`, paper `#1e222a`, primary blue `#64b5f6`, semantic green/red for income/expense
- Light palette: background `#f5f7fa`, paper `#ffffff`, primary blue `#1976d2`

## Design system

Central styling lives under `app/`:

- **`themeStyles.js`** — Design tokens (`colors`, `gradients`), card/dialog/button styles, chart palettes, `statCardSx`, `investmentChartColors`
- **`MuiThemeProvider.jsx`** — Builds the MUI theme for both modes with component overrides
- **`context/ThemeContext.jsx`** — `ThemeModeProvider` and the `useThemeMode` hook
- **`navConfig.js`** — Unified primary-blue navigation shared by the sidebar and speed dial
- **`InvestmentFormUi.jsx`** — Reusable dialog header, form shell, delete dialog, and `accentFieldSx` (used by investments, categories, and transactions)

## Navigation & layout

| Route | Page |
|-------|------|
| `/` | Redirects to `/pages/home` |
| `/pages/home` | Transaction dashboard |
| `/pages/analysis` | Financial analysis & charts |
| `/pages/exportinfo` | Data export |
| `/pages/categories` | Category management |
| `/pages/stocks` | Stock portfolio (per-trade) |
| `/pages/investments` | Stock / Coin / SIP investments |

- **Desktop (≥ md):** fixed 240px sidebar (`Navbar`) with the theme toggle at the bottom
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
│   │   ├── stocksComp/         # StocksPage
│   │   ├── transactions/       # TransactionView, AddTransaction
│   │   └── Homepage.jsx
│   ├── context/                # ThemeContext (light/dark mode)
│   ├── pages/                  # App Router routes (home, analysis, …)
│   ├── services/               # React Query hooks
│   ├── types/                  # Shared TypeScript interfaces
│   ├── constant/
│   ├── theme.js
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
- Backend API(s) for transactions, categories, and investments (see environment variables)

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
# Core transactions & categories
NEXT_PUBLIC_API_URL=https://your-api.example.com

# Investment / stock APIs (as used by your backend)
NEXT_PUBLIC_API_URL_STOCK_CAPITAL=https://your-api.example.com
NEXT_PUBLIC_API_URL_COIN_CAPITAL=https://your-api.example.com
NEXT_PUBLIC_API_URL_STOCK=https://your-api.example.com
```

| Variable | Used for |
|----------|----------|
| `NEXT_PUBLIC_API_URL` | Transactions, categories, analysis, and export report endpoints |
| `NEXT_PUBLIC_API_URL_STOCK_CAPITAL` | Stock capital investments and SIP |
| `NEXT_PUBLIC_API_URL_COIN_CAPITAL` | Coin/crypto investment entries |
| `NEXT_PUBLIC_API_URL_STOCK` | Stock portfolio / per-trade page |

Transaction, category, analysis, and export requests use `credentials: "include"` for cookie-based auth. The investment and stock-portfolio APIs are called without credentials.

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
- `PUT /api/data/:id`, `DELETE /api/data/:id`
- `GET /api/data/:year/:month`
- `GET /api/dataPerYear/:year` → `{ data: { IncomeArray, ExpensesArray } }`
- `GET /api/dataAnalysis/:year[/:month]` and `GET /api/dataReportAll` → `{ incomeTypes, expenseTypes }`
- `GET /api/data/report?startDate=&endDate=[&category=]`
- `GET /api/category`, `POST /api/category`, `DELETE /api/category/:id`

**`NEXT_PUBLIC_API_URL_STOCK_CAPITAL`**
- `GET/POST /capital`, `PUT/DELETE /capital/:id`
- `GET/POST /sip-capital`, `PUT/DELETE /sip-capital/:id`

**`NEXT_PUBLIC_API_URL_COIN_CAPITAL`**
- `GET/POST /coin-capital`, `PUT/DELETE /coin-capital/:id`

**`NEXT_PUBLIC_API_URL_STOCK`**
- `GET/POST /transactions`, `PUT/DELETE /transactions/:id`
- `PUT` (or `PATCH`) `/transactions/use-for-avg-price/:id` with `{ useForAvgPrice: boolean }`

Exact contracts are defined by your backend repository.

## Known gaps / not wired up

- Theme choice is not persisted across page reloads
- `app/services/categoryMapping.js` (canonical category matching), `useMonthlyTransactions` in `app/services/useTransactionServices.ts`, and `MockDataTransactions` in `app/constant/constant.js` are currently unused by any component

## Author

Developed by [RohanPrasadGupta](https://github.com/RohanPrasadGupta)
