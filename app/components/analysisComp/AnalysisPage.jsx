import {
  Box,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Typography,
  Stack,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
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
  const now = dayjs();
  const [currentYear, setCurrentYear] = React.useState(now.year());
  const [currentMonth, setCurrentMonth] = React.useState(now.format("MMMM"));
  const [viewMode, setViewMode] = React.useState("monthly");
  const [barYear, setBarYear] = React.useState(now.year());
  const [barType, setBarType] = React.useState("Expense");

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


  // useEffect(()=>{
  //   console.log("testLoading",testLoading)
  //   console.log("testTransactionDetails",testTransactionDetails)
  //   console.log("testError",testError)

  // },[testLoading,testTransactionDetails,testError])

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
    useEffect(()=>{
    console.log("isPendingAnalysis",isPendingAnalysis)
    console.log("analysisData",analysisData)
    console.log("isErrorAnalysis",isErrorAnalysis)

  },[isPendingAnalysis,analysisData,isErrorAnalysis])

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
    currency: "THB",
    maximumFractionDigits: 0,
  });

  const yearlyIncomeArray =
    (testTransactionDetails?.data?.IncomeArray ?? testTransactionDetails?.data?.IncomeArray) || [];
  const yearlyExpenseArray =
    (testTransactionDetails?.data?.ExpensesArray ?? testTransactionDetails?.data?.ExpensesArray) || [];

  const yearlyIncomeTotal = yearlyIncomeArray.reduce((sum, v) => sum + Number(v || 0), 0);
  const yearlyExpenseTotal = yearlyExpenseArray.reduce((sum, v) => sum + Number(v || 0), 0);
  const yearlyNetTotal = yearlyIncomeTotal - yearlyExpenseTotal;

  const netSeries = Months.map((m, idx) => {
    const income = Number(yearlyIncomeArray[idx] || 0);
    const expense = Number(yearlyExpenseArray[idx] || 0);
    return income - expense;
  });

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
      <TitleHeader text="Data Visualization" />

      {/* Overview stats */}
      <Paper
        sx={{
          width: "100%",
          mb: { xs: 2, sm: 3 },
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: "1px solid #23272f",
          background: "linear-gradient(135deg, rgba(255,153,102,0.08), rgba(255,94,98,0.04))",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 3 }} alignItems="stretch">
          <Stack spacing={1} flex={1}>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Current View
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`${viewMode === "monthly" ? currentMonth : "All Months"}`} size="small" sx={{ border: "1px solid #23272f" }} />
              <Chip label={`${currentYear}`} size="small" sx={{ border: "1px solid #23272f" }} />
            </Stack>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }} flex={2}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "background.default", flex: 1, border: "1px solid #23272f" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Income</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: "#43a047", mt: 0.5 }}>
                {currencyFmt.format(pieIncomeTotal)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "background.default", flex: 1, border: "1px solid #23272f" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Expense</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: "#ef5350", mt: 0.5 }}>
                {currencyFmt.format(pieTotalExpense)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "background.default", flex: 1, border: "1px solid #23272f" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Net</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: (pieIncomeTotal - pieTotalExpense) >= 0 ? "#90caf9" : "#ff8a80", mt: 0.5 }}>
                {currencyFmt.format(pieIncomeTotal - pieTotalExpense)}
              </Typography>
            </Paper>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ width: "100%", mb: { xs: 2, sm: 3 } }}>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: "1px solid #23272f",
            background: "rgba(255,255,255,0.02)",
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
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
              <span style={{ color: "#ef5350", fontWeight: 600 }}>
                Loading chart...
              </span>
            ) : (
              <>
                {pieDataExpense.length === 0 ? (
                  <span style={{ color: "#ef5350", fontWeight: 600 }}>
                    No data found
                  </span>
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
                        plotOptions: {
                          pie: {
                            innerSize: "50%",
                            dataLabels: {
                              enabled: true,
                              format: "{point.name}: ฿{point.y:,.0f}",
                              style: {
                                color: "white",
                                textOutline: "none",
                              },
                              backgroundColor: "none",
                              borderWidth: 0,
                              shadow: false,
                              padding: 0,
                              distance: 20,
                              connectorWidth: 1,
                              connectorColor: "#888",
                            },
                          },
                        },
                        credits: {
                          enabled: false,
                        },
                        series: [
                          {
                            name: "Expense",
                            data: pieDataExpense?.length
                              ? pieDataExpense.map((item) => ({
                                  name: item.label,
                                  y: item.value,
                                }))
                              : [],
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
                      <div style={{ fontWeight: 700, color: "#ef5350" }}>
                        Expense
                      </div>
                      <div style={{ color: "text.secondary" }}>
                        {currencyFmt.format(pieTotalExpense)}
                      </div>
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
              <span style={{ color: "#ef5350", fontWeight: 600 }}>
                Loading chart...
              </span>
            ) : (
              <>
                {pieDataIncome.length === 0 ? (
                  <span style={{ color: "#ef5350", fontWeight: 600 }}>
                    No data available
                  </span>
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
                        plotOptions: {
                          pie: {
                            innerSize: "50%",
                            dataLabels: {
                              enabled: true,
                              format: "{point.name}: ฿{point.y:,.0f}",
                              style: {
                                color: "white",
                                textOutline: "none",
                              },
                              backgroundColor: "none",
                              borderWidth: 0,
                              shadow: false,
                              padding: 0,
                              distance: 20,
                              connectorWidth: 1,
                              connectorColor: "#888",
                            },
                          },
                        },
                        credits: {
                          enabled: false,
                        },
                        series: [
                          {
                            name: "Income",
                            data: pieDataIncome?.length
                              ? pieDataIncome.map((item) => ({
                                  name: item.label,
                                  y: item.value,
                                }))
                              : [],
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
                      <div style={{ fontWeight: 700, color: "#43a047" }}>
                        Income
                      </div>
                      <div style={{ color: "text.secondary" }}>
                        {currencyFmt.format(pieIncomeTotal)}
                      </div>
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
        {isPendingAnalysis && (
          <Box sx={{ mt: 2, textAlign: "center", width: "100%" }}>
            <span style={{ color: "#ef5350", fontWeight: 600 }}>
              Loading data...
            </span>
          </Box>
        )}
        {isErrorAnalysis && (
          <Box sx={{ mt: 2, textAlign: "center", width: "100%" }}>
            <span style={{ color: "#ef5350", fontWeight: 600 }}>
              Error loading data.
            </span>
          </Box>
        )}

        {/* Top Categories under pies */}
        <GridLikeTopCategories
          title="Top Expense Categories"
          seriesName="Expense"
          data={topExpenseCategories}
          color="#ef5350"
          height={barCategoryHeight}
        />
        <GridLikeTopCategories
          title="Top Income Categories"
          seriesName="Income"
          data={topIncomeCategories}
          color="#43a047"
          height={barCategoryHeight}
          sx={{ mt: 3 }}
        />
      </Box>

      <Box sx={{ width: "100%", mt: { xs: 2, sm: 4 } }}>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: "1px solid #23272f",
            background: "rgba(255,255,255,0.02)",
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Net Trend (Income - Expense)
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Track monthly momentum and overall net for the selected year.
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
                labels: { style: { color: "#e0e0e0" } },
                lineColor: "rgba(255,255,255,0.2)",
                tickColor: "rgba(255,255,255,0.2)",
              },
              yAxis: {
                title: { text: "Amount (THB)", style: { color: "#e0e0e0" } },
                labels: { style: { color: "#e0e0e0" } },
                gridLineColor: "rgba(255,255,255,0.08)",
              },
              tooltip: {
                shared: true,
                backgroundColor: "rgba(17,20,24,0.9)",
                borderWidth: 0,
                style: { color: "#fff" },
                pointFormat:
                  '<span style="color:{point.color}">●</span> Net: <b>฿{point.y:,.0f}</b><br/>',
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
                    lineColor: "#0f1115",
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
              bgcolor: "rgba(0,0,0,0.02)",
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
                {currencyFmt.format(yearlyExpenseTotal)}
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
                {currencyFmt.format(yearlyIncomeTotal)}
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
                {currencyFmt.format(yearlyNetTotal)}
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
            <span style={{ color: "#ef5350", fontWeight: 600 }}>
              Loading chart...
            </span>
          ) : (
            <Box
              sx={{
                width: "100%",
                maxWidth: "800px",
                minHeight: 300,
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                p: 2,
                transition:
                  "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                opacity: 1,
                transform: "translateZ(0)",
                willChange: "transform, opacity",
              }}
            >
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
                    text: "Monthly Income vs Expense",
                    style: {
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "500",
                    },
                  },
                  xAxis: {
                    categories: Months,
                    title: {
                      text: "Month",
                      style: {
                        color: "white",
                      },
                    },
                    labels: {
                      style: {
                        color: "white",
                      },
                    },
                    lineColor: "rgba(255, 255, 255, 0.3)",
                    tickColor: "rgba(255, 255, 255, 0.3)",
                  },
                  yAxis: {
                    title: {
                      text: "Amount (THB)",
                      style: {
                        color: "white",
                      },
                    },
                    labels: {
                      style: {
                        color: "white",
                      },
                    },
                    gridLineColor: "rgba(255, 255, 255, 0.1)",
                  },
                  tooltip: {
                    headerFormat:
                      '<span style="font-size:12px">{point.key}</span><br/>',
                    pointFormat:
                      '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>฿{point.y:,.0f}</b>',
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderWidth: 0,
                    shadow: true,
                  },
                  legend: {
                    enabled: false, // Removes the legend completely
                  },
                  plotOptions: {
                    column: {
                      borderRadius: 3,
                      states: {
                        hover: {
                          brightness: -0.1,
                        },
                      },
                      showInLegend: false, // Ensures series doesn't show in legend
                    },
                  },
                  credits: {
                    enabled: false,
                  },
                  series: [
                    {
                      name: "Income",
                      data: yearlyIncomeArray,
                      color: "#43a047",
                    },
                    {
                      name: "Expense",
                      data: yearlyExpenseArray,
                      color: "#ef5350",
                    },
                  ],
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const GridLikeTopCategories = ({ title, data, color, seriesName, sx, height = 320 }) => {
  if (!data || data.length === 0) return null;

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: "1px solid #23272f",
        background: "rgba(255,255,255,0.02)",
        mt: { xs: 2, sm: 3 },
        width: "100%",
        ...sx,
      }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        Top categories by total amount.
      </Typography>
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          chart: { type: "bar", backgroundColor: "transparent", height },
          title: { text: "" },
          xAxis: {
            categories: data.map((d) => d.name),
            labels: { style: { color: "#e0e0e0" } },
            lineColor: "rgba(255,255,255,0.2)",
            tickColor: "rgba(255,255,255,0.2)",
          },
          yAxis: {
            title: { text: "Amount (THB)", style: { color: "#e0e0e0" } },
            labels: { style: { color: "#e0e0e0" } },
            gridLineColor: "rgba(255,255,255,0.08)",
          },
          legend: { enabled: false },
          credits: { enabled: false },
          tooltip: {
            backgroundColor: "rgba(17,20,24,0.9)",
            borderWidth: 0,
            style: { color: "#fff" },
            pointFormat:
              `<span style="color:${color}">●</span> ${seriesName}: <b>฿{point.y:,.0f}</b><br/>`,
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              dataLabels: {
                enabled: true,
                formatter: function () {
                  return `฿${Highcharts.numberFormat(this.y, 0)}`;
                },
                style: { color: "#e0e0e0" },
              },
            },
          },
          series: [
            {
              name: seriesName,
              data: data.map((d) => d.value),
              color,
            },
          ],
        }}
      />
    </Paper>
  );
};

export default AnalysisPage;
