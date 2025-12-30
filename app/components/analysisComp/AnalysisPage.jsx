import {
  Box,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
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

  // Get categories from backend API
  const { isPending: isPendingCategories, data: categoryData } =
    useCategoryQuery();

  const { isPending: isPendingAllData, data: allTransactionData } = useQuery({
    queryKey: ["getAllTransactionData"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data`, {
        method: "GET",
        credentials: "include",
      }).then((res) => res.json()),
  });

  const pieDataExpense = React.useMemo(() => {
    const source =
      viewMode === "monthly"
        ? transactionDetails?.data
        : allTransactionData?.data;
    if (!source) return [];
    const sums = {};
    source.forEach((tx) => {
      if (viewMode === "yearly") {
        const txDate = dayjs(tx.date);
        if (txDate.year() !== Number(currentYear)) return;
      }
      if (tx.type !== "Expense") return;
      const category = tx.category || "Uncategorized";
      sums[category] = (sums[category] || 0) + Number(tx.amount || 0);
    });

    return Object.entries(sums)
      .sort((a, b) => b[1] - a[1])
      .map(([category, value], idx) => ({
        id: idx,
        value,
        label: category,
      }));
  }, [transactionDetails, allTransactionData, viewMode, currentYear]);

  const pieDataIncome = React.useMemo(() => {
    const source =
      viewMode === "monthly"
        ? transactionDetails?.data
        : allTransactionData?.data;
    if (!source) return [];
    const sums = {};
    source.forEach((tx) => {
      if (viewMode === "yearly") {
        const txDate = dayjs(tx.date);
        if (txDate.year() !== Number(currentYear)) return;
      }
      if (tx.type !== "Income") return;
      const category = tx.category || "Uncategorized";
      sums[category] = (sums[category] || 0) + Number(tx.amount || 0);
    });

    return Object.entries(sums)
      .sort((a, b) => b[1] - a[1])
      .map(([category, value], idx) => ({
        id: idx,
        value,
        label: category,
      }));
  }, [transactionDetails, allTransactionData, viewMode, currentYear]);

  const pieTotalExpense = React.useMemo(
    () => pieDataExpense.reduce((s, d) => s + Number(d.value || 0), 0),
    [pieDataExpense]
  );
  const pieIncomeTotal = React.useMemo(
    () => pieDataIncome.reduce((s, d) => s + Number(d.value || 0), 0),
    [pieDataIncome]
  );

  const currencyFmt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
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
      }}
    >
      <TitleHeader text="Data Visualization" />

      <Box sx={{ width: "100%", mb: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
            mt: { xs: 1, sm: 2 },
            mb: { xs: 1, sm: 2 },
          }}
        >
          <Select
            labelId="year-select-label"
            id="year-select"
            value={currentYear}
            onChange={(e) => setCurrentYear(e.target.value)}
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
          </Select>
          <Select
            labelId="month-select-label"
            id="month-select"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            disabled={viewMode === "yearly"}
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
        </Box>
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
            {isPendingAllData ? (
              <span style={{ color: "#ef5350", fontWeight: 600 }}>
                Loading chart...
              </span>
            ) : (
              <>
                {pieTotalExpense === 0 ? (
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
                          height: "300",
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
            {isPendingAllData ? (
              <span style={{ color: "#ef5350", fontWeight: 600 }}>
                Loading chart...
              </span>
            ) : (
              <>
                {pieIncomeTotal === 0 ? (
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
                          height: "300",
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
        {isPending && (
          <Box sx={{ mt: 2, textAlign: "center", width: "100%" }}>
            <span style={{ color: "#ef5350", fontWeight: 600 }}>
              Loading data...
            </span>
          </Box>
        )}
        {isError && (
          <Box sx={{ mt: 2, textAlign: "center", width: "100%" }}>
            <span style={{ color: "#ef5350", fontWeight: 600 }}>
              Error loading data.
            </span>
          </Box>
        )}
      </Box>

      <Box sx={{ width: "100%", mt: { xs: 2, sm: 4 } }}>
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
            {/* <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                width: "100%",
                maxWidth: 400,
                mx: "auto",
              }}
            >
              {["Expense", "Income"].map((type) => (
                <Box
                  key={type}
                  onClick={() => setBarType(type)}
                  sx={{
                    cursor: "pointer",
                    padding: "12px 24px",
                    borderRadius: 2,
                    bgcolor: "rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    border: "2px solid",
                    borderColor:
                      barType === type
                        ? type === "Expense"
                          ? "#ef5350"
                          : "#43a047"
                        : "transparent",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor:
                        type === "Expense" ? "#ef5350" : "#43a047",
                      opacity: barType === type ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      zIndex: 0,
                    },
                    "& > span": {
                      position: "relative",
                      zIndex: 1,
                      fontSize: "1rem",
                      fontWeight: barType === type ? 600 : 500,
                      color:
                        barType === type
                          ? "white"
                          : type === "Expense"
                          ? "#ef5350"
                          : "#43a047",
                      transition: "all 0.3s ease",
                    },
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow:
                        barType === type
                          ? "none"
                          : "0 4px 12px rgba(0,0,0,0.1)",
                      "&::before": {
                        opacity: barType === type ? 1 : 0.1,
                      },
                      "& > span": {
                        color:
                          barType === type
                            ? "white"
                            : type === "Expense"
                            ? "#ef5350"
                            : "#43a047",
                      },
                    },
                  }}
                >
                  <span>{type}</span>
                </Box>
              ))}
            </Box> */}
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
                {currencyFmt.format(
                  allTransactionData?.data
                    ?.filter(
                      (tx) =>
                        dayjs(tx.date).year() === Number(barYear) &&
                        tx.type === "Expense"
                    )
                    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0
                )}
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
                {currencyFmt.format(
                  allTransactionData?.data
                    ?.filter(
                      (tx) =>
                        dayjs(tx.date).year() === Number(barYear) &&
                        tx.type === "Income"
                    )
                    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0
                )}
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
          {isPendingAllData ? (
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
                    height: 300,
                    style: {
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
                    },
                  },
                  title: {
                    text:
                      barType === "Expense"
                        ? "Monthly Expense"
                        : "Monthly Income",
                    style: {
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "500",
                    },
                  },
                  xAxis: {
                    categories: barChartData?.[barType]?.map((item) => item.month) || [],
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
                      data: barChartData?.Income?.map((item) => item.value) || [],
                      color: "#43a047",
                    },
                    {
                      name: "Expense",
                      data: barChartData?.Expense?.map((item) => item.value) || [],
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

export default AnalysisPage;
