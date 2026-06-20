"use client";

import React, { useState, useMemo } from "react";
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
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import { investmentChartColors, colors, statCardSx } from "../../themeStyles";
import {
  InvestmentFormDialog,
  InvestmentDeleteDialog,
  CoinFormFields,
} from "./InvestmentFormUi";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_COIN_CAPITAL;


const CoinInvestmentPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    transactionCharge: "",
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [bhtToNprRate, setBhtToNprRate] = useState("4.3");

  const bhtToNprOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const value = (4.1 + i * 0.1).toFixed(1);
        return { value, label: `1 BHT = ${value} NPR` };
      }),
    []
  );

  const conversionRate = Number(bhtToNprRate) || 4.3;
  const convertBhtToNpr = (bhtAmount) => bhtAmount * conversionRate;

  // Fetch all coin investments
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["coinInvestments"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/coin-capital`);
      if (!response.ok) {
        throw new Error("Failed to fetch coin investments");
      }
      return response.json();
    },
  });

  const coinInvestments = apiResponse?.data || [];

  // Add new investment mutation
  const addInvestmentMutation = useMutation({
    mutationFn: async (newInvestment) => {
      const totalAmount = parseFloat(newInvestment.amount) + parseFloat(newInvestment.transactionCharge);
      const response = await fetch(`${API_BASE_URL}/coin-capital`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newInvestment,
          totalAmount,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add investment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coinInvestments"] });
      setFormData({ date: "", amount: "", transactionCharge: "" });
      setOpenAddDialog(false);
    },
  });

  // Update investment mutation
  const updateInvestmentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${API_BASE_URL}/coin-capital/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["coinInvestments"] });
      setFormData({ date: "", amount: "", transactionCharge: "" });
      setOpenEditDialog(false);
      setSelectedInvestment(null);
    },
  });

  // Delete investment mutation
  const deleteInvestmentMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE_URL}/coin-capital/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete investment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coinInvestments"] });
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
    setFormData({ date: "", amount: "", transactionCharge: "" });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (investment) => {
    setSelectedInvestment(investment);
    setFormData({
      date: investment.date.split("T")[0],
      amount: investment.amount.toString(),
      transactionCharge: investment.transactionCharge.toString(),
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (investment) => {
    setSelectedInvestment(investment);
    setOpenDeleteDialog(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.amount && formData.transactionCharge) {
      addInvestmentMutation.mutate({
        date: formData.date,
        amount: parseFloat(formData.amount),
        transactionCharge: parseFloat(formData.transactionCharge),
      });
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.amount && formData.transactionCharge && selectedInvestment) {
      updateInvestmentMutation.mutate({
        id: selectedInvestment._id,
        data: {
          date: formData.date,
          amount: parseFloat(formData.amount),
          transactionCharge: parseFloat(formData.transactionCharge),
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
    if (!coinInvestments || coinInvestments.length === 0) return [];
    
    const yearlyData = {};

    coinInvestments.forEach((investment) => {
      const year = new Date(investment.date).getFullYear();
      if (!yearlyData[year]) {
        yearlyData[year] = {
          amount: 0,
          charges: 0,
          total: 0,
        };
      }
      yearlyData[year].amount += investment.amount;
      yearlyData[year].charges += investment.transactionCharge;
      yearlyData[year].total += investment.totalAmount;
    });

    return Object.keys(yearlyData)
      .sort()
      .map((year) => ({
        year: year,
        amount: yearlyData[year].amount,
        transactionCharges: yearlyData[year].charges,
        totalInvestment: yearlyData[year].total,
      }));
  };

  const chartData = getYearlyInvestments();

  const formatCurrencyBHT = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyNPR = (amount) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}>
            Year: {payload[0].payload.year}
          </Typography>
          <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600 }}>
            Investment: {formatCurrencyBHT(payload[0].payload.amount)}
          </Typography>
          <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600 }}>
            Charges: {formatCurrencyBHT(payload[0].payload.transactionCharges)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "primary.main", fontWeight: 700, mt: 0.5, pt: 0.5, borderTop: "1px solid", borderTopColor: "divider" }}
          >
            Total (BHT): {formatCurrencyBHT(payload[0].value)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "success.main", fontWeight: 700, mt: 0.5 }}
          >
            Total (NPR): {formatCurrencyNPR(convertBhtToNpr(payload[0].value))}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const totalInvestment = apiResponse?.summary?.totalAmount || coinInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCharges = apiResponse?.summary?.totalTransactionCharge || coinInvestments.reduce((sum, inv) => sum + inv.transactionCharge, 0);
  const grandTotal = apiResponse?.summary?.grandTotal || coinInvestments.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const grandTotalInNPR = convertBhtToNpr(grandTotal);

  const NprSubtext = ({ bhtAmount }) => (
    <Typography
      variant="caption"
      sx={{ color: "text.secondary", display: "block", mt: 0.75, fontWeight: 600 }}
    >
      ≈ {formatCurrencyNPR(convertBhtToNpr(bhtAmount))}
    </Typography>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 2 }}>
        <CircularProgress size={60} sx={{ color: "error.main" }} />
        <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Loading coin investments...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading coin investments: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <InvestmentFormDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        title="Add Coin Investment"
        subtitle="Record amount and fees in BHT"
        icon={CurrencyBitcoinIcon}
        headerVariant="coin"
        formId="coin-add-form"
        submitLabel="Add Investment"
        isPending={addInvestmentMutation.isPending}
        submitVariant="success"
      >
        <CoinFormFields
          formId="coin-add-form"
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleAddSubmit}
          accent="error"
          isMobile={isMobile}
        />
      </InvestmentFormDialog>

      <InvestmentFormDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title="Edit Coin Investment"
        subtitle="Update date, amount, or transaction charge"
        icon={EditIcon}
        headerVariant="coin"
        formId="coin-edit-form"
        submitLabel="Save Changes"
        isPending={updateInvestmentMutation.isPending}
        submitVariant="primary"
      >
        <CoinFormFields
          formId="coin-edit-form"
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleEditSubmit}
          accent="primary"
          isMobile={isMobile}
        />
      </InvestmentFormDialog>

      <InvestmentDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        title="Delete Coin Investment"
        subtitle="This action cannot be undone"
        message="Are you sure you want to remove this coin investment record?"
        icon={DeleteIcon}
        headerVariant="coin"
        onConfirm={handleDeleteConfirm}
        isPending={deleteInvestmentMutation.isPending}
        rows={
          selectedInvestment
            ? [
                { label: "Date", value: formatDate(selectedInvestment.date) },
                {
                  label: "Amount",
                  value: formatCurrencyBHT(selectedInvestment.amount),
                  color: "primary.main",
                },
                {
                  label: "Total",
                  value: formatCurrencyBHT(selectedInvestment.totalAmount),
                  color: "primary.main",
                },
              ]
            : []
        }
      />

      {/* BHT → NPR conversion */}
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: alpha(colors.primary, 0.35),
          bgcolor: alpha(colors.primary, 0.04),
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary" }}>
              BHT → NPR conversion
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Select a rate to see NPR amounts on stats, chart tooltips, and the table.
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
            <InputLabel id="bht-npr-rate-label" sx={{ color: "text.secondary" }}>
              Exchange rate
            </InputLabel>
            <Select
              labelId="bht-npr-rate-label"
              label="Exchange rate"
              value={bhtToNprRate}
              onChange={(e) => setBhtToNprRate(e.target.value)}
              sx={{
                bgcolor: "background.default",
                color: "text.primary",
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
              }}
            >
              {bhtToNprOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Statistics Cards with Add Button */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, alignItems: "stretch" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCardSx("error")}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
              TOTAL INVESTMENT (BHT)
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "error.main", mt: 1, fontSize: { xs: "1.35rem", sm: "1.5rem", md: "1.75rem" } }}>
              {formatCurrencyBHT(totalInvestment)}
            </Typography>
            <NprSubtext bhtAmount={totalInvestment} />
            <Chip label="Principal" size="small" sx={{ mt: 1.5, border: "1px solid", borderColor: alpha(colors.error, 0.35) }} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCardSx("error")}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
              TRANSACTION CHARGES
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "error.main", mt: 1, fontSize: { xs: "1.35rem", sm: "1.5rem", md: "1.75rem" } }}>
              {formatCurrencyBHT(totalCharges)}
            </Typography>
            <NprSubtext bhtAmount={totalCharges} />
            <Chip label="Fees" size="small" sx={{ mt: 1.5, border: "1px solid", borderColor: alpha(colors.error, 0.35) }} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCardSx("primary")}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
              GRAND TOTAL (BHT)
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "primary.main", mt: 1, fontSize: { xs: "1.35rem", sm: "1.5rem", md: "1.75rem" } }}>
              {formatCurrencyBHT(grandTotal)}
            </Typography>
            <NprSubtext bhtAmount={grandTotal} />
            <Chip label="All time" size="small" sx={{ mt: 1.5, border: "1px solid", borderColor: alpha(colors.primary, 0.35) }} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCardSx("success")}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
              NPR AMOUNT (×{conversionRate.toFixed(1)})
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "success.main", mt: 1, fontSize: { xs: "1.35rem", sm: "1.5rem", md: "1.75rem" } }}>
              {formatCurrencyNPR(grandTotalInNPR)}
            </Typography>
            <Chip label="Grand total converted" size="small" sx={{ mt: 1.5, border: "1px solid", borderColor: alpha(colors.success, 0.4) }} />
          </Paper>
        </Grid>
        <Grid item xs={12} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-end" }, alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />}
            onClick={handleOpenAddDialog}
            fullWidth={isMobile}
            sx={{
              background: "linear-gradient(135deg, #ef5350, #e53935)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: { xs: 2.5, sm: 3, md: 3 },
              py: { xs: 1.25, sm: 1.375, md: 1.5 },
              fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
              boxShadow: "0 4px 12px rgba(239, 83, 80, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #e53935, #ef5350)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(239, 83, 80, 0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Add Investment
          </Button>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      {coinInvestments.length > 0 ? (
        <Paper
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 2, sm: 2.5, md: 3 },
          bgcolor: "background.paper",
          border: "1px solid", borderColor: "divider",
          mb: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #ef5350, #e53935)",
              borderRadius: 2,
              p: { xs: 1, sm: 1.25, md: 1.5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CurrencyBitcoinIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary", fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}>
              Yearly Coin Investment Overview
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
              Total amount invested per year in BHT (including transaction charges)
            </Typography>
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={isMobile ? 300 : isTablet ? 350 : 400}>
          <BarChart data={chartData} margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: 5 }}>
            <defs>
              <linearGradient id="coinGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={investmentChartColors.coinBar.top} stopOpacity={1} />
                <stop offset="100%" stopColor={investmentChartColors.coinBar.bottom} stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={investmentChartColors.grid} />
            <XAxis
              dataKey="year"
              stroke={investmentChartColors.axis}
              tick={{ fill: investmentChartColors.axis, fontSize: isMobile ? 12 : 14, fontWeight: 600 }}
            />
            <YAxis
              stroke={investmentChartColors.axis}
              tick={{ fill: investmentChartColors.axis, fontSize: isMobile ? 11 : 14 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(100, 181, 246, 0.12)" }} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: investmentChartColors.legend, fontSize: isMobile ? "12px" : "14px", fontWeight: 600 }}>
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="totalInvestment"
              fill="url(#coinGradient)"
              name="Total Investment (with charges)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
      ) : (
        <Paper
          sx={{
            p: { xs: 4, sm: 5, md: 6 },
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            bgcolor: "background.paper",
            border: "1px solid", borderColor: "divider",
            mb: { xs: 2, sm: 2.5, md: 3 },
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              background: "linear-gradient(135deg, #ef5350, #e53935)",
              borderRadius: 3,
              p: { xs: 2, sm: 2.5, md: 3 },
              mb: { xs: 2, sm: 2.5, md: 3 },
            }}
          >
            <CurrencyBitcoinIcon sx={{ fontSize: { xs: 48, sm: 56, md: 64 }, color: "#fff", opacity: 0.7 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary", mb: 1, fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' } }}>
            No Coin Investment Data
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Start by adding your first coin investment using the button above.
          </Typography>
        </Paper>
      )}

      {/* Transaction List */}
      {coinInvestments.length > 0 && (
        <Paper
          sx={{
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            bgcolor: "background.paper",
            border: "1px solid", borderColor: "divider",
            overflow: "hidden",
          }}
        >
        <Box
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: "1px solid", borderBottomColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary", fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}>
            Transaction History
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
            Detailed list of all coin investments in BHT with transaction charges
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: isMobile ? 400 : 500, overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Amount (BHT)
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                    display: { xs: 'none', sm: 'table-cell' },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Charges (BHT)
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Total (BHT)
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid",
                    borderBottomColor: "success.main",
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Total (NPR)
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                    display: { xs: 'none', md: 'table-cell' },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Year
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                    bgcolor: "background.paper",
                    color: "text.primary",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid", borderBottomColor: "error.main",
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...coinInvestments]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((transaction, index) => (
                <TableRow
                  key={transaction._id}
                  sx={{
                    "&:hover": {
                      bgcolor: isMobile ? "transparent" : "rgba(239, 83, 80, 0.08)",
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
                  <TableCell align="center" sx={{ px: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" sx={{ color: "text.primary", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {formatDate(transaction.date)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ px: { xs: 1, sm: 2 } }}>
                    <Typography variant="body1" fontWeight="700" sx={{ color: "error.main", fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {formatCurrencyBHT(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' }, px: { xs: 1, sm: 2 } }}>
                    <Chip
                      label={formatCurrencyBHT(transaction.transactionCharge)}
                      size="small"
                      sx={{
                        bgcolor: "rgba(239, 83, 80, 0.15)",
                        color: "error.main",
                        fontWeight: 600,
                        border: "1px solid rgba(239, 83, 80, 0.3)",
                        fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ px: { xs: 1, sm: 2 } }}>
                    <Typography variant="body1" fontWeight="bold" sx={{ color: "primary.main", fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {formatCurrencyBHT(transaction.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ px: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" fontWeight="700" sx={{ color: "success.main", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                      {formatCurrencyNPR(convertBhtToNpr(transaction.totalAmount))}
                    </Typography>
                  </TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' }, px: { xs: 1, sm: 2 } }}>
                  <Typography variant="body2" fontWeight="600" sx={{ color: "#f48fb1", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {new Date(transaction.date).getFullYear()}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ px: { xs: 0.5, sm: 2 } }}>
                  <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, justifyContent: "center" }}>
                    <IconButton
                      size="small"
                      sx={{
                        color: "primary.main",
                        bgcolor: "rgba(144, 202, 249, 0.1)",
                        border: "1px solid rgba(144, 202, 249, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(144, 202, 249, 0.2)",
                          transform: isMobile ? "none" : "scale(1.1)",
                        },
                        transition: "all 0.2s ease",
                        p: { xs: 0.5, sm: 1 },
                      }}
                      onClick={() => handleOpenEditDialog(transaction)}
                    >
                      <EditIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        color: "error.main",
                        bgcolor: "rgba(239, 83, 80, 0.1)",
                        border: "1px solid rgba(239, 83, 80, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(239, 83, 80, 0.2)",
                          transform: isMobile ? "none" : "scale(1.1)",
                        },
                        transition: "all 0.2s ease",
                        p: { xs: 0.5, sm: 1 },
                      }}
                      onClick={() => handleOpenDeleteDialog(transaction)}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
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

export default CoinInvestmentPage;