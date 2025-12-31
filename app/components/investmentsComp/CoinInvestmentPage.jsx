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
  useMediaQuery,
  useTheme,
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
        fullScreen={isMobile}
        PaperProps={{
          sx:{
            borderRadius: isMobile ? 0 : 3,
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
            p: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
            Add New Coin Investment
          </Typography>
          <IconButton onClick={() => setOpenAddDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 2, sm: 2.5, md: 3 }, p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box component="form" id="add-form" onSubmit={handleAddSubmit}>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
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
        <DialogActions sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderTop: "1px solid #23272f", flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button
            onClick={() => setOpenAddDialog(false)}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.1, md: 1.2 },
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
            fullWidth={isMobile}
            disabled={addInvestmentMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.1, md: 1.2 },
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
        fullScreen={isMobile}
        PaperProps={{
          sx:{
            borderRadius: isMobile ? 0 : 3,
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
            p: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
            Edit Coin Investment
          </Typography>
          <IconButton onClick={() => setOpenEditDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 2, sm: 2.5, md: 3 }, p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box component="form" id="edit-form" onSubmit={handleEditSubmit}>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
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
        <DialogActions sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderTop: "1px solid #23272f", flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.1, md: 1.2 },
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
            fullWidth={isMobile}
            disabled={updateInvestmentMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #90caf9 0%, #42a5f5 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.1, md: 1.2 },
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
        fullScreen={isMobile}
        PaperProps={{
          sx:{
            borderRadius: isMobile ? 0 : 3,
            bgcolor: "background.paper",
            border: "1px solid #23272f",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "background.default",
            borderBottom: "1px solid #23272f",
            p: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#ef5350", fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 2, sm: 2.5, md: 3 }, p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Are you sure you want to delete this coin investment?
          </Typography>
          {selectedInvestment && (
            <Paper
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: "background.default",
                border: "1px solid #23272f",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                Date: <strong>{formatDate(selectedInvestment.date)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                Amount: <strong>{formatCurrencyBHT(selectedInvestment.amount)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                Total: <strong>{formatCurrencyBHT(selectedInvestment.totalAmount)}</strong>
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderTop: "1px solid #23272f", flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.1, md: 1.2 },
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
            fullWidth={isMobile}
            disabled={deleteInvestmentMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #ef5350 0%, #f44336 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.1, md: 1.2 },
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
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, alignItems: "stretch" }}>
        <Grid item xs={12} sm={6} md={2}>
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              bgcolor: "background.paper",
              border: "1px solid #23272f",
              textAlign: "center",
              height: "100%",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              TOTAL INVESTMENT (BHT)
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#ff9966", mt: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
              {formatCurrencyBHT(totalInvestment)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              bgcolor: "background.paper",
              border: "1px solid #23272f",
              textAlign: "center",
              height: "100%",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              TRANSACTION CHARGES
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#ef5350", mt: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
              {formatCurrencyBHT(totalCharges)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              bgcolor: "background.paper",
              border: "1px solid #23272f",
              textAlign: "center",
              height: "100%",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              GRAND TOTAL (BHT)
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#90caf9", mt: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
              {formatCurrencyBHT(grandTotal)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              bgcolor: "background.paper",
              border: "1px solid rgba(102, 187, 106, 0.5)",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(102, 187, 106, 0.2)",
              height: "100%",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              NPR AMOUNT (×4.3)
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#66bb6a", mt: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
              {formatCurrencyNPR(grandTotalInNPR)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.8} sx={{ display: "flex", justifyContent: { xs: 'center', md: 'flex-end' }, alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />}
            onClick={handleOpenAddDialog}
            fullWidth={isMobile}
            sx={{
              background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: { xs: 2.5, sm: 3, md: 3 },
              py: { xs: 1.25, sm: 1.375, md: 1.5 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
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
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 2, sm: 2.5, md: 3 },
          bgcolor: "background.paper",
          border: "1px solid #23272f",
          mb: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
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
            <CartesianGrid strokeDasharray="3 3" stroke="#23272f" />
            <XAxis
              dataKey="year"
              stroke="#b0b8c1"
              style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: 600 }}
            />
            <YAxis
              stroke="#b0b8c1"
              style={{ fontSize: isMobile ? "11px" : "14px" }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 94, 98, 0.1)" }} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: "#f5f6fa", fontSize: isMobile ? "12px" : "14px", fontWeight: 600 }}>
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
            p: { xs: 4, sm: 5, md: 6 },
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            bgcolor: "background.paper",
            border: "1px solid #23272f",
            mb: { xs: 2, sm: 2.5, md: 3 },
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
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
            border: "1px solid #23272f",
            overflow: "hidden",
          }}
        >
        <Box
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: "1px solid #23272f",
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
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff5e62",
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
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff5e62",
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
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff5e62",
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
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff5e62",
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
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff5e62",
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
                    bgcolor: "#1e1e1e",
                    color: "#f5f6fa",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    borderBottom: "2px solid #ff5e62",
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
                      bgcolor: isMobile ? "transparent" : "rgba(255, 94, 98, 0.08)",
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
                    <Typography variant="body1" fontWeight="700" sx={{ color: "#ff9966", fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {formatCurrencyBHT(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' }, px: { xs: 1, sm: 2 } }}>
                    <Chip
                      label={formatCurrencyBHT(transaction.transactionCharge)}
                      size="small"
                      sx={{
                        bgcolor: "rgba(239, 83, 80, 0.15)",
                        color: "#ef5350",
                        fontWeight: 600,
                        border: "1px solid rgba(239, 83, 80, 0.3)",
                        fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ px: { xs: 1, sm: 2 } }}>
                    <Typography variant="body1" fontWeight="bold" sx={{ color: "#90caf9", fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {formatCurrencyBHT(transaction.totalAmount)}
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
                        color: "#90caf9",
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
                        color: "#ef5350",
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