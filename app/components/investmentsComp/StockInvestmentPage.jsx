"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { investmentChartColors, chartColors, colors, gradients } from "../../themeStyles";
import { alpha } from "@mui/material/styles";
import {
  InvestmentFormDialog,
  InvestmentDeleteDialog,
  StockFormFields,
  InvestmentStatCard,
} from "./InvestmentFormUi";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrencyQuery } from "../../services/useCurrencyServices";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_STOCK_CAPITAL;


const StockInvestmentPage = () => {
  const theme = useTheme();
  const investmentColors = investmentChartColors(theme.palette.mode);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    currency: "NPR",
  });
  const { data: currenciesFetched = [] } = useCurrencyQuery();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  // Fetch all capital investments
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["capitalInvestments"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/capital`);
      if (!response.ok) {
        throw new Error("Failed to fetch capital investments");
      }
      return response.json();
    },
  });

  const stockInvestments = apiResponse?.data || [];

  // Add new investment mutation
  const addInvestmentMutation = useMutation({
    mutationFn: async (newInvestment) => {
      const response = await fetch(`${API_BASE_URL}/capital`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInvestment),
      });
      if (!response.ok) {
        throw new Error("Failed to add investment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capitalInvestments"] });
      setFormData({ date: "", amount: "", currency: "NPR" });
      setOpenAddDialog(false);
    },
  });

  // Update investment mutation
  const updateInvestmentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${API_BASE_URL}/capital/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update investment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capitalInvestments"] });
      setFormData({ date: "", amount: "", currency: "NPR" });
      setOpenEditDialog(false);
      setSelectedInvestment(null);
    },
  });

  // Delete investment mutation
  const deleteInvestmentMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE_URL}/capital/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete investment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capitalInvestments"] });
      setOpenDeleteDialog(false);
      setSelectedInvestment(null);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAddDialog = () => {
    setFormData({ date: "", amount: "", currency: "NPR" });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (investment) => {
    setSelectedInvestment(investment);
    setFormData({
      date: investment.date.split("T")[0],
      amount: investment.amount.toString(),
      currency: investment.currency || "NPR",
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (investment) => {
    setSelectedInvestment(investment);
    setOpenDeleteDialog(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.amount) {
      addInvestmentMutation.mutate({
        date: formData.date,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
      });
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.amount && selectedInvestment) {
      updateInvestmentMutation.mutate({
        id: selectedInvestment._id,
        data: {
          date: formData.date,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedInvestment) {
      deleteInvestmentMutation.mutate(selectedInvestment._id);
    }
  };
  // Group investments by year
  const getYearlyInvestments = () => {
    if (!stockInvestments || stockInvestments.length === 0) return [];
    
    const yearlyData = {};

    stockInvestments.forEach((investment) => {
      const year = new Date(investment.date).getFullYear();
      if (!yearlyData[year]) {
        yearlyData[year] = 0;
      }
      yearlyData[year] += investment.amount;
    });

    return Object.keys(yearlyData)
      .sort()
      .map((year) => ({
        year: year,
        totalInvestment: yearlyData[year],
      }));
  };

  const chartData = getYearlyInvestments();

  const monthlyTimeline = () => {
    if (!stockInvestments || stockInvestments.length === 0) return [];
    const map = new Map();
    stockInvestments.forEach((inv) => {
      const d = new Date(inv.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const prev = map.get(key) || { label, month: key, invested: 0 };
      prev.invested += inv.amount;
      map.set(key, prev);
    });
    const arr = Array.from(map.values()).sort((a, b) => (a.month > b.month ? 1 : -1));
    let running = 0;
    return arr.map((entry) => {
      running += entry.invested;
      return { ...entry, cumulative: running };
    });
  };

  const timelineData = monthlyTimeline();
  
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "error.main" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading investments: {error.message}</Alert>
      </Box>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount) => {
    const num = Number(amount);
    if (!Number.isFinite(num)) return "-";
    const sign = num < 0 ? "-" : "";
    const abs = Math.abs(num);

    if (abs >= 1e6) return `${sign}NPR ${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${sign}NPR ${(abs / 1e3).toFixed(1)}K`;
    return `${sign}NPR ${abs.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            bgcolor: "background.paper",
            border: "1px solid", borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
            Year: {payload[0].payload.year}
          </Typography>
          <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600 }}>
            Investment: {formatCurrency(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const MomentumTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const monthly = payload.find((p) => p.dataKey === "invested")?.value;
    const cumulative = payload.find((p) => p.dataKey === "cumulative")?.value;
    const monthLabel = label ?? payload?.[0]?.payload?.label ?? "-";

    return (
      <Paper
        sx={{
          p: 2,
          bgcolor: "background.paper",
          border: "1px solid", borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>
          {monthLabel}
        </Typography>

        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "success.main" }} />
            <Typography variant="body2" sx={{ color: "success.main", fontWeight: 700 }}>
              Monthly invested: {formatCurrency(monthly ?? 0)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ffca28" }} />
            <Typography variant="body2" sx={{ color: "#ffca28", fontWeight: 700 }}>
              Cumulative total: {formatCurrency(cumulative ?? 0)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalInvestment = apiResponse?.totalAmount || stockInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const averageInvestment = stockInvestments.length > 0 ? totalInvestment / stockInvestments.length : 0;
  const lastInvestment = stockInvestments.length
    ? stockInvestments.reduce((latest, inv) =>
        new Date(inv.date) > new Date(latest.date) ? inv : latest
      )
    : null;
  const lastInvestmentDate = lastInvestment ? formatDate(lastInvestment.date) : "—";
  const lastInvestmentAmount = lastInvestment?.amount ?? 0;

  return (
    <Box sx={{ width: "100%" }}>

      <InvestmentFormDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        title="Add Stock Investment"
        subtitle="Record capital invested in NPR"
        icon={ShowChartIcon}
        headerVariant="stock"
        formId="stock-add-form"
        submitLabel="Add Investment"
        isPending={addInvestmentMutation.isPending}
        submitVariant="success"
      >
        <StockFormFields
          formId="stock-add-form"
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleAddSubmit}
          currencies={currenciesFetched}
          accent="error"
        />
      </InvestmentFormDialog>

      <InvestmentFormDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title="Edit Stock Investment"
        subtitle="Update date or amount for this entry"
        icon={EditIcon}
        headerVariant="stock"
        formId="stock-edit-form"
        submitLabel="Save Changes"
        isPending={updateInvestmentMutation.isPending}
        submitVariant="primary"
      >
        <StockFormFields
          formId="stock-edit-form"
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleEditSubmit}
          currencies={currenciesFetched}
          accent="primary"
        />
      </InvestmentFormDialog>

      <InvestmentDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        title="Delete Stock Investment"
        subtitle="This action cannot be undone"
        message="Are you sure you want to remove this stock capital record?"
        icon={DeleteIcon}
        headerVariant="stock"
        onConfirm={handleDeleteConfirm}
        isPending={deleteInvestmentMutation.isPending}
        rows={
          selectedInvestment
            ? [
                { label: "Date", value: formatDate(selectedInvestment.date) },
                {
                  label: "Amount",
                  value: formatCurrency(selectedInvestment.amount),
                  color: "error.main",
                },
              ]
            : []
        }
      />

      {/* Statistics + Add Investment Button */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 1.5 }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1.25, sm: 1.5 }}
          sx={{
            flex: 1,
            overflowX: { xs: "auto", sm: "visible" },
            pb: { xs: 0.5, sm: 0 },
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <InvestmentStatCard
            label="Total investments"
            value={formatCurrency(totalInvestment)}
            sub="All time"
            color={colors.errorDark}
            icon={ShowChartIcon}
          />
          <InvestmentStatCard
            label="Average per entry"
            value={formatCurrency(averageInvestment)}
            sub={`${stockInvestments.length} entries`}
            color={colors.primaryDark}
            icon={TrendingUpIcon}
          />
          <InvestmentStatCard
            label="Last investment"
            value={lastInvestment ? formatCurrency(lastInvestmentAmount) : lastInvestmentDate}
            sub={lastInvestment ? lastInvestmentDate : "Most recent"}
            color={colors.successDark}
            icon={CalendarMonthIcon}
          />
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            background: gradients.expense,
            color: "#fff",
            fontWeight: 600,
            borderRadius: "999px",
            px: 3,
            py: 1.5,
            whiteSpace: "nowrap",
            boxShadow: `0 4px 12px ${alpha(colors.errorDark, 0.3)}`,
            "&:hover": {
              background: gradients.expenseHover,
              transform: "translateY(-2px)",
              boxShadow: `0 6px 16px ${alpha(colors.errorDark, 0.4)}`,
            },
            transition: "all 0.3s ease",
          }}
        >
          Add Investment
        </Button>
      </Stack>

      {/* Bar Chart */}
      {stockInvestments.length > 0 ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid", borderColor: "divider",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #ef5350, #e53935)",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShowChartIcon sx={{ fontSize: 32, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>
                Yearly Investment Overview
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total amount invested per year
              </Typography>
            </Box>
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={investmentColors.stockBar.top} stopOpacity={1} />
                  <stop offset="100%" stopColor={investmentColors.stockBar.bottom} stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={investmentColors.grid} />
              <XAxis
                dataKey="year"
                stroke={investmentColors.axis}
                tick={{ fill: investmentColors.axis, fontSize: 14, fontWeight: 600 }}
              />
              <YAxis
                stroke={investmentColors.axis}
                tick={{ fill: investmentColors.axis, fontSize: 14 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(239, 83, 80, 0.12)" }} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: investmentColors.legend, fontSize: "14px", fontWeight: 600 }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="totalInvestment"
                fill="url(#stockGradient)"
                name="Total Investment"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 6,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid", borderColor: "divider",
            mb: 3,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              background: "linear-gradient(135deg, #ef5350, #e53935)",
              borderRadius: 3,
              p: 3,
              mb: 3,
            }}
          >
            <ShowChartIcon sx={{ fontSize: 64, color: "#fff", opacity: 0.7 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary", mb: 1 }}>
            No Investment Data
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Start by adding your first stock capital investment using the button above.
          </Typography>
        </Paper>
      )}

      {/* Transaction List */}
      {timelineData.length > 0 && (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid", borderColor: "divider",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #66bb6a, #43a047)",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShowChartIcon sx={{ fontSize: 32, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>
                Investment Momentum
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Monthly contributions and the running total over time
              </Typography>
            </Box>
          </Box>

          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={investmentColors.areaFillTop} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={investmentColors.areaFillBottom} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={chartColors.grid} />
              <XAxis
                dataKey="label"
                stroke={investmentColors.axis}
                tick={{ fill: investmentColors.axis, fontSize: 12, fontWeight: 600 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke={investmentColors.axis}
                tick={{ fill: investmentColors.axis, fontSize: 12 }}
                tickFormatter={(value) => formatCompactCurrency(value)}
                label={{
                  value: "Amount (NPR)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: investmentColors.axis, fontSize: 12, fontWeight: 600 },
                }}
              />
              <Tooltip
                content={<MomentumTooltip />}
                cursor={{
                  stroke: "rgba(102, 187, 106, 0.35)",
                  strokeWidth: 2,
                  fill: "rgba(102, 187, 106, 0.08)",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 12 }}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: investmentColors.legend, fontSize: "13px", fontWeight: 600 }}>{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="invested"
                name="Monthly invested"
                stroke={investmentColors.areaLine}
                fill="url(#areaFill)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: chartColors.pieBorder,
                  fill: investmentColors.areaLine,
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Cumulative total"
                stroke={investmentColors.cumulativeLine}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: chartColors.pieBorder,
                  fill: investmentColors.cumulativeLine,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5, px: 2 }}>
            Tip: hover over a month to see both the monthly invested amount and the cumulative total.
          </Typography>
        </Paper>
      )}

      {/* Transaction List */}
      {stockInvestments.length > 0 && (
        <Paper
          sx={{
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid", borderColor: "divider",
            overflow: "hidden",
          }}
        >
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid", borderBottomColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>
            Transaction History
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Detailed list of all stock investments
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                  }}
                >
                  Amount
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                  }}
                >
                  Year
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...stockInvestments].map((transaction, index) => (
                <TableRow
                  key={transaction._id}
                  sx={{
                    "&:hover": {
                      bgcolor: "rgba(255, 153, 102, 0.08)",
                    },
                    transition: "all 0.2s ease",
                    "&:nth-of-type(odd)": {
                      bgcolor: "background.paper",
                    },
                    "&:nth-of-type(even)": {
                      bgcolor: "background.default",
                    },
                  }}
                >
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {formatDate(transaction.date)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" fontWeight="700" sx={{ color: "error.main" }}>
                      {formatCurrency(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="600" sx={{ color: "primary.main" }}>
                      {new Date(transaction.date).getFullYear()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <IconButton
                        size="small"
                        sx={{
                          color: "primary.main",
                          bgcolor: "rgba(144, 202, 249, 0.1)",
                          border: "1px solid rgba(144, 202, 249, 0.3)",
                          "&:hover": {
                            bgcolor: "rgba(144, 202, 249, 0.2)",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => handleOpenEditDialog(transaction)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          color: "error.main",
                          bgcolor: "rgba(239, 83, 80, 0.1)",
                          border: "1px solid rgba(239, 83, 80, 0.3)",
                          "&:hover": {
                            bgcolor: "rgba(239, 83, 80, 0.2)",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => handleOpenDeleteDialog(transaction)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default StockInvestmentPage;
