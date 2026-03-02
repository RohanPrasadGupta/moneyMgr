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
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SavingsIcon from "@mui/icons-material/Savings";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_STOCK_CAPITAL;

const SipInvestmentPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "", date: "", amount: "" });
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
      setFormData({ name: "", date: "", amount: "" });
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
      setFormData({ name: "", date: "", amount: "" });
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
    setFormData({ name: "", date: "", amount: "" });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (investment) => {
    setSelectedInvestment(investment);
    setFormData({
      name: investment.name,
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Group by year for chart
  const getYearlyInvestments = () => {
    if (!sipInvestments.length) return [];
    const yearlyData = {};
    sipInvestments.forEach((inv) => {
      const year = new Date(inv.date).getFullYear();
      yearlyData[year] = (yearlyData[year] || 0) + inv.amount;
    });
    return Object.keys(yearlyData)
      .sort()
      .map((year) => ({ year, totalInvestment: yearlyData[year] }));
  };

  const chartData = getYearlyInvestments();

  // Group by name for pie chart
  const getNameWiseData = () => {
    if (!sipInvestments.length) return [];
    const nameData = {};
    sipInvestments.forEach((inv) => {
      nameData[inv.name] = (nameData[inv.name] || 0) + inv.amount;
    });
    return Object.entries(nameData).map(([name, value]) => ({ name, y: value }));
  };

  const pieData = getNameWiseData();
  const totalInvestment =
    apiResponse?.totalAmount ||
    sipInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  const PIE_COLORS = [
    "#66bb6a", "#388e3c", "#a5d6a7", "#1b5e20", "#81c784",
    "#2e7d32", "#c8e6c9", "#43a047", "#00e676", "#1de9b6",
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, bgcolor: "background.paper", border: "1px solid #23272f", borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
            Year: {payload[0].payload.year}
          </Typography>
          <Typography variant="body2" sx={{ color: "#66bb6a", fontWeight: 600 }}>
            Investment: {formatCurrency(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const fieldSx = (color) => ({
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#23272f" },
      "&:hover fieldset": { borderColor: color },
      "&.Mui-focused fieldset": { borderColor: color },
    },
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiSvgIcon-root": { color: "#fff" },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#66bb6a" }} />
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

      {/* Add Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: "background.paper", border: "1px solid #23272f" } }}
      >
        <DialogTitle sx={{ bgcolor: "background.default", borderBottom: "1px solid #23272f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="bold">Add SIP Investment</Typography>
          <IconButton onClick={() => setOpenAddDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box component="form" id="sip-add-form" onSubmit={handleAddSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleInputChange} required sx={fieldSx("#66bb6a")} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Date" name="date" type="date" value={formData.date} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} sx={fieldSx("#66bb6a")} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Amount (NPR)" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required sx={fieldSx("#66bb6a")} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #23272f" }}>
          <Button onClick={() => setOpenAddDialog(false)} variant="contained" sx={{ background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)", color: "#fff", fontWeight: 600, borderRadius: "12px", px: 3, py: 1.2, "&:hover": { background: "linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)", transform: "translateY(-2px)" }, transition: "all 0.3s ease" }}>
            Cancel
          </Button>
          <Button type="submit" form="sip-add-form" variant="contained" disabled={addMutation.isPending}
            sx={{ background: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)", color: "#fff", fontWeight: 600, borderRadius: "12px", px: 3, py: 1.2, boxShadow: "0 4px 12px rgba(102, 187, 106, 0.3)", "&:hover": { background: "linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)", transform: "translateY(-2px)" }, "&:disabled": { background: "linear-gradient(135deg, #555 0%, #333 100%)" }, transition: "all 0.3s ease" }}>
            {addMutation.isPending ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Add Investment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: "background.paper", border: "1px solid #23272f" } }}
      >
        <DialogTitle sx={{ bgcolor: "background.default", borderBottom: "1px solid #23272f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="bold">Edit SIP Investment</Typography>
          <IconButton onClick={() => setOpenEditDialog(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box component="form" id="sip-edit-form" onSubmit={handleEditSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleInputChange} required sx={fieldSx("#66bb6a")} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Date" name="date" type="date" value={formData.date} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} sx={fieldSx("#66bb6a")} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Amount (NPR)" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required sx={fieldSx("#66bb6a")} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #23272f" }}>
          <Button onClick={() => setOpenEditDialog(false)} variant="contained" sx={{ background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)", color: "#fff", fontWeight: 600, borderRadius: "12px", px: 3, py: 1.2, "&:hover": { background: "linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)", transform: "translateY(-2px)" }, transition: "all 0.3s ease" }}>
            Cancel
          </Button>
          <Button type="submit" form="sip-edit-form" variant="contained" disabled={updateMutation.isPending}
            sx={{ background: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)", color: "#fff", fontWeight: 600, borderRadius: "12px", px: 3, py: 1.2, boxShadow: "0 4px 12px rgba(102, 187, 106, 0.3)", "&:hover": { background: "linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)", transform: "translateY(-2px)" }, "&:disabled": { background: "linear-gradient(135deg, #555 0%, #333 100%)" }, transition: "all 0.3s ease" }}>
            {updateMutation.isPending ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Update Investment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: "background.paper", border: "1px solid #23272f" } }}
      >
        <DialogTitle sx={{ bgcolor: "background.default", borderBottom: "1px solid #23272f" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#ef5350" }}>Confirm Delete</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>Are you sure you want to delete this SIP investment?</Typography>
          {selectedInvestment && (
            <Paper sx={{ p: 2, bgcolor: "background.default", border: "1px solid #23272f", borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                Name: <strong>{selectedInvestment.name}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                Date: <strong>{formatDate(selectedInvestment.date)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Amount: <strong>{formatCurrency(selectedInvestment.amount)}</strong>
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #23272f" }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="contained" sx={{ background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)", color: "#fff", fontWeight: 600, borderRadius: "12px", px: 3, py: 1.2, "&:hover": { background: "linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)", transform: "translateY(-2px)" }, transition: "all 0.3s ease" }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" disabled={deleteMutation.isPending}
            sx={{ background: "linear-gradient(135deg, #ef5350 0%, #f44336 100%)", color: "#fff", fontWeight: 600, borderRadius: "12px", px: 3, py: 1.2, boxShadow: "0 4px 12px rgba(239, 83, 80, 0.3)", "&:hover": { background: "linear-gradient(135deg, #f44336 0%, #ef5350 100%)", transform: "translateY(-2px)" }, "&:disabled": { background: "linear-gradient(135deg, #555 0%, #333 100%)" }, transition: "all 0.3s ease" }}>
            {deleteMutation.isPending ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats + Add Button */}
      <Grid container spacing={3} sx={{ mb: 3, alignItems: "center" }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "background.paper", border: "1px solid #23272f", textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>TOTAL SIP INVESTED</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#66bb6a", mt: 1 }}>
              {formatCurrency(totalInvestment)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "background.paper", border: "1px solid #23272f", textAlign: "center" }}>
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
              background: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.5,
              boxShadow: "0 4px 12px rgba(102, 187, 106, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)",
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
        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper", border: "1px solid #23272f", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box sx={{ background: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)", borderRadius: 2, p: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SavingsIcon sx={{ fontSize: 32, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>Yearly SIP Overview</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>Total SIP amount invested per year</Typography>
            </Box>
          </Box>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#23272f" />
              <XAxis dataKey="year" stroke="#b0b8c1" style={{ fontSize: "14px", fontWeight: 600 }} />
              <YAxis stroke="#b0b8c1" style={{ fontSize: "14px" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(102, 187, 106, 0.1)" }} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" formatter={(value) => <span style={{ color: "#f5f6fa", fontSize: "14px", fontWeight: 600 }}>{value}</span>} />
              <Bar dataKey="totalInvestment" fill="url(#sipGradient)" name="SIP Investment" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="sipGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#66bb6a" stopOpacity={1} />
                  <stop offset="100%" stopColor="#388e3c" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      ) : (
        <Paper sx={{ p: 6, borderRadius: 3, bgcolor: "background.paper", border: "1px solid #23272f", mb: 3, textAlign: "center" }}>
          <Box sx={{ display: "inline-flex", background: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)", borderRadius: 3, p: 3, mb: 3 }}>
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
        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper", border: "1px solid #23272f", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box sx={{ background: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)", borderRadius: 2, p: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SavingsIcon sx={{ fontSize: 32, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>SIP Distribution by Name</Typography>
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
                  colors: PIE_COLORS,
                  plotOptions: {
                    pie: {
                      innerSize: "50%",
                      dataLabels: {
                        enabled: true,
                        format: "{point.name}: Rs {point.y:,.0f}",
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
                        connectorColor: "#888",
                      },
                    },
                  },
                  tooltip: {
                    formatter: function () {
                      const percent = ((this.y / totalInvestment) * 100).toFixed(1);
                      return `<b>${this.point.name}</b><br/>Rs ${Highcharts.numberFormat(this.y, 0, ".", ",")}<br/>${percent}% of total`;
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
                  const color = PIE_COLORS[index % PIE_COLORS.length];
                  const percent = ((entry.y / totalInvestment) * 100).toFixed(1);
                  return (
                    <Box key={entry.name} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: "background.default", border: "1px solid #23272f" }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
        <Paper sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid #23272f", overflow: "hidden" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #23272f", bgcolor: "background.default" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>SIP Transaction History</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Detailed list of all SIP investments</Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {["Name", "Date", "Amount", "Year", "Actions"].map((col) => (
                    <TableCell key={col} align="center" sx={{ fontWeight: "bold", fontSize: "0.85rem", bgcolor: "#1e1e1e", color: "#f5f6fa", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "2px solid #66bb6a" }}>
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
                      <Typography variant="body2" fontWeight="600" sx={{ color: "#66bb6a" }}>
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
                      <Typography variant="body2" fontWeight="600" sx={{ color: "#90caf9" }}>
                        {new Date(investment.date).getFullYear()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          sx={{ color: "#90caf9", bgcolor: "rgba(144, 202, 249, 0.1)", border: "1px solid rgba(144, 202, 249, 0.3)", "&:hover": { bgcolor: "rgba(144, 202, 249, 0.2)", transform: "scale(1.1)" }, transition: "all 0.2s ease" }}
                          onClick={() => handleOpenEditDialog(investment)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: "#ef5350", bgcolor: "rgba(239, 83, 80, 0.1)", border: "1px solid rgba(239, 83, 80, 0.3)", "&:hover": { bgcolor: "rgba(239, 83, 80, 0.2)", transform: "scale(1.1)" }, transition: "all 0.2s ease" }}
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
    </Box>
  );
};

export default SipInvestmentPage;
