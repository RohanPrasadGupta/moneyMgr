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
  const chartAxisColor = theme.palette.mode === "dark" ? "#cfd8dc" : "#546e7a";
  const chartGridColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const pieSliceBorder = theme.palette.mode === "dark" ? "#0f1115" : "#eceff1";
  const pieDataLabelColor = theme.palette.mode === "dark" ? "#eceff1" : "#37474f";
  const pieConnectorColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(55,71,79,0.35)";
  const sectionPaperSx = {
    p: { xs: 2, sm: 3 },
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    backgroundImage:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(255,153,102,0.06), rgba(100,181,246,0.04))"
        : "linear-gradient(135deg, rgba(255,153,102,0.07), rgba(100,181,246,0.05))",
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
      <TitleHeader text="Spending analysis" />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2, textAlign: "center", maxWidth: 720, px: 1 }}
      >
        Compare income and expenses by period, spot your largest categories, and follow net flow through the
        year.
      </Typography>

      {/* Overview stats */}
      <Paper
        sx={{
          width: "100%",
          mb: { xs: 2, sm: 3 },
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundImage:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(255,153,102,0.1), rgba(255,94,98,0.05))"
              : "linear-gradient(135deg, rgba(255,153,102,0.12), rgba(100,181,246,0.06))",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 3 }} alignItems="stretch">
          <Stack spacing={1} flex={1}>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Current View
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`${viewMode === "monthly" ? currentMonth : viewMode === "yearly" ? "Full year" : "All time"}`}
                size="small"
                sx={{ border: "1px solid", borderColor: "divider" }}
              />
              <Chip label={`${currentYear}`} size="small" sx={{ border: "1px solid", borderColor: "divider" }} />
              <Chip label={viewMode} size="small" variant="outlined" sx={{ borderColor: "divider" }} />
            </Stack>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }} flex={2}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "background.default", flex: 1, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Income</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: "#43a047", mt: 0.5 }}>
                {formatAmount(pieIncomeTotal)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "background.default", flex: 1, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Expense</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: "#ef5350", mt: 0.5 }}>
                {formatAmount(pieTotalExpense)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "background.default", flex: 1, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Net</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: (pieIncomeTotal - pieTotalExpense) >= 0 ? "#90caf9" : "#ff8a80", mt: 0.5 }}>
                {formatAmount(pieIncomeTotal - pieTotalExpense)}
              </Typography>
            </Paper>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ width: "100%", mb: { xs: 2, sm: 3 } }}>
        <Paper
          sx={{
            ...sectionPaperSx,
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Button
              variant={selectedCurrency === "THB" ? "contained" : "outlined"}
              onClick={() => setSelectedCurrency((prev) => (prev === "THB" ? "NPR" : "THB"))}
              disableElevation
              sx={{
                borderRadius: 2.5,
                minWidth: 150,
                px: 2,
                py: 1,
                fontWeight: 700,
                letterSpacing: 0.2,
                textTransform: "none",
                color: "#fff",
                borderColor: selectedCurrency === "THB" ? "transparent" : "primary.main",
                background:
                  selectedCurrency === "THB"
                    ? "linear-gradient(135deg, #7c4dff 0%, #00bcd4 100%)"
                    : "linear-gradient(135deg, #ff8a65 0%, #ff7043 100%)",
                boxShadow:
                  selectedCurrency === "THB"
                    ? "0 8px 20px rgba(124,77,255,0.35)"
                    : "0 8px 20px rgba(255,112,67,0.35)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
                "&:hover": {
                  background:
                    selectedCurrency === "THB"
                      ? "linear-gradient(135deg, #6f42f5 0%, #00acc1 100%)"
                      : "linear-gradient(135deg, #ff7043 0%, #f4511e 100%)",
                  boxShadow:
                    selectedCurrency === "THB"
                      ? "0 12px 24px rgba(124,77,255,0.45)"
                      : "0 12px 24px rgba(255,112,67,0.45)",
                  transform: "translateY(-1px)",
                  filter: "brightness(1.03)",
                },
                "&:active": {
                  transform: "translateY(1px) scale(0.99)",
                  boxShadow: "0 5px 14px rgba(0,0,0,0.2)",
                },
              }}
            >
              {selectedCurrency === "THB" ? "Switch to NPR" : "Switch to THB"}
            </Button>
            <Select
              labelId="exchange-range-select-label"
              id="exchange-range-select"
              value={selectedExchangeRange}
              onChange={(e) => setSelectedExchangeRange(e.target.value)}
              disabled={selectedCurrency !== "NPR"}
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                minWidth: 170,
                bgcolor: "background.default",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              {exchangeRateOptions.map((rate) => (
                <MenuItem key={rate.value} value={rate.value}>
                  1 THB = {rate.label}
                </MenuItem>
              ))}
            </Select>
            <Select
              labelId="year-select-label"
              id="year-select"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              disabled={viewMode === "all"}
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                minWidth: 90,
                bgcolor: "background.default",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              {Years.map((year, index) => (
                <MenuItem
                  key={index}
                  value={year}
                  sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem" } }}
                >
                  {year}
                </MenuItem>
              ))}
            </Select>
            <Select
              labelId="view-mode-select-label"
              id="view-mode-select"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                minWidth: 110,
                bgcolor: "background.default",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
              <MenuItem value="all">View All</MenuItem>
            </Select>
            <Select
              labelId="month-select-label"
              id="month-select"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              disabled={viewMode === "yearly" || viewMode === "all"}
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                minWidth: 110,
                bgcolor: "background.default",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              {Months.map((month, index) => (
                <MenuItem
                  key={index}
                  value={month}
                  sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem" } }}
                >
                  {month}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Paper>

        <Paper sx={{ ...sectionPaperSx, width: "100%" }}>
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
                          backgroundColor: "rgba(17,20,24,0.9)",
                          style: { color: "#fff", borderRadius: 12 },
                          formatter: function () {
                            return `<div style="padding:6px 8px;">` +
                              `<div style="font-weight:700;color:${this.color}">${this.point.name}</div>` +
                              `<div style="color:#fff">${currencySymbol}${Highcharts.numberFormat(this.y,0)}</div>` +
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
                          backgroundColor: "rgba(17,20,24,0.9)",
                          style: { color: "#fff", borderRadius: 12 },
                          formatter: function () {
                            return `<div style="padding:6px 8px;">` +
                              `<div style="font-weight:700;color:${this.color}">${this.point.name}</div>` +
                              `<div style="color:#fff">${currencySymbol}${Highcharts.numberFormat(this.y,0)}</div>` +
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
        </Paper>

        {/* Top Categories under pies */}
        <GridLikeTopCategories
          title="Top Expense Categories"
          seriesName="Expense"
          data={topExpenseCategories}
          color="#ef5350"
          height={barCategoryHeight}
          currencySymbol={currencySymbol}
          currencyCode={currencyCode}
          conversionRate={conversionRate}
        />
        <GridLikeTopCategories
          title="Top Income Categories"
          seriesName="Income"
          data={topIncomeCategories}
          color="#43a047"
          height={barCategoryHeight}
          sx={{ mt: 3 }}
          currencySymbol={currencySymbol}
          currencyCode={currencyCode}
          conversionRate={conversionRate}
        />
      </Box>

      <Box sx={{ width: "100%" }}>
        <Paper sx={{ ...sectionPaperSx, mb: { xs: 2, sm: 3 } }}>
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
            mb: { xs: 2, sm: 2 },
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
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                minWidth: 90,
                bgcolor: "background.default",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              {Years.map((year, index) => (
                <MenuItem
                  key={index}
                  value={year}
                  sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem" } }}
                >
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 3, sm: 6 },
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              p: 2,
              borderRadius: 2,
              bgcolor: "action.hover",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  fontSize: "0.9rem",
                  color: "text.secondary",
                  mb: 0.5,
                  fontWeight: 500,
                }}
              >
                Annual Expense
              </Box>
              <Box
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#ef5350",
                }}
              >
                {formatAmount(yearlyExpenseTotal)}
              </Box>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  fontSize: "0.9rem",
                  color: "text.secondary",
                  mb: 0.5,
                  fontWeight: 500,
                }}
              >
                Annual Income
              </Box>
              <Box
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#43a047",
                }}
              >
                {formatAmount(yearlyIncomeTotal)}
              </Box>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  fontSize: "0.9rem",
                  color: "text.secondary",
                  mb: 0.5,
                  fontWeight: 500,
                }}
              >
                Net (Income - Expense)
              </Box>
              <Box
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: yearlyNetTotal >= 0 ? "#90caf9" : "#ff8a80",
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
                          [0, "#66bb6a"],
                          [1, "#2e7d32"],
                        ],
                      },
                    },
                    {
                      name: "Expense",
                      data: displayedYearlyExpenseArray,
                      color: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                          [0, "#ff867c"],
                          [1, "#c62828"],
                        ],
                      },
                    },
                  ],
                }}
              />
            </Box>
          )}
        </Box>
        </Paper>

         <Paper sx={{ ...sectionPaperSx, mb: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3 } }}>
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
                  lineColor: "#90caf9",
                  lineWidth: 2.5,
                  marker: {
                    enabled: true,
                    radius: 3,
                    fillColor: "#90caf9",
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
        </Paper>

        <Paper sx={{ ...sectionPaperSx, mb: { xs: 2, sm: 3 } }}>
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
        </Paper>
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

  const shades = data.map((_, idx) => {
    const factor = (idx / Math.max(data.length - 1, 1)) * 0.4 - 0.2; // range approx -0.2..0.2
    return Highcharts.color(color).brighten(factor).get();
  });

  const chartAxisColor = theme.palette.mode === "dark" ? "#cfd8dc" : "#546e7a";
  const chartGridColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const convertedValues = data.map((d) => Number(d.value || 0) * conversionRate);

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        backgroundImage:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(255,153,102,0.06), rgba(100,181,246,0.04))"
            : "linear-gradient(135deg, rgba(255,153,102,0.07), rgba(100,181,246,0.05))",
        mt: { xs: 2, sm: 3 },
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
            backgroundColor: "rgba(17,20,24,0.9)",
            borderWidth: 0,
            style: { color: "#fff" },
            useHTML: true,
            formatter: function () {
              const rank = (this.point?.index ?? this.point?.x ?? 0) + 1;
              return (
                `<span style="color:${color}">●</span> ${seriesName}: <b>${currencySymbol}${Highcharts.numberFormat(this.y, 0)}</b><br/>` +
                `<span style="color:#b0bec5">Rank #${rank}</span>`
              );
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              colorByPoint: true,
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
              data: convertedValues,
              colors: shades,
              color,
            },
          ],
        }}
      />
    </Paper>
  );
};

export default AnalysisPage;
