"use client";

import React, { useMemo, useState } from "react";
import { Box, Typography, Paper, Stack, useMediaQuery, useTheme, CircularProgress } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import SavingsIcon from "@mui/icons-material/Savings";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import StockInvestmentPage from "./StockInvestmentPage";
import CoinInvestmentPage from "./CoinInvestmentPage";
import SipInvestmentPage from "./SipInvestmentPage";
import { InvestmentStatCard } from "./InvestmentFormUi";
import { themedCardSx, colors, investmentChartColors } from "../../themeStyles";

const STOCK_API = process.env.NEXT_PUBLIC_API_URL_STOCK_CAPITAL;
const COIN_API = process.env.NEXT_PUBLIC_API_URL_COIN_CAPITAL;

const SIP_COLOR_DARK = "#8e24aa";
const SIP_COLOR_LIGHT = "#ce93d8";

const fmtNPR = (n) => new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", minimumFractionDigits: 0 }).format(n || 0);
const fmtTHB = (n) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const InvestmentsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isLight = theme.palette.mode === "light";
  const investmentColors = investmentChartColors(theme.palette.mode);
  const [activeTab, setActiveTab] = useState(0);

  // Always the calmer "Dark" tint, in both themes — softer and less neon
  // than the punchier base tones.
  const stockColor = colors.errorDark;
  const coinColor = colors.primaryDark;
  const sipColor = isLight ? SIP_COLOR_DARK : SIP_COLOR_LIGHT;
  const warningColor = colors.warning;

  const TABS = [
    { key: "overview", label: "Overview", shortLabel: "Overview", icon: DashboardIcon, color: coinColor },
    { key: "stock", label: "Stock Investment", shortLabel: "Stock", icon: ShowChartIcon, color: stockColor },
    { key: "coin", label: "Coin Investment", shortLabel: "Coin", icon: CurrencyBitcoinIcon, color: warningColor },
    { key: "sip", label: "SIP Investment", shortLabel: "SIP", icon: SavingsIcon, color: sipColor },
  ];

  const { data: stockResp, isLoading: stockLoading } = useQuery({
    queryKey: ["capitalInvestments"],
    queryFn: async () => {
      const res = await fetch(`${STOCK_API}/capital`);
      if (!res.ok) throw new Error("Failed to fetch stock capital");
      return res.json();
    },
  });
  const { data: coinResp, isLoading: coinLoading } = useQuery({
    queryKey: ["coinInvestments"],
    queryFn: async () => {
      const res = await fetch(`${COIN_API}/coin-capital`);
      if (!res.ok) throw new Error("Failed to fetch coin capital");
      return res.json();
    },
  });
  const { data: sipResp, isLoading: sipLoading } = useQuery({
    queryKey: ["sipCapitalInvestments"],
    queryFn: async () => {
      const res = await fetch(`${STOCK_API}/sip-capital`);
      if (!res.ok) throw new Error("Failed to fetch SIP capital");
      return res.json();
    },
  });

  const stockRecords = stockResp?.data || [];
  const coinRecords = coinResp?.data || [];
  const sipRecords = sipResp?.data || [];

  const stockTotal = useMemo(() => stockRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0), [stockRecords]);
  const sipTotal = useMemo(() => sipRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0), [sipRecords]);
  const coinTotal = useMemo(
    () => coinResp?.summary?.grandTotal ?? coinRecords.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0),
    [coinResp, coinRecords]
  );
  const nprPortfolioTotal = stockTotal + sipTotal;

  const allocationData = useMemo(
    () =>
      [
        { name: "Stock", value: stockTotal, color: stockColor },
        { name: "SIP", value: sipTotal, color: sipColor },
      ].filter((d) => d.value > 0),
    [stockTotal, sipTotal, stockColor, sipColor]
  );

  const entryCountData = useMemo(
    () => [
      { name: "Stock", count: stockRecords.length, color: stockColor },
      { name: "Coin", count: coinRecords.length, color: warningColor },
      { name: "SIP", count: sipRecords.length, color: sipColor },
    ],
    [stockRecords.length, coinRecords.length, sipRecords.length, stockColor, sipColor, warningColor]
  );

  const monthlyTrend = useMemo(() => {
    const map = new Map();
    const addTo = (records, key) => {
      records.forEach((r) => {
        const d = new Date(r.date);
        if (Number.isNaN(d.getTime())) return;
        const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        const entry = map.get(mk) || { mk, label, stock: 0, sip: 0 };
        entry[key] += Number(r.amount || 0);
        map.set(mk, entry);
      });
    };
    addTo(stockRecords, "stock");
    addTo(sipRecords, "sip");
    return Array.from(map.values())
      .sort((a, b) => (a.mk > b.mk ? 1 : -1))
      .slice(-12);
  }, [stockRecords, sipRecords]);

  const recentActivity = useMemo(() => {
    const items = [
      ...stockRecords.map((r) => ({
        id: r._id,
        type: "Stock",
        color: stockColor,
        date: r.date,
        amount: Number(r.amount || 0),
        currency: r.currency || "NPR",
        formatter: fmtNPR,
      })),
      ...coinRecords.map((r) => ({
        id: r._id,
        type: "Coin",
        color: warningColor,
        date: r.date,
        amount: Number(r.totalAmount || 0),
        currency: r.currency || "THB",
        formatter: fmtTHB,
      })),
      ...sipRecords.map((r) => ({
        id: r._id,
        type: `SIP · ${r.name || ""}`,
        color: sipColor,
        date: r.date,
        amount: Number(r.amount || 0),
        currency: r.currency || "NPR",
        formatter: fmtNPR,
      })),
    ];
    return items
      .filter((i) => i.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);
  }, [stockRecords, coinRecords, sipRecords, stockColor, sipColor, warningColor]);

  const isOverviewLoading = stockLoading || coinLoading || sipLoading;
  const hasOverviewData = stockRecords.length > 0 || coinRecords.length > 0 || sipRecords.length > 0;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: "background.paper",
        position: "relative",
        overflowX: "hidden",
        overflowY: "visible",
      }}
    >
      {/* Subtle background accents */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(500px at 20% 20%, rgba(255,153,102,0.08), transparent), radial-gradient(500px at 80% 0%, rgba(255,94,98,0.06), transparent)",
        }}
      />

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          ...themedCardSx,
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,153,102,0.08), rgba(255,94,98,0.04))",
            opacity: 0.7,
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 1.5, sm: 2 },
              mb: { xs: 1.5, sm: 2 },
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(135deg, #ef5350, #e53935)",
                borderRadius: 2,
                p: { xs: 1, sm: 1.5 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 }, color: "#fff" }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: "text.primary", letterSpacing: 0.5, fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" } }}
              >
                Investments
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                Manage and monitor your investment portfolio
              </Typography>
            </Box>
          </Box>

          {/* Pill tabs */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {TABS.map((tab, idx) => {
              const active = activeTab === idx;
              return (
                <Box
                  key={tab.key}
                  component="button"
                  onClick={() => setActiveTab(idx)}
                  sx={{
                    all: "unset",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderRadius: "999px",
                    py: 1,
                    px: 2,
                    fontWeight: active ? 800 : 600,
                    fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    color: active ? "#fff" : "text.secondary",
                    bgcolor: active ? tab.color : alpha(tab.color, 0.08),
                    border: "1px solid",
                    borderColor: active ? tab.color : alpha(tab.color, 0.3),
                    boxShadow: active ? `0 6px 16px ${alpha(tab.color, isLight ? 0.3 : 0.4)}` : "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: active ? tab.color : alpha(tab.color, 0.16),
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <tab.icon sx={{ fontSize: 18, color: active ? "#fff" : tab.color }} />
                  {isMobile ? tab.shortLabel : tab.label}
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Paper>

      {/* Overview tab */}
      {activeTab === 0 && (
        <Paper
          elevation={0}
          sx={{
            ...themedCardSx,
            p: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: { xs: 2, sm: 3 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
            <PieChartOutlineIcon sx={{ color: coinColor, fontSize: 22 }} />
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Portfolio Overview
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Stock and SIP capital are both tracked in NPR, so they're combined below. Coin capital is tracked
                separately in THB and shown on its own.
              </Typography>
            </Box>
          </Stack>

          {isOverviewLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={36} sx={{ color: coinColor }} />
            </Box>
          ) : !hasOverviewData ? (
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>
              No investment records yet — add your first entry in any of the tabs above to see your portfolio overview.
            </Typography>
          ) : (
            <>
              {/* Stat strip */}
              <Stack
                direction="row"
                spacing={{ xs: 1.25, sm: 1.5 }}
                sx={{ mb: { xs: 2.5, sm: 3 }, overflowX: { xs: "auto", sm: "visible" }, pb: { xs: 0.5, sm: 0 }, "&::-webkit-scrollbar": { display: "none" } }}
              >
                <InvestmentStatCard label="Stock capital" value={fmtNPR(stockTotal)} sub={`${stockRecords.length} entries`} color={stockColor} icon={ShowChartIcon} />
                <InvestmentStatCard label="SIP capital" value={fmtNPR(sipTotal)} sub={`${sipRecords.length} entries`} color={sipColor} icon={SavingsIcon} />
                <InvestmentStatCard
                  label="NPR portfolio (Stock + SIP)"
                  value={fmtNPR(nprPortfolioTotal)}
                  color={coinColor}
                  icon={AccountBalanceIcon}
                />
                <InvestmentStatCard label="Coin capital (THB)" value={fmtTHB(coinTotal)} sub={`${coinRecords.length} entries · tracked separately`} color={warningColor} icon={CurrencyBitcoinIcon} />
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1.4fr" },
                  gap: { xs: 2.5, sm: 3 },
                  mb: { xs: 2.5, sm: 3 },
                }}
              >
                {/* Allocation donut */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    NPR allocation
                  </Typography>
                  {allocationData.length === 0 ? (
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No Stock or SIP capital recorded yet.
                    </Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={allocationData} cx="50%" cy="50%" innerRadius={62} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                          {allocationData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value) => fmtNPR(value)}
                          contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12 }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={32}
                          iconType="circle"
                          formatter={(value) => <span style={{ color: investmentColors.legend, fontSize: "0.8rem" }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Box>

                {/* Monthly trend */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Monthly capital added (last 12 months, NPR)
                  </Typography>
                  {monthlyTrend.length === 0 ? (
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No Stock or SIP contributions recorded yet.
                    </Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="stockTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={stockColor} stopOpacity={0.5} />
                            <stop offset="100%" stopColor={stockColor} stopOpacity={0.03} />
                          </linearGradient>
                          <linearGradient id="sipTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={sipColor} stopOpacity={0.5} />
                            <stop offset="100%" stopColor={sipColor} stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={investmentColors.grid} />
                        <XAxis dataKey="label" stroke={investmentColors.axis} tick={{ fill: investmentColors.axis, fontSize: 11 }} />
                        <YAxis
                          stroke={investmentColors.axis}
                          tick={{ fill: investmentColors.axis, fontSize: 11 }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                        />
                        <RechartsTooltip
                          formatter={(value, name) => [fmtNPR(value), name === "stock" ? "Stock" : "SIP"]}
                          contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 12 }}
                        />
                        <Legend formatter={(v) => (v === "stock" ? "Stock" : "SIP")} />
                        <Area type="monotone" dataKey="stock" stackId="1" stroke={stockColor} fill="url(#stockTrendFill)" strokeWidth={2} />
                        <Area type="monotone" dataKey="sip" stackId="1" stroke={sipColor} fill="url(#sipTrendFill)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1.4fr" },
                  gap: { xs: 2.5, sm: 3 },
                }}
              >
                {/* Entries by type */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                    Entries by type
                  </Typography>
                  <Stack spacing={2}>
                    {entryCountData.map((entry) => {
                      const maxCount = Math.max(...entryCountData.map((e) => e.count), 1);
                      const pct = Math.round((entry.count / maxCount) * 100);
                      return (
                        <Box key={entry.name}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={700}>
                              {entry.name}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ color: entry.color }}>
                              {entry.count}
                            </Typography>
                          </Stack>
                          <Box sx={{ height: 10, borderRadius: "999px", bgcolor: alpha(entry.color, 0.12), overflow: "hidden" }}>
                            <Box
                              sx={{
                                height: "100%",
                                width: `${pct}%`,
                                minWidth: entry.count > 0 ? "6px" : 0,
                                borderRadius: "999px",
                                background: entry.color,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>

                {/* Recent activity */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                    <HistoryIcon sx={{ fontSize: 17, color: "text.secondary" }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Recent activity
                    </Typography>
                  </Stack>
                  {recentActivity.length === 0 ? (
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No recent activity to show.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {recentActivity.map((item) => (
                        <Stack
                          key={`${item.type}-${item.id}`}
                          direction="row"
                          alignItems="center"
                          spacing={1.25}
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.default",
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              flexShrink: 0,
                              bgcolor: alpha(item.color, 0.14),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ArrowUpwardIcon sx={{ fontSize: 16, color: item.color }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.type}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {fmtDate(item.date)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={800} sx={{ color: item.color, flexShrink: 0 }}>
                            {item.formatter(item.amount)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Tab Content */}
      {activeTab === 1 && <StockInvestmentPage />}
      {activeTab === 2 && <CoinInvestmentPage />}
      {activeTab === 3 && <SipInvestmentPage />}
    </Box>
  );
};

export default InvestmentsPage;
