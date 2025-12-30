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
} from "@mui/material";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_COIN_CAPITAL;

const CoinInvestmentPage = () => {
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
          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}>
            Year: {payload[0].payload.year}
          </Typography>
          <Typography variant="body2" sx={{ color: "#ff9966", fontWeight: 600 }}>
            Investment: {formatCurrencyBHT(payload[0].payload.amount)}
          </Typography>
          <Typography variant="body2" sx={{ color: "#ef5350", fontWeight: 600 }}>
            Charges: {formatCurrencyBHT(payload[0].payload.transactionCharges)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#90caf9", fontWeight: 700, mt: 0.5, pt: 0.5, borderTop: "1px solid #23272f" }}
          >
            Total (BHT): {formatCurrencyBHT(payload[0].value)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#66bb6a", fontWeight: 700, mt: 0.5 }}
          >
            Total (NPR): {formatCurrencyNPR(payload[0].value * 4.3)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const totalInvestment = apiResponse?.summary?.totalAmount || coinInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCharges = apiResponse?.summary?.totalTransactionCharge || coinInvestments.reduce((sum, inv) => sum + inv.transactionCharge, 0);
  const grandTotal = apiResponse?.summary?.grandTotal || coinInvestments.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const grandTotalInNPR = grandTotal * 4.3; // Convert BHT to NPR

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
  
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 2 }}>
        <CircularProgress size={60} sx={{ color: "#ff5e62" }} />
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
      {/* Add Investment Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx:{
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
            Add New Coin Investment
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
                        borderColor: "#ff5e62",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff5e62",
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
                  label="Amount (BHT)"
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
                        borderColor: "#ff5e62",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff5e62",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Transaction Charge (BHT)"
                  name="transactionCharge"
                  type="number"
                  value={formData.transactionCharge}
                  onChange={handleInputChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#23272f",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff5e62",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff5e62",
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
          sx:{
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
            Edit Coin Investment
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
                  label="Amount (BHT)"
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Transaction Charge (BHT)"
                  name="transactionCharge"
                  type="number"
                  value={formData.transactionCharge}
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
          sx:{
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
            Are you sure you want to delete this coin investment?
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
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                Amount: <strong>{formatCurrencyBHT(selectedInvestment.amount)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total: <strong>{formatCurrencyBHT(selectedInvestment.totalAmount)}</strong>
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

      {/* Statistics Cards with Add Button */}
      <Grid container spacing={3} sx={{ mb: 3, alignItems: "center" }}>
        <Grid item xs={12} md={2}>
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
              TOTAL INVESTMENT (BHT)
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#ff9966", mt: 1 }}>
              {formatCurrencyBHT(totalInvestment)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
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
              TRANSACTION CHARGES
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#ef5350", mt: 1 }}>
              {formatCurrencyBHT(totalCharges)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
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
              GRAND TOTAL (BHT)
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#90caf9", mt: 1 }}>
              {formatCurrencyBHT(grandTotal)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid rgba(102, 187, 106, 0.5)",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(102, 187, 106, 0.2)",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              NPR AMOUNT (×4.3)
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#66bb6a", mt: 1 }}>
              {formatCurrencyNPR(grandTotalInNPR)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1.5,
              boxShadow: "0 4px 12px rgba(255, 94, 98, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(255, 94, 98, 0.4)",
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
              background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CurrencyBitcoinIcon sx={{ fontSize: 32, color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>
              Yearly Coin Investment Overview
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Total amount invested per year in BHT (including transaction charges)
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 94, 98, 0.1)" }} />
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
              fill="url(#coinGradient)"
              name="Total Investment (with charges)"
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="coinGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff5e62" stopOpacity={1} />
                <stop offset="100%" stopColor="#ff9966" stopOpacity={0.8} />
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
              background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
              borderRadius: 3,
              p: 3,
              mb: 3,
            }}
          >
            <CurrencyBitcoinIcon sx={{ fontSize: 64, color: "#fff", opacity: 0.7 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary", mb: 1 }}>
            No Coin Investment Data
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Start by adding your first coin investment using the button above.
          </Typography>
        </Paper>
      )}

      {/* Transaction List */}
      {coinInvestments.length > 0 && (
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
            Detailed list of all coin investments in BHT with transaction charges
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
                    borderBottom: "2px solid #ff5e62",
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
                    borderBottom: "2px solid #ff5e62",
                  }}
                >
                  Amount (BHT)
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
                    borderBottom: "2px solid #ff5e62",
                  }}
                >
                  Charges (BHT)
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
                    borderBottom: "2px solid #ff5e62",
                  }}
                >
                  Total (BHT)
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
                    borderBottom: "2px solid #ff5e62",
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
                    borderBottom: "2px solid #ff5e62",
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
                      bgcolor: "rgba(255, 94, 98, 0.08)",
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
                      {formatCurrencyBHT(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={formatCurrencyBHT(transaction.transactionCharge)}
                      size="small"
                      sx={{
                        bgcolor: "rgba(239, 83, 80, 0.15)",
                        color: "#ef5350",
                        fontWeight: 600,
                        border: "1px solid rgba(239, 83, 80, 0.3)",
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" fontWeight="bold" sx={{ color: "#90caf9" }}>
                      {formatCurrencyBHT(transaction.totalAmount)}
                    </Typography>
                  </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="600" sx={{ color: "#f48fb1" }}>
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

export default CoinInvestmentPage;