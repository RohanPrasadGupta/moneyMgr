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
import ShowChartIcon from "@mui/icons-material/ShowChart";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_STOCK_CAPITAL;

const StockInvestmentPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
  });
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
      setFormData({ date: "", amount: "" });
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
      setFormData({ date: "", amount: "" });
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
    setFormData({ date: "", amount: "" });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (investment) => {
    setSelectedInvestment(investment);
    setFormData({
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
    if (formData.date && formData.amount) {
      addInvestmentMutation.mutate({
        date: formData.date,
        amount: parseFloat(formData.amount),
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
  
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#ff9966" }} />
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            bgcolor: "background.paper",
            border: "1px solid #23272f",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
            Year: {payload[0].payload.year}
          </Typography>
          <Typography variant="body2" sx={{ color: "#ff9966", fontWeight: 600 }}>
            Investment: {formatCurrency(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const totalInvestment = apiResponse?.totalAmount || stockInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const averageInvestment = stockInvestments.length > 0 ? totalInvestment / stockInvestments.length : 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ width: "100%" }}>

      {/* Add Investment Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid #23272f",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "background.default",
            borderBottom: "1px solid #23272f",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Add New Investment
          </Typography>
          <IconButton onClick={() => setOpenAddDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box component="form" id="add-form" onSubmit={handleAddSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#23272f",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff9966",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff9966",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "text.secondary",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#fff",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount (NPR)"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#23272f",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff9966",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff9966",
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #23272f" }}>
          <Button
            onClick={() => setOpenAddDialog(false)}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.2,
              boxShadow: "0 4px 12px rgba(117, 117, 117, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)",
                boxShadow: "0 6px 16px rgba(117, 117, 117, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-form"
            variant="contained"
            disabled={addInvestmentMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.2,
              boxShadow: "0 4px 12px rgba(102, 187, 106, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                boxShadow: "0 6px 16px rgba(102, 187, 106, 0.4)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #555 0%, #333 100%)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {addInvestmentMutation.isPending ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Add Investment"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Investment Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid #23272f",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "background.default",
            borderBottom: "1px solid #23272f",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Edit Investment
          </Typography>
          <IconButton onClick={() => setOpenEditDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box component="form" id="edit-form" onSubmit={handleEditSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#23272f",
                      },
                      "&:hover fieldset": {
                        borderColor: "#90caf9",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#90caf9",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "text.secondary",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#fff",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount (NPR)"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#23272f",
                      },
                      "&:hover fieldset": {
                        borderColor: "#90caf9",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#90caf9",
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #23272f" }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.2,
              boxShadow: "0 4px 12px rgba(117, 117, 117, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)",
                boxShadow: "0 6px 16px rgba(117, 117, 117, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-form"
            variant="contained"
            disabled={updateInvestmentMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #90caf9 0%, #42a5f5 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.2,
              boxShadow: "0 4px 12px rgba(144, 202, 249, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #42a5f5 0%, #90caf9 100%)",
                boxShadow: "0 6px 16px rgba(144, 202, 249, 0.4)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #555 0%, #333 100%)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {updateInvestmentMutation.isPending ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Update Investment"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid #23272f",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "background.default",
            borderBottom: "1px solid #23272f",
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#ef5350" }}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this investment?
          </Typography>
          {selectedInvestment && (
            <Paper
              sx={{
                p: 2,
                bgcolor: "background.default",
                border: "1px solid #23272f",
                borderRadius: 2,
              }}
            >
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
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.2,
              boxShadow: "0 4px 12px rgba(117, 117, 117, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)",
                boxShadow: "0 6px 16px rgba(117, 117, 117, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleteInvestmentMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #ef5350 0%, #f44336 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.2,
              boxShadow: "0 4px 12px rgba(239, 83, 80, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #f44336 0%, #ef5350 100%)",
                boxShadow: "0 6px 16px rgba(239, 83, 80, 0.4)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #555 0%, #333 100%)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {deleteInvestmentMutation.isPending ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Statistics Cards with Add Investment Button */}
      <Grid container spacing={3} sx={{ mb: 3, alignItems: "center" }}>
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid #23272f",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              TOTAL INVESTMENTS
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#ff9966", mt: 1 }}>
              {formatCurrency(totalInvestment)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid #23272f",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              TOTAL ENTRIES
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#f48fb1", mt: 1 }}>
              {stockInvestments.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.5,
              boxShadow: "0 4px 12px rgba(255, 153, 102, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(255, 153, 102, 0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Add Investment
          </Button>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      {stockInvestments.length > 0 ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid #23272f",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
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
              <CartesianGrid strokeDasharray="3 3" stroke="#23272f" />
              <XAxis
                dataKey="year"
                stroke="#b0b8c1"
                style={{ fontSize: "14px", fontWeight: 600 }}
              />
              <YAxis
                stroke="#b0b8c1"
                style={{ fontSize: "14px" }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 153, 102, 0.1)" }} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: "#f5f6fa", fontSize: "14px", fontWeight: 600 }}>
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
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff9966" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ff5e62" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 6,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid #23272f",
            mb: 3,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
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
      {stockInvestments.length > 0 && (
        <Paper
          sx={{
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid #23272f",
            overflow: "hidden",
          }}
        >
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #23272f",
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
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff9966",
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff9966",
                  }}
                >
                  Amount
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff9966",
                  }}
                >
                  Year
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff9966",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...stockInvestments].reverse().map((transaction, index) => (
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
                    <Typography variant="body1" fontWeight="700" sx={{ color: "#ff9966" }}>
                      {formatCurrency(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="600" sx={{ color: "#90caf9" }}>
                      {new Date(transaction.date).getFullYear()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <IconButton
                        size="small"
                        sx={{
                          color: "#90caf9",
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
                          color: "#ef5350",
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
