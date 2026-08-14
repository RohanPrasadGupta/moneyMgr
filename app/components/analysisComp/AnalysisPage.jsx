import {
  Box,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from "@mui/material";
import TitleHeader from "../header/TitleHeader";
import { alpha } from "@mui/material/styles";
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useCategoryQuery } from "../../services/useCategoryServices";
import { themedCardSx, chartColors, colors, insetPanelSx, gradients, chartPieGradients, chartPalette } from "../../themeStyles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SpeedIcon from "@mui/icons-material/Speed";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import CategoryIcon from "@mui/icons-material/Category";

const Months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Years = Array.from({ length: 10 }, (_, i) => 2029 - i);

const AnalysisPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chartHeight = isMobile ? 240 : 320;
  const netChartHeight = isMobile ? 260 : 340;
  const columnChartHeight = isMobile ? 280 : 320;
  const barCategoryHeight = isMobile ? 280 : 320;
  const pieColors = chartPalette;
  const pieDataLabelDist = isMobile ? 12 : 20;
  const pieInnerSize = isMobile ? "55%" : "60%";
  const isDark = theme.palette.mode === "dark";
  const chartAxisColor = theme.palette.text.secondary;
  const chartGridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const pieSliceBorder = theme.palette.background.paper;
  const pieDataLabelColor = theme.palette.text.primary;
  const pieConnectorColor = theme.palette.text.secondary;
  const sectionPaperSx = {
    ...themedCardSx,
    mb: { xs: 3, sm: 4 },
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: { xs: 2, sm: 4 },
    position: "relative",
    overflow: "hidden",
  };
  const now = dayjs();
  const [currentYear, setCurrentYear] = React.useState(now.year());
  const [currentMonth, setCurrentMonth] = React.useState(now.format("MMMM"));
  const [viewMode, setViewMode] = React.useState("monthly");
  const [barYear, setBarYear] = React.useState(now.year());
  const [barType, setBarType] = React.useState("Expense");
  const [selectedCurrency, setSelectedCurrency] = React.useState("THB");
  const [selectedExchangeRange, setSelectedExchangeRange] = React.useState("3.9");

  const exchangeRateOptions = React.useMemo(
    () =>
      Array.from({ length: 17 }, (_, i) => {
        const value = (3.9 + i * 0.1).toFixed(1);
        return { value, label: `${value} NPR` };
      }),
    []
  );

  const {
    isPending,
    data: transactionDetails,
    isError,
  } = useQuery({
    queryKey: ["getTransactionData", currentYear, currentMonth],
    queryFn: () =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data/${currentYear}/${currentMonth}`,
        { method: "GET", credentials: "include" }
      ).then((res) => res.json()),
    enabled: viewMode === "monthly" && Boolean(currentYear && currentMonth),
  });

   const {
    isPending:testLoading,
    data: testTransactionDetails,
    isError:testError,
    refetch: refetchYearly,
  } = useQuery({
    queryKey: ["getTransactionDataYearly", barYear],
    queryFn: () =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dataPerYear/${barYear}`,
        { method: "GET", credentials: "include" }
      ).then((res) => res.json()),
    enabled: Boolean(barYear),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

  // Get categories from backend API
  const { isPending: isPendingCategories, data: categoryData } =
    useCategoryQuery();

  // New aggregated analysis API for yearly/monthly by types
  const {
    isPending: isPendingAnalysis,
    data: analysisData,
    isError: isErrorAnalysis,
    refetch: refetchAnalysis,
  } = useQuery({
    queryKey: ["getDataAnalysis", viewMode, currentYear, currentMonth],
    queryFn: () => {
      if (viewMode === "all") {
        return fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dataReportAll`,
          { method: "GET", credentials: "include" }
        ).then((res) => res.json());
      }
      return fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dataAnalysis/${currentYear}${
          viewMode === "monthly" ? `/${currentMonth}` : ""
        }`,
        { method: "GET", credentials: "include" }
      ).then((res) => res.json());
    },
    enabled:
      viewMode === "all" ||
      (viewMode === "yearly" && Boolean(currentYear)) ||
      (viewMode === "monthly" && Boolean(currentYear && currentMonth)),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

  const { isPending: isPendingAllData, data: allTransactionData } = useQuery({
    queryKey: ["getAllTransactionData"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data`, {
        method: "GET",
        credentials: "include",
      }).then((res) => res.json()),
  });

  // If any other feature dispatches a global transactions change event, refresh this page's data
  useEffect(() => {
    const onTxChanged = () => {
      refetchAnalysis();
      refetchYearly();
    };
    window.addEventListener("transactions:changed", onTxChanged);
    return () => window.removeEventListener("transactions:changed", onTxChanged);
  }, [refetchAnalysis, refetchYearly]);

  const pieDataExpense = React.useMemo(() => {
    const sourceObj = analysisData?.expenseTypes ?? analysisData?.data?.expenseTypes;
    if (!sourceObj) return [];
    return Object.entries(sourceObj)
      .sort((a, b) => b[1] - a[1])
      .map(([category, value], idx) => ({
        id: idx,
        value,
        label: category,
      }));
  }, [analysisData]);

  const pieDataIncome = React.useMemo(() => {
    const sourceObj = analysisData?.incomeTypes ?? analysisData?.data?.incomeTypes;
    if (!sourceObj) return [];
    return Object.entries(sourceObj)
      .sort((a, b) => b[1] - a[1])
      .map(([category, value], idx) => ({
        id: idx,
        value,
        label: category,
      }));
  }, [analysisData]);

  const selectedExchangeRate = React.useMemo(
    () => Number(selectedExchangeRange || 0) || 0,
    [selectedExchangeRange]
  );

  const currencyCode = selectedCurrency === "NPR" ? "NPR" : "THB";
  const currencySymbol = selectedCurrency === "NPR" ? "NPR " : "฿";
  const conversionRate = selectedCurrency === "NPR" ? selectedExchangeRate : 1;

  const convertAmount = React.useCallback(
    (value) => Number(value || 0) * conversionRate,
    [conversionRate]
  );

  const formatPieSeriesData = React.useCallback(
    (dataset) =>
      (dataset || [])
        .map((item) => ({
          name: item.label ?? "Unknown",
          y: convertAmount(item.value),
        }))
        .filter((item) => item.y > 0),
    [convertAmount]
  );

  const pieTotalExpense = React.useMemo(
    () => pieDataExpense.reduce((s, d) => s + Number(d.value || 0), 0),
    [pieDataExpense]
  );
  const pieIncomeTotal = React.useMemo(
    () => pieDataIncome.reduce((s, d) => s + Number(d.value || 0), 0),
    [pieDataIncome]
  );

  const netBalance = pieIncomeTotal - pieTotalExpense;
  const savingsRate = pieIncomeTotal > 0 ? ((pieIncomeTotal - pieTotalExpense) / pieIncomeTotal) * 100 : null;
  const savingsRateColor =
    savingsRate == null ? colors.text.secondary : savingsRate >= 20 ? colors.successDark : savingsRate >= 0 ? colors.warning : colors.errorDark;
  const savingsRateLabel = savingsRate == null ? "—" : `${savingsRate >= 0 ? "+" : ""}${savingsRate.toFixed(1)}%`;
  const savingsRateHint =
    savingsRate == null ? "No income recorded" : savingsRate >= 20 ? "Healthy savings" : savingsRate >= 0 ? "Low buffer" : "Spending more than earned";

  const topExpenseCategories = React.useMemo(
    () => pieDataExpense.slice(0, 10).map((d) => ({ name: d.label, value: d.value })),
    [pieDataExpense]
  );

  const topIncomeCategories = React.useMemo(
    () => pieDataIncome.slice(0, 10).map((d) => ({ name: d.label, value: d.value })),
    [pieDataIncome]
  );

  const currencyFmt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  });
  const formatAmount = React.useCallback(
    (value) => currencyFmt.format(convertAmount(value)),
    [currencyFmt, convertAmount]
  );

  const yearlyIncomeArray =
    (testTransactionDetails?.data?.IncomeArray ?? testTransactionDetails?.data?.IncomeArray) || [];
  const yearlyExpenseArray =
    (testTransactionDetails?.data?.ExpensesArray ?? testTransactionDetails?.data?.ExpensesArray) || [];

  const yearlyIncomeTotal = yearlyIncomeArray.reduce((sum, v) => sum + Number(v || 0), 0);
  const yearlyExpenseTotal = yearlyExpenseArray.reduce((sum, v) => sum + Number(v || 0), 0);
  const yearlyNetTotal = yearlyIncomeTotal - yearlyExpenseTotal;

  const displayedYearlyIncomeArray = React.useMemo(
    () => yearlyIncomeArray.map((v) => convertAmount(v)),
    [yearlyIncomeArray, convertAmount]
  );
  const displayedYearlyExpenseArray = React.useMemo(
    () => yearlyExpenseArray.map((v) => convertAmount(v)),
    [yearlyExpenseArray, convertAmount]
  );

  const netSeries = Months.map((m, idx) => {
    const income = Number(displayedYearlyIncomeArray[idx] || 0);
    const expense = Number(displayedYearlyExpenseArray[idx] || 0);
    return income - expense;
  });

  const cumulativeNetSeries = React.useMemo(() => {
    let acc = 0;
    return netSeries.map((n) => {
      acc += n;
      return acc;
    });
  }, [netSeries]);

  const barChartData = React.useMemo(() => {
    // if (!allTransactionData?.data || !barYear || !barType) return [];
    if (!allTransactionData?.data || !barYear) return [];

    const monthlySumsIncome = Array(12).fill(0); // Jan-Dec
    const monthlyIncomeData = allTransactionData.data.forEach((tx) => {
      const txDate = dayjs(tx.date);
      if (txDate.year() === Number(barYear) && tx.type === "Income") {
        monthlySumsIncome[txDate.month()] += Number(tx.amount);
      }
    });

    const monthlySumsExpense = Array(12).fill(0); // Jan-Dec
    const monthlyExpenseData = allTransactionData.data.forEach((tx) => {
      const txDate = dayjs(tx.date);
      if (txDate.year() === Number(barYear) && tx.type === "Expense") {
        monthlySumsExpense[txDate.month()] += Number(tx.amount);
      }
    });

    const allData = {
      Expense: monthlySumsExpense.map((sum, idx) => ({
        month: Months[idx],
        value: sum,
      })),
      Income: monthlySumsIncome.map((sum, idx) => ({
        month: Months[idx],
        value: sum,
      })),
    };

    return allData;
  }, [allTransactionData, barYear, barType]);

  // Trailing 12-month trend for the top expense categories — independent of the
  // monthly/yearly/all-time filter above, so it always gives a rolling view.
  const categoryTrendData = React.useMemo(() => {
    const txs = allTransactionData?.data;
    if (!txs || txs.length === 0) return { months: [], series: [] };

    const monthCursors = Array.from({ length: 12 }, (_, i) => dayjs().subtract(11 - i, "month"));
    const monthKeys = monthCursors.map((m) => m.format("YYYY-MM"));
    const monthLabels = monthCursors.map((m) => m.format("MMM YY"));

    const categoryTotals = {};
    const monthCategoryMap = {};
    monthKeys.forEach((k) => (monthCategoryMap[k] = {}));

    txs.forEach((tx) => {
      if (tx.type !== "Expense") return;
      const key = dayjs(tx.date).format("YYYY-MM");
      if (!(key in monthCategoryMap)) return;
      const cat = tx.category || "Uncategorized";
      const amt = Number(tx.amount || 0);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      monthCategoryMap[key][cat] = (monthCategoryMap[key][cat] || 0) + amt;
    });

    const topCats = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    const series = topCats.map((cat) => ({
      name: cat,
      data: monthKeys.map((k) => convertAmount(monthCategoryMap[k][cat] || 0)),
    }));

    const otherData = monthKeys.map((k) => {
      const monthTotal = Object.values(monthCategoryMap[k]).reduce((s, v) => s + v, 0);
      const topTotal = topCats.reduce((s, cat) => s + (monthCategoryMap[k][cat] || 0), 0);
      return convertAmount(monthTotal - topTotal);
    });
    if (otherData.some((v) => v > 0.5)) {
      series.push({ name: "Other", data: otherData });
    }

    return { months: monthLabels, series };
  }, [allTransactionData, convertAmount]);

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        mt: { xs: 1, sm: 3 },
        p: { xs: 1, sm: 3 },
        bgcolor: "background.paper",
        borderRadius: { xs: 0, sm: 3 },
        boxShadow: { xs: 0, sm: 4 },
        minHeight: { xs: 300, sm: 400 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Premium Dashboard Header */}
      <Box sx={{ ...sectionPaperSx, width: "100%", mb: { xs: 3, sm: 4 }, p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ position: "absolute", top: "-50%", right: "-20%", width: "60%", height: "150%", background: "radial-gradient(ellipse at center, rgba(100, 181, 246, 0.15) 0%, transparent 70%)", zIndex: 0 }} />

        <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", lg: "center" }, gap: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: "text.primary", letterSpacing: 0.5, fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" } }}>
                Spending Analysis
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.875rem" }, maxWidth: 500 }}>
                Compare income, expenses, and savings across different periods. Spot your largest categories and follow your net flow.
              </Typography>
            </Box>

            {/* Quick Stats Grid — vibrant gradient KPI cards (fixed track widths so the
                grid never reflows as values change length between renders) */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(4, 152px)",
                  md: "repeat(4, 190px)",
                  lg: "repeat(4, 220px)",
                  xl: "repeat(4, 240px)",
                },
                gap: { xs: 1.5, sm: 2 },
                width: { xs: "100%", lg: "auto" },
                flexShrink: 0,
              }}
            >
              <KpiCard
                icon={TrendingUpIcon}
                label="Income"
                value={formatAmount(pieIncomeTotal)}
                gradient={gradients.income}
                glow={colors.successDark}
              />
              <KpiCard
                icon={TrendingDownIcon}
                label="Expense"
                value={formatAmount(pieTotalExpense)}
                gradient={gradients.expense}
                glow={colors.errorDark}
              />
              <KpiCard
                icon={AccountBalanceWalletIcon}
                label="Net balance"
                value={`${netBalance >= 0 ? "+" : ""}${formatAmount(netBalance)}`}
                gradient={netBalance >= 0 ? gradients.primary : gradients.expense}
                glow={netBalance >= 0 ? colors.primaryDark : colors.errorDark}
              />
              <KpiCard
                icon={SpeedIcon}
                label="Savings rate"
                value={savingsRateLabel}
                sub={savingsRateHint}
                gradient={`linear-gradient(135deg, ${savingsRateColor} 0%, ${alpha(savingsRateColor, 0.7)} 100%)`}
                glow={savingsRateColor}
              />
            </Box>
          </Box>
          
          {/* Controls */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", bgcolor: "background.default", p: 1.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            {/* View mode pill toggle */}
            <Stack
              direction="row"
              sx={{ bgcolor: "background.paper", borderRadius: "999px", border: "1px solid", borderColor: "divider", p: 0.4 }}
            >
              {[
                { key: "monthly", label: "Monthly" },
                { key: "yearly", label: "Yearly" },
                { key: "all", label: "All time" },
              ].map((opt) => {
                const active = viewMode === opt.key;
                return (
                  <Box
                    key={opt.key}
                    component="button"
                    onClick={() => setViewMode(opt.key)}
                    sx={{
                      all: "unset",
                      cursor: "pointer",
                      px: 1.75,
                      py: 0.75,
                      borderRadius: "999px",
                      fontWeight: active ? 800 : 600,
                      fontSize: "0.8rem",
                      color: active ? "#fff" : "text.secondary",
                      bgcolor: active ? colors.primaryDark : "transparent",
                      transition: "all 0.2s ease",
                      "&:hover": { bgcolor: active ? colors.primaryDark : "action.hover" },
                    }}
                  >
                    {opt.label}
                  </Box>
                );
              })}
            </Stack>

            {/* Month / Year pill */}
            {viewMode !== "all" && (
              <Stack
                direction="row"
                alignItems="center"
                divider={<Box sx={{ width: "1px", height: 18, bgcolor: alpha(colors.primaryDark, 0.25) }} />}
                sx={{ bgcolor: alpha(colors.primaryDark, 0.08), borderRadius: "999px", border: "1px solid", borderColor: "divider" }}
              >
                {viewMode === "monthly" && (
                  <Select
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(e.target.value)}
                    variant="standard"
                    disableUnderline
                    sx={{
                      "& .MuiSelect-select": { fontSize: "0.8rem", fontWeight: 700, color: colors.primaryDark, py: 0.7, pl: 1.75, pr: "26px !important" },
                      "& .MuiSelect-icon": { color: colors.primaryDark, right: 4, fontSize: "1.1rem" },
                    }}
                  >
                    {Months.map((month, index) => <MenuItem key={index} value={month}>{month}</MenuItem>)}
                  </Select>
                )}
                <Select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  variant="standard"
                  disableUnderline
                  sx={{
                    "& .MuiSelect-select": { fontSize: "0.8rem", fontWeight: 700, color: colors.primaryDark, py: 0.7, pl: 1.5, pr: "26px !important" },
                    "& .MuiSelect-icon": { color: colors.primaryDark, right: 4, fontSize: "1.1rem" },
                  }}
                >
                  {Years.map((year, index) => <MenuItem key={index} value={year}>{year}</MenuItem>)}
                </Select>
              </Stack>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Currency pill toggle */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent={{ xs: "center", md: "flex-end" }} sx={{ width: { xs: "100%", md: "auto" } }}>
              <Stack direction="row" sx={{ bgcolor: "background.paper", borderRadius: "999px", border: "1px solid", borderColor: "divider", p: 0.4 }}>
                {["THB", "NPR"].map((cur) => {
                  const active = selectedCurrency === cur;
                  return (
                    <Box
                      key={cur}
                      component="button"
                      onClick={() => setSelectedCurrency(cur)}
                      sx={{
                        all: "unset",
                        cursor: "pointer",
                        px: 2,
                        py: 0.75,
                        borderRadius: "999px",
                        fontWeight: active ? 800 : 600,
                        fontSize: "0.8rem",
                        color: active ? "#fff" : "text.secondary",
                        bgcolor: active ? "#7c4dff" : "transparent",
                        transition: "all 0.2s ease",
                        "&:hover": { bgcolor: active ? "#7c4dff" : "action.hover" },
                      }}
                    >
                      {cur}
                    </Box>
                  );
                })}
              </Stack>
              {selectedCurrency === "NPR" && (
                <Select value={selectedExchangeRange} onChange={(e) => setSelectedExchangeRange(e.target.value)} size="small" sx={{ minWidth: 140, bgcolor: "background.paper", borderRadius: "999px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" } }}>
                  {exchangeRateOptions.map((rate) => <MenuItem key={rate.value} value={rate.value}>1 THB = {rate.label}</MenuItem>)}
                </Select>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Savings rate gauge */}
      <Box sx={{ width: "100%", mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ ...sectionPaperSx, width: "100%" }}>
          <SectionHeader
            icon={SpeedIcon}
            iconColor={savingsRateColor}
            title="Savings rate"
            subtitle="How much of your income you're keeping for the selected period, at a glance."
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 1, sm: 5 },
            }}
          >
            <Box sx={{ position: "relative", width: { xs: 220, sm: 260 }, height: { xs: 130, sm: 150 }, flexShrink: 0 }}>
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  chart: {
                    type: "pie",
                    height: isMobile ? 130 : 150,
                    backgroundColor: "transparent",
                    margin: [0, 0, 0, 0],
                    spacing: [0, 0, 0, 0],
                  },
                  title: { text: "" },
                  credits: { enabled: false },
                  tooltip: { enabled: false },
                  plotOptions: {
                    pie: {
                      startAngle: -90,
                      endAngle: 90,
                      innerSize: "78%",
                      size: "175%",
                      center: ["50%", "100%"],
                      dataLabels: { enabled: false },
                      borderWidth: 0,
                      states: { hover: { enabled: false } },
                      enableMouseTracking: false,
                    },
                  },
                  series: [
                    {
                      data: [
                        {
                          y: Math.max(Math.min(savingsRate ?? 0, 100), 0),
                          color: {
                            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
                            stops: [
                              [0, alpha(savingsRateColor, 0.75)],
                              [1, savingsRateColor],
                            ],
                          },
                        },
                        {
                          y: 100 - Math.max(Math.min(savingsRate ?? 0, 100), 0),
                          color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                        },
                      ],
                    },
                  ],
                }}
              />
              <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: savingsRateColor, lineHeight: 1 }}>
                  {savingsRateLabel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {savingsRateHint}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={1.25} sx={{ flex: 1, width: "100%" }}>
              {[
                { label: "Overspending", range: "Below 0%", color: colors.errorDark },
                { label: "Low buffer", range: "0% – 20%", color: colors.warning },
                { label: "Healthy savings", range: "20%+", color: colors.successDark },
              ].map((row) => (
                <Stack
                  key={row.label}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    p: 1,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: row.color === savingsRateColor ? alpha(row.color, 0.12) : "transparent",
                    border: "1px solid",
                    borderColor: row.color === savingsRateColor ? alpha(row.color, 0.35) : "divider",
                  }}
                >
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: row.color, flexShrink: 0 }} />
                  <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
                    {row.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.range}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: "100%", mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ ...sectionPaperSx, width: "100%" }}>
          <SectionHeader
            icon={DonutLargeIcon}
            iconColor={colors.primaryDark}
            title="Category split"
            subtitle="Donut charts show where money came from and where it went for the selected view."
          />
          {selectedCurrency === "NPR" && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Converted with 1 THB = {selectedExchangeRate.toFixed(2)} NPR
            </Typography>
          )}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 2, sm: 4, md: 6 },
            minHeight: { xs: 260, sm: 300, md: 400 },
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              width: { xs: "100%", sm: "45%", md: "45%" },
              maxWidth: "500px",
            }}
          >
            {isPendingAnalysis ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: chartHeight, width: "100%" }}>
                <CircularProgress size={36} sx={{ color: "primary.main" }} />
              </Box>
            ) : (
              <>
                {pieDataExpense.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No expense categories for this view.
                  </Typography>
                ) : (
                  <>
                    <HighchartsReact
                      highcharts={Highcharts}
                      key={`expense-${viewMode}-${currentYear}-${currentMonth}`}
                      options={{
                        chart: {
                          type: "pie",
                          height: chartHeight,
                          backgroundColor: "transparent",
                          marginTop: 0,
                          marginBottom: 0,
                          spacingTop: 0,
                          spacingBottom: 0,
                        },
                        title: {
                          text: "",
                        },
                        colors: pieColors,
                        plotOptions: {
                          pie: {
                            innerSize: pieInnerSize,
                            borderWidth: 2,
                            borderColor: pieSliceBorder,
                            size: "90%",
                            startAngle: 0,
                            endAngle: 360,
                            center: ["50%", "50%"],
                            minSize: 180,
                            shadow: false,
                            dataLabels: {
                              enabled: true,
                              distance: pieDataLabelDist,
                              format: `{point.name}: <b>${currencySymbol}{point.y:,.0f}</b>`,
                              style: {
                                color: pieDataLabelColor,
                                textOutline: "none",
                                fontWeight: 600,
                                fontSize: isMobile ? "11px" : "12px",
                              },
                              backgroundColor: "none",
                              borderWidth: 0,
                              shadow: false,
                              padding: 0,
                              allowOverlap: false,
                              softConnector: true,
                              connectorShape: "crookedLine",
                              connectorWidth: 1,
                              connectorColor: pieConnectorColor,
                              filter: {
                                property: "percentage",
                                operator: ">=",
                                value: 2,
                              },
                            },
                            showInLegend: false,
                          },
                        },
                        credits: {
                          enabled: false,
                        },
                        tooltip: {
                          useHTML: true,
                          borderWidth: 0,
                          backgroundColor: theme.palette.background.paper,
                          style: { color: theme.palette.text.primary, borderRadius: 12 },
                          formatter: function () {
                            return `<div style="padding:6px 8px;">` +
                              `<div style="font-weight:700;color:${this.color}">${this.point.name}</div>` +
                              `<div>${currencySymbol}${Highcharts.numberFormat(this.y,0)}</div>` +
                              `</div>`;
                          },
                        },
                        subtitle: {
                          text: "Expense Split",
                          verticalAlign: "middle",
                          floating: true,
                          style: { color: chartAxisColor, fontWeight: 600, fontSize: "13px" },
                        },
                        series: [
                          {
                            name: "Expense",
                            data: formatPieSeriesData(pieDataExpense),
                          },
                        ],
                        noData: {
                          style: {
                            fontWeight: "bold",
                            fontSize: "16px",
                            color: "#666",
                          },
                        },
                      }}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="error.main">
                        Expense total
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatAmount(pieTotalExpense)}
                      </Typography>
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>

          <Box
            sx={{
              textAlign: "center",
              width: { xs: "100%", sm: "45%", md: "45%" },
              maxWidth: "500px",
            }}
          >
            {isPendingAnalysis ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: chartHeight, width: "100%" }}>
                <CircularProgress size={36} sx={{ color: "primary.main" }} />
              </Box>
            ) : (
              <>
                {pieDataIncome.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No income categories for this view.
                  </Typography>
                ) : (
                  <>
                    <HighchartsReact
                      highcharts={Highcharts}
                      key={`income-${viewMode}-${currentYear}-${currentMonth}`}
                      options={{
                        chart: {
                          type: "pie",
                          height: chartHeight,
                          backgroundColor: "transparent",
                          marginTop: 0,
                          marginBottom: 0,
                          spacingTop: 0,
                          spacingBottom: 0,
                        },
                        title: {
                          text: "",
                        },
                        colors: pieColors,
                        plotOptions: {
                          pie: {
                            innerSize: pieInnerSize,
                            borderWidth: 2,
                            borderColor: pieSliceBorder,
                            size: "90%",
                            startAngle: 0,
                            endAngle: 360,
                            center: ["50%", "50%"],
                            minSize: 180,
                            shadow: false,
                            dataLabels: {
                              enabled: true,
                              distance: pieDataLabelDist,
                              format: `{point.name}: <b>${currencySymbol}{point.y:,.0f}</b>`,
                              style: {
                                color: pieDataLabelColor,
                                textOutline: "none",
                                fontWeight: 600,
                                fontSize: isMobile ? "11px" : "12px",
                              },
                              backgroundColor: "none",
                              borderWidth: 0,
                              shadow: false,
                              padding: 0,
                              allowOverlap: false,
                              softConnector: true,
                              connectorShape: "crookedLine",
                              connectorWidth: 1,
                              connectorColor: pieConnectorColor,
                              filter: {
                                property: "percentage",
                                operator: ">=",
                                value: 2,
                              },
                            },
                            showInLegend: false,
                          },
                        },
                        credits: {
                          enabled: false,
                        },
                        tooltip: {
                          useHTML: true,
                          borderWidth: 0,
                          backgroundColor: theme.palette.background.paper,
                          style: { color: theme.palette.text.primary, borderRadius: 12 },
                          formatter: function () {
                            return `<div style="padding:6px 8px;">` +
                              `<div style="font-weight:700;color:${this.color}">${this.point.name}</div>` +
                              `<div>${currencySymbol}${Highcharts.numberFormat(this.y,0)}</div>` +
                              `</div>`;
                          },
                        },
                        subtitle: {
                          text: "Income Split",
                          verticalAlign: "middle",
                          floating: true,
                          style: { color: chartAxisColor, fontWeight: 600, fontSize: "13px" },
                        },
                        series: [
                          {
                            name: "Income",
                            data: formatPieSeriesData(pieDataIncome),
                          },
                        ],
                        noData: {
                          style: {
                            fontWeight: "bold",
                            fontSize: "16px",
                            color: "#666",
                          },
                        },
                      }}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="success.main">
                        Income total
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatAmount(pieIncomeTotal)}
                      </Typography>
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
        {isErrorAnalysis && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Could not load analysis for this period. Try another month or refresh the page.
          </Alert>
        )}
        </Box>

        {/* Top Categories under pies */}
        <GridLikeTopCategories
          title="Top Expense Categories"
          seriesName="Expense"
          data={topExpenseCategories}
          color={colors.errorDark}
          icon={TrendingDownIcon}
          height={barCategoryHeight}
          currencySymbol={currencySymbol}
          currencyCode={currencyCode}
          conversionRate={conversionRate}
        />
        <GridLikeTopCategories
          title="Top Income Categories"
          seriesName="Income"
          data={topIncomeCategories}
          color={colors.successDark}
          icon={TrendingUpIcon}
          height={barCategoryHeight}
          sx={{ mt: 3 }}
          currencySymbol={currencySymbol}
          currencyCode={currencyCode}
          conversionRate={conversionRate}
        />
      </Box>

      <Box sx={{ width: "100%", mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ ...sectionPaperSx, width: "100%" }}>
          <SectionHeader
            icon={CategoryIcon}
            iconColor={colors.primaryDark}
            title="Top categories — 12 month trend"
            subtitle="Rolling monthly totals for your biggest expense categories, independent of the filters above."
          />
          {categoryTrendData.series.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
              Not enough expense history yet to chart a trend.
            </Typography>
          ) : (
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: {
                  type: "area",
                  backgroundColor: "transparent",
                  height: columnChartHeight,
                },
                title: { text: "" },
                colors: chartPieGradients.map((g) => g.start),
                xAxis: {
                  categories: categoryTrendData.months,
                  labels: { style: { color: chartAxisColor } },
                  lineColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                  tickColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                },
                yAxis: {
                  title: { text: `Amount (${currencyCode})`, style: { color: chartAxisColor } },
                  labels: { style: { color: chartAxisColor } },
                  gridLineColor: chartGridColor,
                },
                legend: {
                  enabled: true,
                  itemStyle: { color: chartAxisColor, fontWeight: 600 },
                  itemHoverStyle: { color: theme.palette.text.primary },
                },
                credits: { enabled: false },
                tooltip: {
                  shared: true,
                  backgroundColor: isDark ? "rgba(17, 20, 24, 0.92)" : "rgba(255, 255, 255, 0.97)",
                  borderWidth: 0,
                  style: { color: isDark ? "#fff" : "#0f1115", fontWeight: 600 },
                  valueDecimals: 0,
                  valuePrefix: currencySymbol,
                },
                plotOptions: {
                  area: {
                    stacking: "normal",
                    marker: { enabled: false, symbol: "circle" },
                    fillOpacity: 0.75,
                    lineWidth: 1.5,
                    states: { hover: { lineWidth: 2 } },
                  },
                },
                series: categoryTrendData.series.map((s) => ({
                  name: s.name,
                  data: s.data,
                })),
              }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ width: "100%", mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ ...sectionPaperSx, width: "100%" }}>
          <SectionHeader
            icon={CalendarMonthIcon}
            iconColor={colors.warning}
            title="Year-at-a-glance"
            subtitle="Pick a year to compare income and expenses month by month, then see how net results add up over time."
          />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Select
              labelId="bar-year-select-label"
              id="bar-year-select"
              value={barYear}
              onChange={(e) => setBarYear(e.target.value)}
              size="small"
              sx={{
                minWidth: 100,
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: 2,
                color: "#fff",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
              }}
            >
              {Years.map((year, index) => (
                <MenuItem
                  key={index}
                  value={year}
                >
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, sm: 4 },
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              p: 2,
              borderRadius: 3,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Box sx={{ textAlign: "center", flex: "1 1 30%", minWidth: "120px" }}>
              <Box
                sx={{
                  fontSize: "0.85rem",
                  color: "text.secondary",
                  mb: 0.5,
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}
              >
                Annual Expense
              </Box>
              <Box
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "error.main",
                }}
              >
                {formatAmount(yearlyExpenseTotal)}
              </Box>
            </Box>
            <Box sx={{ textAlign: "center", flex: "1 1 30%", minWidth: "120px" }}>
              <Box
                sx={{
                  fontSize: "0.85rem",
                  color: "text.secondary",
                  mb: 0.5,
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}
              >
                Annual Income
              </Box>
              <Box
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "success.main",
                }}
              >
                {formatAmount(yearlyIncomeTotal)}
              </Box>
            </Box>
            <Box sx={{ textAlign: "center", flex: "1 1 30%", minWidth: "120px" }}>
              <Box
                sx={{
                  fontSize: "0.85rem",
                  color: "text.secondary",
                  mb: 0.5,
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}
              >
                Net (Income - Expense)
              </Box>
              <Box
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: yearlyNetTotal >= 0 ? "primary.main" : "error.main",
                }}
              >
                {formatAmount(yearlyNetTotal)}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: { xs: 180, sm: 220 },
          }}
        >
          {testLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6, width: "100%" }}>
              <CircularProgress size={40} sx={{ color: "primary.main" }} />
            </Box>
          ) : (
            <Box sx={{ width: "100%", minHeight: 300, borderRadius: 2, p: { xs: 0, sm: 1 } }}>
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  chart: {
                    type: "column",
                    backgroundColor: "transparent",
                    height: columnChartHeight,
                    style: {
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
                    },
                  },
                  title: {
                    text: "Monthly income vs expense",
                    style: {
                      color: theme.palette.text.primary,
                      fontSize: "16px",
                      fontWeight: 600,
                    },
                  },
                  xAxis: {
                    categories: Months,
                    title: {
                      text: "Month",
                      style: {
                        color: chartAxisColor,
                      },
                    },
                    labels: {
                      style: {
                        color: chartAxisColor,
                      },
                    },
                    lineColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.25)"
                        : "rgba(0, 0, 0, 0.2)",
                    tickColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.25)"
                        : "rgba(0, 0, 0, 0.2)",
                    crosshair: {
                      color: "rgba(100,181,246,0.35)",
                      width: 1,
                      dashStyle: "ShortDot",
                    },
                  },
                  yAxis: {
                    title: {
                      text: `Amount (${currencyCode})`,
                      style: {
                        color: chartAxisColor,
                      },
                    },
                    labels: {
                      style: {
                        color: chartAxisColor,
                      },
                    },
                    gridLineColor: chartGridColor,
                    tickAmount: isMobile ? 4 : 6,
                  },
                  tooltip: {
                    headerFormat:
                      '<span style="font-size:12px">{point.key}</span><br/>',
                    pointFormat:
                      `<span style="color:{point.color}">\u25CF</span> {series.name}: <b>${currencySymbol}{point.y:,.0f}</b>`,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(17, 20, 24, 0.92)"
                        : "rgba(255, 255, 255, 0.97)",
                    borderWidth: 0,
                    shadow: true,
                    shared: true,
                    useHTML: true,
                    style: {
                      color: theme.palette.mode === "dark" ? "#fff" : "#0f1115",
                      fontWeight: 600,
                    },
                  },
                  legend: {
                    enabled: true,
                    itemStyle: { color: chartAxisColor, fontWeight: 600 },
                    itemHoverStyle: { color: theme.palette.text.primary },
                  },
                  plotOptions: {
                    column: {
                      borderRadius: 6,
                      pointPadding: 0.1,
                      groupPadding: 0.18,
                      states: {
                        hover: {
                          brightness: -0.1,
                        },
                      },
                      dataLabels: {
                        enabled: !isMobile,
                        style: {
                          color: chartAxisColor,
                          textOutline: "none",
                          fontWeight: 600,
                        },
                        formatter: function () {
                          return `${currencySymbol}${Highcharts.numberFormat(this.y, 0)}`;
                        },
                        filter: { property: "y", operator: ">=", value: 0 },
                      },
                    },
                  },
                  credits: {
                    enabled: false,
                  },
                  series: [
                    {
                      name: "Income",
                      data: displayedYearlyIncomeArray,
                      color: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                          [0, colors.success],
                          [1, colors.successDark],
                        ],
                      },
                    },
                    {
                      name: "Expense",
                      data: displayedYearlyExpenseArray,
                      color: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                          [0, colors.error],
                          [1, colors.errorDark],
                        ],
                      },
                    },
                  ],
                }}
              />
            </Box>
          )}
        </Box>
        </Box>

         <Box sx={{ ...sectionPaperSx, width: "100%", mb: { xs: 3, sm: 4 } }}>
          <SectionHeader
            icon={ShowChartIcon}
            iconColor={colors.primaryDark}
            title="Monthly net (income − expense)"
            subtitle="Positive months build surplus; negative months draw it down."
          />
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: {
                type: "areaspline",
                backgroundColor: "transparent",
                height: netChartHeight,
              },
              title: { text: "" },
              xAxis: {
                categories: Months,
                labels: { style: { color: chartAxisColor } },
                lineColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.15)",
                tickColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.15)",
              },
              yAxis: {
                title: { text: `Amount (${currencyCode})`, style: { color: chartAxisColor } },
                labels: { style: { color: chartAxisColor } },
                gridLineColor: chartGridColor,
                plotLines: [
                  {
                    value: 0,
                    color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)",
                    width: 1,
                    zIndex: 4,
                  },
                ],
              },
              tooltip: {
                shared: true,
                backgroundColor:
                  theme.palette.mode === "dark" ? "rgba(17,20,24,0.9)" : "rgba(255,255,255,0.97)",
                borderWidth: 0,
                style: {
                  color: theme.palette.mode === "dark" ? "#fff" : "#0f1115",
                },
                pointFormat:
                  `<span style="color:{point.color}">●</span> Net: <b>${currencySymbol}{point.y:,.0f}</b><br/>`,
              },
              legend: { enabled: false },
              credits: { enabled: false },
              plotOptions: {
                areaspline: {
                  fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, alpha(colors.primaryDark, 0.55)],
                      [1, alpha(colors.primaryDark, 0.04)],
                    ],
                  },
                  lineColor: colors.primaryDark,
                  lineWidth: 3,
                  marker: {
                    enabled: true,
                    radius: 3.5,
                    fillColor: colors.primaryDark,
                    lineColor: theme.palette.mode === "dark" ? "#0f1115" : "#fff",
                    lineWidth: 1.5,
                  },
                },
              },
              series: [
                {
                  name: "Net",
                  data: netSeries,
                },
              ],
            }}
          />
        </Box>

        <Box sx={{ ...sectionPaperSx, width: "100%", mb: { xs: 3, sm: 4 } }}>
          <SectionHeader
            icon={StackedLineChartIcon}
            iconColor={colors.warning}
            title="Cumulative net (year to date)"
            subtitle={`Running total of monthly net through ${barYear}—shows whether you are building or eroding surplus across the year.`}
          />
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: {
                type: "areaspline",
                backgroundColor: "transparent",
                height: netChartHeight,
              },
              title: { text: "" },
              xAxis: {
                categories: Months,
                labels: { style: { color: chartAxisColor } },
                lineColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.15)",
                tickColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.15)",
              },
              yAxis: {
                title: {
                  text: `Cumulative net (${currencyCode})`,
                  style: { color: chartAxisColor },
                },
                labels: { style: { color: chartAxisColor } },
                gridLineColor: chartGridColor,
                plotLines: [
                  {
                    value: 0,
                    color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)",
                    width: 1,
                    zIndex: 4,
                  },
                ],
              },
              tooltip: {
                backgroundColor:
                  theme.palette.mode === "dark" ? "rgba(17,20,24,0.9)" : "rgba(255,255,255,0.97)",
                borderWidth: 0,
                style: {
                  color: theme.palette.mode === "dark" ? "#fff" : "#0f1115",
                },
                pointFormat:
                  `<span style="color:{point.color}">●</span> Cumulative net: <b>${currencySymbol}{point.y:,.0f}</b><br/>`,
              },
              legend: { enabled: false },
              credits: { enabled: false },
              plotOptions: {
                areaspline: {
                  lineWidth: 3,
                  lineColor: colors.warning,
                  fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, alpha(colors.warning, 0.5)],
                      [1, alpha(colors.warning, 0.04)],
                    ],
                  },
                  marker: {
                    enabled: true,
                    radius: 3.5,
                    fillColor: colors.warning,
                    lineColor: theme.palette.mode === "dark" ? "#0f1115" : "#fff",
                    lineWidth: 1,
                  },
                },
              },
              series: [
                {
                  name: "Cumulative net",
                  data: cumulativeNetSeries,
                },
              ],
            }}
          />
        </Box>

      </Box>
    </Box>
  );
};

const KpiCard = ({ icon: Icon, label, value, sub, gradient, glow }) => (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 3,
      p: { xs: 1.5, sm: 2, md: 2.5, lg: 2.75 },
      background: gradient,
      boxShadow: `0 10px 24px ${alpha(glow, 0.4)}`,
      color: "#fff",
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: -24,
        right: -24,
        width: 90,
        height: 90,
        borderRadius: "50%",
        bgcolor: "rgba(255,255,255,0.14)",
      }}
    />
    {Icon && (
      <Box
        sx={{
          position: "relative",
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Icon sx={{ fontSize: 16, color: "#fff" }} />
      </Box>
    )}
    <Typography
      variant="caption"
      sx={{ position: "relative", fontWeight: 800, letterSpacing: 0.6, opacity: 0.92, display: "block", whiteSpace: "nowrap" }}
    >
      {label.toUpperCase()}
    </Typography>
    <Typography
      variant="h6"
      fontWeight={800}
      sx={{
        position: "relative",
        fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem", lg: "1.4rem" },
        mt: 0.25,
        wordBreak: "break-word",
        overflowWrap: "break-word",
        lineHeight: 1.2,
      }}
    >
      {value}
    </Typography>
    {sub && (
      <Typography variant="caption" sx={{ position: "relative", opacity: 0.9, display: "block", mt: 0.25 }}>
        {sub}
      </Typography>
    )}
  </Box>
);

const SectionHeader = ({ icon: Icon, iconColor = colors.primaryDark, title, subtitle }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
    {Icon && (
      <Box
        sx={{
          width: { xs: 36, sm: 40 },
          height: { xs: 36, sm: 40 },
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${iconColor} 0%, ${alpha(iconColor, 0.65)} 100%)`,
          boxShadow: `0 4px 14px ${alpha(iconColor, 0.45)}`,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: "#fff", fontSize: { xs: 18, sm: 20 } }} />
      </Box>
    )}
    <Box>
      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  </Stack>
);

const GridLikeTopCategories = ({
  title,
  data,
  color,
  icon,
  seriesName,
  sx,
  height = 320,
  currencySymbol = "฿",
  currencyCode = "THB",
  conversionRate = 1,
}) => {
  const theme = useTheme();
  if (!data || data.length === 0) return null;

  const chartAxisColor = theme.palette.mode === "dark" ? "#cfd8dc" : "#546e7a";
  const chartGridColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const convertedValues = data.map((d) => Number(d.value || 0) * conversionRate);

  const base = Highcharts.color(color).get() || color;

  const barData = convertedValues.map((y, idx) => {
    const grad = chartPieGradients[idx % chartPieGradients.length];
    return {
      y,
      color: {
        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
        stops: [
          [0, grad.start],
          [1, grad.end],
        ],
      },
    };
  });

  return (
    <Box
      sx={{
        mb: { xs: 3, sm: 4 },
        p: { xs: 2, sm: 3, md: 4 },
        ...themedCardSx,
        borderRadius: { xs: 2, sm: 4 },
        position: "relative",
        overflow: "hidden",
        width: "100%",
        ...sx,
      }}
    >
      <SectionHeader
        icon={icon}
        iconColor={color}
        title={title}
        subtitle="Ranked by total amount for the selected analysis period."
      />
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          chart: { type: "bar", backgroundColor: "transparent", height },
          title: { text: "" },
          xAxis: {
            categories: data.map((d) => d.name),
            labels: { style: { color: chartAxisColor } },
            lineColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.15)",
            tickColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.15)",
          },
          yAxis: {
            title: { text: `Amount (${currencyCode})`, style: { color: chartAxisColor } },
            labels: { style: { color: chartAxisColor } },
            gridLineColor: chartGridColor,
          },
          legend: { enabled: false },
          credits: { enabled: false },
          tooltip: {
            backgroundColor: theme.palette.background.paper,
            borderWidth: 0,
            style: { color: theme.palette.text.primary },
            useHTML: true,
            formatter: function () {
              const rank = (this.point?.index ?? this.point?.x ?? 0) + 1;
              return (
                `<span style="color:${base}">●</span> ${seriesName}: <b>${currencySymbol}${Highcharts.numberFormat(this.y, 0)}</b><br/>` +
                `<span>Rank #${rank}</span>`
              );
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 6,
              borderWidth: 0,
              dataLabels: {
                enabled: true,
                formatter: function () {
                  return `${currencySymbol}${Highcharts.numberFormat(this.y, 0)}`;
                },
                style: { color: chartAxisColor, textOutline: "none", fontWeight: 600 },
                crop: false,
                overflow: "allow",
              },
            },
          },
          series: [
            {
              name: seriesName,
              data: barData,
              color: base,
            },
          ],
        }}
      />
    </Box>
  );
};

export default AnalysisPage;
