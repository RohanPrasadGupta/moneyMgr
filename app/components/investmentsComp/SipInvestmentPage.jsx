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
  Chip,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  InputAdornment,
  Divider,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SavingsIcon from "@mui/icons-material/Savings";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
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
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  chartPalette,
  colors,
  investmentChartColors,
  dialogPaperSx,
  dialogTitleSx,
  dialogActionsSx,
  textFieldOutlinedSx,
  cancelButtonSx,
  successButtonSx,
  dangerButtonSx,
  gradients,
  insetPanelSx,
} from "../../themeStyles";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_STOCK_CAPITAL;

const SIP_FUND_OPTIONS = ["Nabil", "NIC"];

const SIP_FUND_META = {
  Nabil: {
    accent: colors.successDark,
    subtitle: "Nabil Investment SIP",
    badge: "NABIL",
  },
  NIC: {
    accent: colors.error,
    subtitle: "NIC Asia Cap SIP",
    badge: "NIC",
  },
};

const normalizeSipFundName = (name) => {
  const lower = String(name || "").toLowerCase();
  if (lower.includes("nic")) return "NIC";
  if (lower.includes("nabil")) return "Nabil";
  return SIP_FUND_OPTIONS[0];
};

const sipFieldSx = {
  ...textFieldOutlinedSx,
  "& .MuiOutlinedInput-root": {
    ...textFieldOutlinedSx["& .MuiOutlinedInput-root"],
    "&:hover fieldset": { borderColor: "success.dark" },
    "&.Mui-focused fieldset": { borderColor: "success.dark" },
  },
};

const SipFundSelector = ({ value, onChange }) => (
  <Box>
    <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}>
      SIP fund
    </Typography>
    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
      Choose which fund this contribution belongs to
    </Typography>
    <RadioGroup
      row
      name="name"
      value={value}
      onChange={onChange}
      sx={{ gap: 2, flexWrap: { xs: "wrap", sm: "nowrap" } }}
    >
      {SIP_FUND_OPTIONS.map((fund) => {
        const selected = value === fund;
        const meta = SIP_FUND_META[fund];
        return (
          <Paper
            key={fund}
            elevation={0}
            onClick={() => onChange({ target: { name: "name", value: fund } })}
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: 0 },
              p: 2,
              border: selected ? "2px solid" : "1px solid",
              borderColor: selected ? meta.accent : "divider",
              borderRadius: 2.5,
              bgcolor: selected ? alpha(meta.accent, 0.12) : "background.default",
              cursor: "pointer",
              transition: "all 0.22s ease",
              boxShadow: selected ? `0 8px 20px ${alpha(meta.accent, 0.22)}` : "none",
              "&:hover": {
                borderColor: meta.accent,
                transform: "translateY(-2px)",
                boxShadow: `0 6px 16px ${alpha(meta.accent, 0.18)}`,
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: selected
                    ? `linear-gradient(135deg, ${meta.accent} 0%, ${alpha(meta.accent, 0.75)} 100%)`
                    : alpha(meta.accent, 0.15),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{ color: selected ? "common.white" : meta.accent, fontSize: "0.65rem" }}
                >
                  {meta.badge}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: "left" }}>
                <FormControlLabel
                  value={fund}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: meta.accent,
                        p: 0.5,
                        "&.Mui-checked": { color: meta.accent },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700} sx={{ color: selected ? meta.accent : "text.primary", lineHeight: 1.2 }}>
                        {fund}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {meta.subtitle}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: "flex-start" }}
                />
              </Box>
            </Stack>
          </Paper>
        );
      })}
    </RadioGroup>
  </Box>
);

