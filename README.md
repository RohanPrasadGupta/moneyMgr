# MoneyMgr — Personal Finance Manager

A personal finance web app for tracking day-to-day transactions, analyzing spending, managing categories, exporting records, and monitoring investments (stock capital, crypto/coin, and SIP). Built with **Next.js** and **Material UI**, with a unified dark theme and shared form/dialog patterns across the app.

![Transaction Dashboard](https://github.com/user-attachments/assets/a019d9b6-29ec-496b-a30f-208f7873665d)

## Tech stack

| Layer | Technologies |
|--------|----------------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | React 19, [MUI](https://mui.com/) 7, Emotion, styled-components |
| Data fetching | [TanStack Query](https://tanstack.com/query) v5 |
| Charts | [Highcharts](https://www.highcharts.com/), Recharts (investments) |
| Dates | Day.js, MUI X Date Pickers |
| Export | jsPDF, jspdf-autotable |
| Feedback | react-hot-toast |

## Features

### Home — transactions

- Add income/expense transactions via a floating action button
- Themed add-transaction dialog: type toggle, date/time, Cash/Online account, category chips, amount (THB), optional note
- Quick-add category from the transaction form
- Monthly transaction list with edit/delete
- Real-time list refresh after adds (`transactions:changed` event + query invalidation)

### Analysis

- Monthly/yearly views with income vs expense breakdowns
- Highcharts column, area, and horizontal bar charts (theme hex colors for reliable rendering)
- Top income/expense categories
- Year-at-a-glance comparison and cumulative net charts
- Category name normalization for legacy emoji-prefixed labels (`categoryMapping.js`)

![Analysis Dashboard](https://github.com/user-attachments/assets/7dbf82f1-dea1-456a-9b6c-b115ac4621a7)

### Categories

- Separate **Income** and **Expense** category lists with search
- Add/delete categories with shared dialog UI (`InvestmentFormUi`)
- Summary stat cards (total, income count, expense count)

![Category Management](https://github.com/user-attachments/assets/5d6b5b74-6814-4e54-bb55-9b669729796b)

### Export

- Export transactions to **CSV** or **PDF** for a chosen date range
- Preview before export; PDF table layout via jsPDF-autotable

![Export Functionality](https://github.com/user-attachments/assets/12c73b70-1e8a-408a-a584-e47e8ba4ec48)

### Investments (`/pages/investments`)

Tabbed hub for three trackers:

| Tab | Purpose |
|-----|---------|
| **Stock** | NPR capital contributions over time; bar chart, stats, add/edit/delete |
| **Coin** | BHT amounts + transaction charges; BHT→NPR conversion rate selector; NPR column in table |
| **SIP** | Mutual fund SIP entries (Nabil / NIC); charts and fund-specific forms |

Shared investment form components: headers, inset panels, themed buttons, delete confirmation dialogs.

### Stock analysis (`/pages/stocks`)

- Dedicated stock trading/analysis page (separate API from investment capital tracking)

## Design system

Central styling lives under `app/`:

- **`themeStyles.js`** — Design tokens (`colors`, `gradients`), card/dialog/button styles, chart palettes, `statCardSx`, `investmentChartColors`
- **`theme.js`** — MUI theme (dark default, component overrides)
- **`navConfig.js`** — Unified primary-blue navigation for all routes
- **`InvestmentFormUi.jsx`** — Reusable dialog header, form shell, delete dialog, `accentFieldSx` (used by investments, categories, and transactions)

Default palette: dark background (`#0f1115`), paper surfaces (`#1e222a`), primary blue (`#64b5f6`), semantic green/red for income/expense.

## Navigation

| Route | Page |
|-------|------|
| `/pages/home` | Transaction dashboard |
| `/pages/analysis` | Financial analysis & charts |
| `/pages/exportinfo` | Data export |
| `/pages/categories` | Category management |
| `/pages/stocks` | Stock analysis |
| `/pages/investments` | Stock / Coin / SIP investments |

- **Desktop:** fixed sidebar (`Navbar`)
- **Mobile/tablet:** speed-dial navigation (`SpeedDialNavbar`)

## Project structure

```
moneyMgr/
├── app/
│   ├── components/
│   │   ├── analysisComp/       # AnalysisPage
│   │   ├── categoryComp/       # CategoryPage
│   │   ├── exportPage/         # ExportPage
│   │   ├── header/             # TitleHeader
│   │   ├── investmentsComp/    # Investments, Stock/Coin/SIP, InvestmentFormUi
│   │   ├── navbar/             # Navbar, SpeedDialNavbar
│   │   ├── stocksComp/         # StocksPage
│   │   ├── transactions/       # TransactionView, AddTransaction
│   │   └── Homepage.jsx
│   ├── pages/                  # App Router routes (home, analysis, …)
│   ├── services/               # React Query hooks, categoryMapping
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
| `NEXT_PUBLIC_API_URL` | Transactions (`/api/data`), categories (`/api/category`), analysis endpoints |
| `NEXT_PUBLIC_API_URL_STOCK_CAPITAL` | Stock investment capital & SIP |
| `NEXT_PUBLIC_API_URL_COIN_CAPITAL` | Coin/crypto investment entries |
| `NEXT_PUBLIC_API_URL_STOCK` | Stock analysis / trading page |

All fetches use `credentials: "include"` where applicable for cookie-based auth.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Run production server |

## API surface (frontend expectations)

The UI expects REST-style endpoints such as:

- `GET/POST /api/data`, `GET/PUT/DELETE /api/data/:id`
- `GET /api/data/:year/:month`, `GET /api/dataPerYear/:year`, analysis routes under `/api/dataAnalysis`, `/api/dataReportAll`
- `GET/POST /api/category`, `DELETE /api/category/:id`
- Investment endpoints on the dedicated `NEXT_PUBLIC_API_URL_*` bases (CRUD per investment type)

Exact contracts are defined by your backend repository.

## Possible future work

- Multi-currency support beyond THB / BHT display helpers
- Budget goals and recurring transactions
- User settings (default account, default category type)
- Backend/env documentation in-repo or OpenAPI spec
- Automated tests (unit/e2e)

## License

MIT — see [LICENSE](LICENSE).

## Author

Developed by [RohanPrasadGupta](https://github.com/RohanPrasadGupta)
