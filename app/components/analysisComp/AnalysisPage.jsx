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
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useCategoryQuery } from "../../services/useCategoryServices";
import { themedCardSx, chartColors, colors, insetPanelSx } from "../../themeStyles";

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
  const pieColors = [
    "#ff8a65",
    "#ffa726",
    "#ffd54f",
    "#4db6ac",
    "#64b5f6",
    "#ba68c8",
    "#f06292",
    "#7986cb",
    "#aed581",
    "#90a4ae",
  ];
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

            {/* Quick Stats Grid */}
            <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, flexWrap: "wrap", width: { xs: "100%", lg: "auto" } }}>
              <Box sx={{ flex: { xs: "1 1 45%", sm: "none" }, bgcolor: "rgba(67, 160, 71, 0.1)", p: { xs: 1.5, sm: 2 }, borderRadius: 2, border: "1px solid rgba(67, 160, 71, 0.3)", textAlign: "center", minWidth: { sm: "140px" } }}>
                <Typography variant="caption" sx={{ color: "success.main", fontWeight: "bold", display: "block", mb: 0.5 }}>INCOME</Typography>
                <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "bold", fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>{formatAmount(pieIncomeTotal)}</Typography>
              </Box>
              <Box sx={{ flex: { xs: "1 1 45%", sm: "none" }, bgcolor: "rgba(239, 83, 80, 0.1)", p: { xs: 1.5, sm: 2 }, borderRadius: 2, border: "1px solid rgba(239, 83, 80, 0.3)", textAlign: "center", minWidth: { sm: "140px" } }}>
                <Typography variant="caption" sx={{ color: "error.main", fontWeight: "bold", display: "block", mb: 0.5 }}>EXPENSE</Typography>
                <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "bold", fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>{formatAmount(pieTotalExpense)}</Typography>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", sm: "none" }, bgcolor: (pieIncomeTotal - pieTotalExpense) >= 0 ? "rgba(144, 202, 249, 0.1)" : "rgba(255, 138, 128, 0.1)", p: { xs: 1.5, sm: 2 }, borderRadius: 2, border: `1px solid ${(pieIncomeTotal - pieTotalExpense) >= 0 ? "rgba(144, 202, 249, 0.3)" : "rgba(255, 138, 128, 0.3)"}`, textAlign: "center", minWidth: { sm: "140px" } }}>
                <Typography variant="caption" sx={{ color: (pieIncomeTotal - pieTotalExpense) >= 0 ? "primary.main" : "error.main", fontWeight: "bold", display: "block", mb: 0.5 }}>NET BALANCE</Typography>
                <Typography variant="h6" sx={{ color: (pieIncomeTotal - pieTotalExpense) >= 0 ? "primary.main" : "error.main", fontWeight: "bold", fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>{(pieIncomeTotal - pieTotalExpense) >= 0 ? "+" : ""}{formatAmount(pieIncomeTotal - pieTotalExpense)}</Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Controls */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", bgcolor: "background.default", p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              <Chip label="Current View:" size="small" sx={{ bgcolor: "transparent", color: "text.secondary", fontWeight: 600, border: "none", px: 0 }} />
              <Chip label={`${viewMode === "monthly" ? currentMonth : viewMode === "yearly" ? "Full year" : "All time"}`} size="small" sx={{ bgcolor: "action.selected", color: "text.primary", fontWeight: 600, border: "none" }} />
              <Chip label={`${currentYear}`} size="small" sx={{ bgcolor: "action.selected", color: "text.secondary", border: "none" }} />
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent={{ xs: "center", md: "flex-end" }} sx={{ width: { xs: "100%", md: "auto" } }}>
              <Button
                variant={selectedCurrency === "THB" ? "contained" : "outlined"}
                onClick={() => setSelectedCurrency((prev) => (prev === "THB" ? "NPR" : "THB"))}
                disableElevation
                sx={{
                  borderRadius: 2,
                  minWidth: 140,
                  fontWeight: 700,
                  textTransform: "none",
                  borderColor: selectedCurrency === "THB" ? "transparent" : "divider",
                  background: selectedCurrency === "THB" ? "linear-gradient(135deg, #7c4dff 0%, #00bcd4 100%)" : "transparent",
                  boxShadow: selectedCurrency === "THB" ? "0 4px 15px rgba(124,77,255,0.3)" : "none",
                  "&:hover": { background: selectedCurrency === "THB" ? "linear-gradient(135deg, #6f42f5 0%, #00acc1 100%)" : "action.hover" },
                }}
              >
                {selectedCurrency === "THB" ? "Switch to NPR" : "Switch to THB"}
              </Button>
              <Select value={selectedExchangeRange} onChange={(e) => setSelectedExchangeRange(e.target.value)} disabled={selectedCurrency !== "NPR"} size="small" sx={{ minWidth: 140, bgcolor: "background.default", borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" } }}>
                {exchangeRateOptions.map((rate) => <MenuItem key={rate.value} value={rate.value}>1 THB = {rate.label}</MenuItem>)}
              </Select>
              <Select value={viewMode} onChange={(e) => setViewMode(e.target.value)} size="small" sx={{ minWidth: 100, bgcolor: "background.default", borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" } }}>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
                <MenuItem value="all">View All</MenuItem>
              </Select>
              <Select value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} disabled={viewMode === "all"} size="small" sx={{ minWidth: 90, bgcolor: "background.default", borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" } }}>
                {Years.map((year, index) => <MenuItem key={index} value={year}>{year}</MenuItem>)}
              </Select>
              <Select value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} disabled={viewMode === "yearly" || viewMode === "all"} size="small" sx={{ minWidth: 110, bgcolor: "background.default", borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" } }}>
                {Months.map((month, index) => <MenuItem key={index} value={month}>{month}</MenuItem>)}
              </Select>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: "100%", mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ ...sectionPaperSx, width: "100%" }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
            Category split
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Donut charts show where money came from and where it went for the selected view.
          </Typography>
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
          color={colors.error}
          height={barCategoryHeight}
          currencySymbol={currencySymbol}
          currencyCode={currencyCode}
          conversionRate={conversionRate}
        />
        <GridLikeTopCategories
          title="Top Income Categories"
          seriesName="Income"
          data={topIncomeCategories}
          color={colors.success}
          height={barCategoryHeight}
          sx={{ mt: 3 }}
          currencySymbol={currencySymbol}
          currencyCode={currencyCode}
          conversionRate={conversionRate}
        />
      </Box>

      <Box sx={{ width: "100%", mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ ...sectionPaperSx, width: "100%" }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
            Year-at-a-glance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pick a year to compare income and expenses month by month, then see how net results add up over
            time.
          </Typography>

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
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Monthly net (income − expense)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Positive months build surplus; negative months draw it down.
          </Typography>
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
                      [0, "rgba(144,202,249,0.35)"],
                      [1, "rgba(144,202,249,0.05)"],
                    ],
                  },
                  lineColor: "#64b5f6",
                  lineWidth: 2.5,
                  marker: {
                    enabled: true,
                    radius: 3,
                    fillColor: "#64b5f6",
                    lineColor: theme.palette.mode === "dark" ? "#0f1115" : "#fff",
                    lineWidth: 1,
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
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Cumulative net (year to date)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Running total of monthly net through {barYear}—shows whether you are building or eroding surplus
            across the year.
          </Typography>
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
                  lineWidth: 2.5,
                  lineColor: "#ffb74d",
                  fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, "rgba(255, 183, 77, 0.4)"],
                      [1, "rgba(255, 183, 77, 0.06)"],
                    ],
                  },
                  marker: {
                    enabled: true,
                    radius: 3,
                    fillColor: "#ffb74d",
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

const GridLikeTopCategories = ({
  title,
  data,
  color,
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
  const shades = data.map((_, idx) => {
    const factor = (idx / Math.max(data.length - 1, 1)) * 0.35 - 0.15;
    return Highcharts.color(base).brighten(factor).get();
  });

  const barData = convertedValues.map((y, idx) => ({
    y,
    color: {
      linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
      stops: [
        [0, Highcharts.color(shades[idx]).brighten(0.12).get()],
        [1, shades[idx]],
      ],
    },
  }));

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
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        Ranked by total amount for the selected analysis period.
      </Typography>
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