const SipDialogHeader = ({ title, subtitle, icon: Icon = SavingsIcon, onClose }) => (
  <DialogTitle sx={{ ...dialogTitleSx, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 } }}>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: gradients.income,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 16px ${alpha(colors.success, 0.35)}`,
          }}
        >
          <Icon sx={{ color: "common.white", fontSize: 26 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: "text.primary" }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
            {subtitle}
          </Typography>
        </Box>
      </Stack>
      <IconButton
        size="small"
        onClick={onClose}
        aria-label="Close"
        sx={{
          color: "text.secondary",
          border: "1px solid",
          borderColor: "divider",
          "&:hover": { bgcolor: alpha(colors.text.secondary, 0.08) },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Stack>
  </DialogTitle>
);

const SipFormFields = ({ formId, formData, onChange, onSubmit }) => (
  <Box component="form" id={formId} onSubmit={onSubmit}>
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
        <SipFundSelector value={formData.name} onChange={onChange} />
      </Paper>

      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}>
          Details
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Date and contribution amount in NPR
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Investment date"
              name="date"
              type="date"
              value={formData.date}
              onChange={onChange}
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon sx={{ fontSize: 20, color: "success.dark" }} />
                  </InputAdornment>
                ),
              }}
              sx={sipFieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              inputProps={{ min: 0, step: "any" }}
              value={formData.amount}
              onChange={onChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaymentsIcon sx={{ fontSize: 20, color: "success.dark" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary" }}>
                      NPR
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={sipFieldSx}
            />
          </Grid>
        </Grid>
      </Box>
    </Stack>
  </Box>
);

const SipInvestmentFormDialog = ({
  open,
  onClose,
  title,
  subtitle,
  formId,
  formData,
  onChange,
  onSubmit,
  submitLabel,
  isPending,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
    <SipDialogHeader title={title} subtitle={subtitle} onClose={onClose} />
    <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
      <SipFormFields formId={formId} formData={formData} onChange={onChange} onSubmit={onSubmit} />
    </DialogContent>
    <DialogActions sx={{ ...dialogActionsSx, justifyContent: "flex-end", gap: 1.5 }}>
      <Button onClick={onClose} sx={{ ...cancelButtonSx, width: { xs: "100%", sm: "auto" } }}>
        Cancel
      </Button>
      <Button
        type="submit"
        form={formId}
        disabled={isPending}
        sx={{ ...successButtonSx, width: { xs: "100%", sm: "auto" }, minWidth: 140 }}
      >
        {isPending ? <CircularProgress size={22} sx={{ color: "common.white" }} /> : submitLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

function calcSip(monthlyAmount, annualRate, years) {
  const P = Number(monthlyAmount) || 0;
  const r = (Number(annualRate) || 12) / 100;
  const n = 12;
  const t = Number(years) || 10;
  const months = n * t;
  const monthlyRate = r / n;
  const maturity =
    monthlyRate === 0
      ? P * months
      : P * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  const totalInvested = P * months;
  const estimatedReturns = maturity - totalInvested;

  const yearlyBreakdown = [];
  for (let y = 1; y <= t; y++) {
    const m = n * y;
    const yMaturity =
      monthlyRate === 0
        ? P * m
        : P * (((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate));
    const yInvested = P * m;
    yearlyBreakdown.push({
      year: y,
      invested: Math.round(yInvested),
      returns: Math.round(yMaturity - yInvested),
      total: Math.round(yMaturity),
    });
  }
  return { totalInvested, estimatedReturns, maturityValue: maturity, yearlyBreakdown };
}

const SipCalculatorSection = () => {
  const theme = useTheme();
  const [sipAmount, setSipAmount] = useState("5000");
  const [annualRate, setAnnualRate] = useState("12");
  const [years, setYears] = useState("10");

  const { totalInvested, estimatedReturns, maturityValue, yearlyBreakdown } = calcSip(
    sipAmount,
    annualRate,
    years
  );

  const fmt = (n) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const statCards = [
    { label: "Total Amount Invested", value: fmt(totalInvested), color: colors.primary },
    { label: "Profit / Estimated Returns", value: fmt(estimatedReturns), color: colors.success },
    { label: "Final Maturity Value", value: fmt(maturityValue), color: colors.warning },
  ];

  const tooltipBg = theme.palette.background.paper;
  const tooltipBorder = theme.palette.divider;
  const tooltipText = theme.palette.text.primary;
  const axisColor = theme.palette.text.secondary;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: gradients.income,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SavingsIcon sx={{ color: "common.white", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            SIP Returns Calculator
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Enter your monthly contribution, expected return rate, and how many years you plan to invest
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Monthly SIP Amount"
            placeholder="e.g. 5000"
            helperText="How much you invest every month (NPR)"
            type="number"
            value={sipAmount}
            onChange={(e) => setSipAmount(e.target.value)}
            fullWidth
            size="small"
            inputProps={{ min: 0 }}
            InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>NPR</Typography></InputAdornment> }}
            sx={textFieldOutlinedSx}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Expected Annual Return Rate"
            placeholder="e.g. 12"
            helperText="Average yearly return % your fund is expected to earn"
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            fullWidth
            size="small"
            inputProps={{ min: 0, max: 100 }}
            InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>% / yr</Typography></InputAdornment> }}
            sx={textFieldOutlinedSx}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Investment Duration"
            placeholder="e.g. 10"
            helperText="Total number of years you will keep investing"
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            fullWidth
            size="small"
            inputProps={{ min: 1, max: 50 }}
            InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>yrs</Typography></InputAdornment> }}
            sx={textFieldOutlinedSx}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={4} key={card.label}>
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                bgcolor: alpha(card.color, 0.08),
                border: `1px solid ${alpha(card.color, 0.3)}`,
                textAlign: "center",
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                {card.label}
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: card.color, mt: 0.5 }}>
                {card.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {yearlyBreakdown.length > 0 && (
        <Box>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: "text.secondary" }}>
            Yearly Breakdown — Invested vs Returns
          </Typography>
          <Box sx={{ height: { xs: 220, sm: 280 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(axisColor, 0.15)} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: "Year", position: "insideBottom", offset: -2, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 8,
                    color: tooltipText,
                  }}
                  formatter={(value, name) => [fmt(value), name === "invested" ? "Invested" : "Returns"]}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Legend formatter={(v) => (v === "invested" ? "Invested" : "Returns")} />
                <Bar dataKey="invested" fill={colors.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="returns" fill={colors.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

const SipInvestmentPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "Nabil", date: "", amount: "" });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  // Fetch all SIP capital investments
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ["sipCapitalInvestments"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/sip-capital`);
      if (!response.ok) throw new Error("Failed to fetch SIP investments");
      return response.json();
    },
  });

  const sipInvestments = apiResponse?.data || [];

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (newInvestment) => {
      const response = await fetch(`${API_BASE_URL}/sip-capital`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvestment),
      });
      if (!response.ok) throw new Error("Failed to add SIP investment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sipCapitalInvestments"] });
      setFormData({ name: "Nabil", date: "", amount: "" });
      setOpenAddDialog(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${API_BASE_URL}/sip-capital/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update SIP investment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sipCapitalInvestments"] });
      setFormData({ name: "Nabil", date: "", amount: "" });
      setOpenEditDialog(false);
      setSelectedInvestment(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE_URL}/sip-capital/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete SIP investment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sipCapitalInvestments"] });
      setOpenDeleteDialog(false);
      setSelectedInvestment(null);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddDialog = () => {
    setFormData({ name: "Nabil", date: "", amount: "" });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (investment) => {
    setSelectedInvestment(investment);
    setFormData({
      name: normalizeSipFundName(investment.name),
      date: investment.date.split("T")[0],
      amount: investment.amount.toString(),
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (investment) => {
    setSelectedInvestment(investment);
    setOpenDeleteDialog(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.date && formData.amount) {
      addMutation.mutate({
        name: formData.name,
        date: formData.date,
        amount: parseFloat(formData.amount),
      });
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.date && formData.amount && selectedInvestment) {
      updateMutation.mutate({
        id: selectedInvestment._id,
        data: {
          name: formData.name,
          date: formData.date,
          amount: parseFloat(formData.amount),
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedInvestment) deleteMutation.mutate(selectedInvestment._id);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatCompactCurrency = (amount) => {
    const num = Number(amount);
    if (!Number.isFinite(num)) return "-";
    const sign = num < 0 ? "-" : "";
    const abs = Math.abs(num);

    if (abs >= 1e6) return `${sign}NPR ${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${sign}NPR ${(abs / 1e3).toFixed(1)}K`;
    return `${sign}NPR ${abs.toFixed(0)}`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Group by year and SIP fund name for chart
  const getYearlyByFundInvestments = () => {
    if (!sipInvestments.length) return [];
    const yearlyData = {};
    sipInvestments.forEach((inv) => {
      const year = new Date(inv.date).getFullYear();
      if (!yearlyData[year]) {
        yearlyData[year] = { year, totalInvestment: 0 };
      }
      yearlyData[year][inv.name] = (yearlyData[year][inv.name] || 0) + inv.amount;
      yearlyData[year].totalInvestment += inv.amount;
    });
    return Object.keys(yearlyData)
      .sort()
      .map((year) => yearlyData[year]);
  };

  const chartData = getYearlyByFundInvestments();

  // Group by name for pie chart
  const getNameWiseData = () => {
    if (!sipInvestments.length) return [];
    const nameData = {};
    sipInvestments.forEach((inv) => {
      nameData[inv.name] = (nameData[inv.name] || 0) + inv.amount;
    });
    return Object.entries(nameData)
      .map(([name, value]) => ({ name, y: value }))
      .sort((a, b) => b.y - a.y);
  };

  const pieData = getNameWiseData();
  const fundNames = pieData.map((entry) => entry.name);
  const totalInvestment =
    apiResponse?.totalAmount ||
    sipInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  const FALLBACK_COLORS = chartPalette;

  const getFundBrand = (fundName) => {
    const normalized = String(fundName || "").toLowerCase();

    // Use logo-inspired colors for clearer mapping.
    if (normalized.includes("nabil")) {
      return {
        primaryColor: "#00a651",
        gradient: "linear-gradient(135deg, #00a651 0%, #e53935 100%)",
      };
    }

    if (normalized.includes("nic")) {
      return {
        primaryColor: "#e53935",
        gradient: "linear-gradient(135deg, #e53935 0%, #b71c1c 100%)",
      };
    }

    // Fallback: deterministic color per fund name.
    const idx = fundNames.indexOf(fundName);
    const color = FALLBACK_COLORS[idx % FALLBACK_COLORS.length] || FALLBACK_COLORS[0];
    return {
      primaryColor: color,
      gradient: color,
    };
  };

  const pieColors = pieData.map((entry) => getFundBrand(entry.name).primaryColor);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const row = payload?.[0]?.payload;
      const year = row?.year;
      const totalForYear = row?.totalInvestment ?? 0;

      return (
        <Paper sx={{ p: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
            Year: {year}
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, mt: 0.5 }}>
            Year total: {formatCurrency(totalForYear)}
          </Typography>

          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
            {fundNames.map((fund) => {
              const value = row?.[fund] ?? 0;
              if (!value) return null;
              const { primaryColor } = getFundBrand(fund);
              return (
                <Box key={fund} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: primaryColor }} />
                  <Typography variant="body2" sx={{ color: primaryColor, fontWeight: 800 }}>
                    {fund}: {formatCurrency(value)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "success.main" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading SIP investments: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>

      <SipInvestmentFormDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        title="Add SIP Investment"
        subtitle="Record a new contribution to your SIP fund"
        formId="sip-add-form"
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleAddSubmit}
        submitLabel="Add Investment"
        isPending={addMutation.isPending}
      />

      <SipInvestmentFormDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title="Edit SIP Investment"
        subtitle="Update fund, date, or amount for this entry"
        formId="sip-edit-form"
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleEditSubmit}
        submitLabel="Save Changes"
        isPending={updateMutation.isPending}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
      >
        <SipDialogHeader
          title="Delete SIP Investment"
          subtitle="This action cannot be undone"
          icon={DeleteIcon}
          onClose={() => setOpenDeleteDialog(false)}
        />
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 2.5 }}>
            Are you sure you want to remove this SIP record?
          </Typography>
          {selectedInvestment && (
            <Paper
              elevation={0}
              sx={{
                ...insetPanelSx,
                p: 2,
                borderColor: alpha(colors.error, 0.35),
                bgcolor: alpha(colors.error, 0.06),
              }}
            >
              <Stack spacing={1.5} divider={<Divider sx={{ borderColor: "divider" }} />}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Fund
                  </Typography>
                  <Chip
                    label={normalizeSipFundName(selectedInvestment.name)}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: alpha(SIP_FUND_META[normalizeSipFundName(selectedInvestment.name)]?.accent || colors.error, 0.15),
                      color: SIP_FUND_META[normalizeSipFundName(selectedInvestment.name)]?.accent || colors.error,
                      border: "1px solid",
                      borderColor: alpha(SIP_FUND_META[normalizeSipFundName(selectedInvestment.name)]?.accent || colors.error, 0.35),
                    }}
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Date
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatDate(selectedInvestment.date)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Amount
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: "success.main" }}>
                    {formatCurrency(selectedInvestment.amount)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ ...dialogActionsSx, justifyContent: "flex-end", gap: 1.5 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ ...cancelButtonSx, width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
            sx={{ ...dangerButtonSx, width: { xs: "100%", sm: "auto" }, minWidth: 120 }}
          >
            {deleteMutation.isPending ? (
              <CircularProgress size={22} sx={{ color: "common.white" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats + Add Button */}
      <Grid container spacing={3} sx={{ mb: 3, alignItems: "center" }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>TOTAL SIP INVESTED</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "success.main", mt: 1 }}>
              {formatCurrency(totalInvestment)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>TOTAL ENTRIES</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#f48fb1", mt: 1 }}>
              {sipInvestments.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              background: "linear-gradient(135deg, #66bb6a, #43a047)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.5,
              boxShadow: "0 4px 12px rgba(102, 187, 106, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #43a047, #66bb6a)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(102, 187, 106, 0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Add SIP Investment
          </Button>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      {sipInvestments.length > 0 ? (
        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box sx={{ background: "linear-gradient(135deg, #66bb6a, #43a047)", borderRadius: 2, p: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SavingsIcon sx={{ fontSize: 32, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>SIP by Year & Fund</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Contributions split by SIP fund name</Typography>
            </Box>
          </Box>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={investmentChartColors.grid} />
              <XAxis
                dataKey="year"
                stroke={investmentChartColors.axis}
                tick={{ fill: investmentChartColors.axis, fontSize: 13, fontWeight: 700 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke={investmentChartColors.axis}
                tick={{ fill: investmentChartColors.axis, fontSize: 13 }}
                tickFormatter={(v) => formatCompactCurrency(v)}
                label={{
                  value: "Amount (NPR)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: investmentChartColors.axis, fontSize: 12, fontWeight: 800 },
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(102, 187, 106, 0.12)" }} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: investmentChartColors.legend, fontSize: 14, fontWeight: 700 }}>{value}</span>
                )}
              />
              {fundNames.map((fund, idx) => {
                const { primaryColor } = getFundBrand(fund);
                return (
                  <Bar
                    key={fund}
                    dataKey={fund}
                    name={fund}
                    stackId="sipFundsByYear"
                    fill={primaryColor}
                    radius={idx === fundNames.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      ) : (
        <Paper sx={{ p: 6, borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", mb: 3, textAlign: "center" }}>
          <Box sx={{ display: "inline-flex", background: "linear-gradient(135deg, #66bb6a, #43a047)", borderRadius: 3, p: 3, mb: 3 }}>
            <SavingsIcon sx={{ fontSize: 64, color: "#fff", opacity: 0.7 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary", mb: 1 }}>No SIP Data</Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Start by adding your first SIP investment using the button above.
          </Typography>
        </Paper>
      )}

      {/* Transaction Table */}
      {sipInvestments.length > 0 && (
        <>
        {/* Pie Chart — Investment by Name */}
        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box sx={{ background: "linear-gradient(135deg, #66bb6a, #43a047)", borderRadius: 2, p: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SavingsIcon sx={{ fontSize: 32, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>SIP Distribution by Fund</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Total invested per SIP fund across all transactions</Typography>
            </Box>
          </Box>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  chart: {
                    type: "pie",
                    height: 340,
                    backgroundColor: "transparent",
                    marginTop: 0,
                    marginBottom: 0,
                    spacingTop: 0,
                    spacingBottom: 0,
                  },
                  title: { text: "" },
                  credits: { enabled: false },
                  colors: pieColors,
                  plotOptions: {
                    pie: {
                      innerSize: "50%",
                      dataLabels: {
                        enabled: true,
                        format: "{point.name}: NPR {point.y:,.0f}",
                        style: {
                          color: "white",
                          textOutline: "none",
                          fontSize: "12px",
                        },
                        backgroundColor: "none",
                        borderWidth: 0,
                        shadow: false,
                        distance: 20,
                        connectorWidth: 1,
                        connectorColor: colors.text.secondary,
                      },
                    },
                  },
                  tooltip: {
                    formatter: function () {
                      const percent = ((this.y / totalInvestment) * 100).toFixed(1);
                      return `<b>${this.point.name}</b><br/>NPR ${Highcharts.numberFormat(this.y, 0, ".", ",")}<br/>${percent}% of total`;
                    },
                  },
                  series: [
                    {
                      name: "SIP Investment",
                      data: pieData,
                    },
                  ],
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {pieData.map((entry, index) => {
                  const { primaryColor, gradient } = getFundBrand(entry.name);
                  const percent = ((entry.y / totalInvestment) * 100).toFixed(1);
                  return (
                    <Box key={entry.name} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: gradient,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: primaryColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {entry.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {formatCurrency(entry.y)} &nbsp;·&nbsp; {percent}%
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Transaction Table */}
        <Paper sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid", borderBottomColor: "divider", bgcolor: "background.default" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>SIP Transaction History</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Detailed list of all SIP investments</Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {["Name", "Date", "Amount", "Year", "Actions"].map((col) => (
                    <TableCell key={col} align="center" sx={{ fontWeight: "bold", fontSize: "0.85rem", bgcolor: "background.paper", color: "text.primary", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "2px solid", borderBottomColor: "success.main" }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sipInvestments.map((investment) => (
                  <TableRow
                    key={investment._id}
                    sx={{
                      "&:hover": { bgcolor: "rgba(102, 187, 106, 0.08)" },
                      transition: "all 0.2s ease",
                      "&:nth-of-type(odd)": { bgcolor: "background.paper" },
                      "&:nth-of-type(even)": { bgcolor: "background.default" },
                    }}
                  >
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="600" sx={{ color: getFundBrand(investment.name).primaryColor }}>
                        {investment.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: "text.primary" }}>
                        {formatDate(investment.date)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="700" sx={{ color: "#a5d6a7" }}>
                        {formatCurrency(investment.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="600" sx={{ color: "primary.main" }}>
                        {new Date(investment.date).getFullYear()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          sx={{ color: "primary.main", bgcolor: "rgba(144, 202, 249, 0.1)", border: "1px solid rgba(144, 202, 249, 0.3)", "&:hover": { bgcolor: "rgba(144, 202, 249, 0.2)", transform: "scale(1.1)" }, transition: "all 0.2s ease" }}
                          onClick={() => handleOpenEditDialog(investment)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "error.main", bgcolor: "rgba(239, 83, 80, 0.1)", border: "1px solid rgba(239, 83, 80, 0.3)", "&:hover": { bgcolor: "rgba(239, 83, 80, 0.2)", transform: "scale(1.1)" }, transition: "all 0.2s ease" }}
                          onClick={() => handleOpenDeleteDialog(investment)}
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
        </>
      )}

      {/* SIP Calculator */}
      <SipCalculatorSection />
    </Box>
  );
};

export default SipInvestmentPage;
