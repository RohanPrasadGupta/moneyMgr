"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  IconButton,
  Divider,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  InputAdornment,
  Select,
  MenuItem,
  Button,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useCategoryQuery } from "../../services/useCategoryServices";

function formatDateTime(dateString) {
  return dayjs(dateString).format("MMM D, YYYY h:mm A");
}

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

const accountOptions = ["Cash", "Online"];

// Group transactions by day
function groupByDay(transactions) {
  const groups = {};
  transactions.forEach((tx) => {
    const dateObj = dayjs(tx.date);
    const day = dateObj.date();
    const month = dateObj.format("MM");
    const year = dateObj.year();
    const weekday = dateObj.format("ddd");
    const key = `${day}-${month}-${year}`;
    if (!groups[key]) {
      groups[key] = {
        day,
        month,
        year,
        weekday,
        transactions: [],
      };
    }
    groups[key].transactions.push(tx);
  });

  return Object.values(groups).sort((a, b) => b.day - a.day);
}

function getTotals(transactions) {
  if (!transactions || transactions.length === 0)
    return { income: "-", expense: "-" };
  let income = 0;
  let expense = 0;
  transactions.forEach((tx) => {
    if (tx.type === "Income") income += Number(tx.amount);
    else if (tx.type === "Expense") expense += Number(tx.amount);
  });
  return {
    income: income === 0 ? "-" : income,
    expense: expense === 0 ? "-" : expense,
  };
}

const TransactionView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedTxId, setSelectedTxId] = React.useState(null);
  const [currentYear, setCurrentYear] = React.useState("");
  const [currentMonth, setCurrentMonth] = React.useState("");
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState("");

  const {
    isPending: isCategoriesPending,
    isError,
    data: categoriesFetched,
    error,
    refetch,
  } = useCategoryQuery();

  // category filtering for edit dialog will be computed after editData is available

  const { isPending, data: transactionDetails } = useQuery({
    queryKey: ["getMonthlyTransactions", currentYear, currentMonth],
    queryFn: () =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data/${currentYear}/${currentMonth}`,
        { method: "GET", credentials: "include" }
      ).then((res) => res.json()),
    enabled: Boolean(currentYear && currentMonth),
  });

  const mutation = useMutation({
    mutationFn: async ({ id }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setSelectedTxId(null);
      queryClient.invalidateQueries({ queryKey: ["getMonthlyTransactions"] });
      toast.success("Transaction deleted successfully");
    },
    onError: () => toast.error("Failed to delete transaction"),
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (transactionData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data/${transactionData._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        }
      );
      return res.json();
    },
    onSuccess: () => {
      toast.success("Transaction updated successfully");
      queryClient.invalidateQueries({ queryKey: ["getMonthlyTransactions"] });
      setEditDialogOpen(false);
      setEditData(null);
    },
    onError: () => {
      toast.error("Failed to update transaction");
    },
  });

  useEffect(() => {
    const now = dayjs();
    setCurrentYear(now.year());
    setCurrentMonth(now.format("MMMM"));
  }, []);

  const handleDeleteClick = (id) => {
    setSelectedTxId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => mutation.mutate({ id: selectedTxId });
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedTxId(null);
  };

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editData, setEditData] = React.useState(null);

  // categories filtered by editData.type (so edit dialog shows matching categories)
  const categoriesRef = useRef(null);

  const filteredCategories = React.useMemo(() => {
    if (!categoriesFetched || !Array.isArray(categoriesFetched)) return [];
    const type = editData?.type || "Expense";
    return categoriesFetched.filter((cat) => cat.categoryType === type);
  }, [categoriesFetched, editData?.type]);

  useEffect(() => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollTop = 0;
    }
  }, [filteredCategories, editData?.type]);

  const openEditDialog = (tx) => {
    // clone tx into editable object
    setEditData({
      ...tx,
      date: tx.date || dayjs().toISOString(),
      amount: tx.amount != null ? String(tx.amount) : "",
      note: tx.note || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditDateTimeChange = (newVal) => {
    setEditData((prev) => ({ ...prev, date: dayjs(newVal).toISOString() }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editData) return;
    const payload = { ...editData, amount: Number(editData.amount) };
    updateTransactionMutation.mutate(payload);
  };

  const totals = getTotals(transactionDetails?.data);

  if (isPending)
    return (
      <Box
        sx={{
          width: "100%",
          mx: "auto",
          mt: { xs: 1, sm: 3 },
          p: { xs: 2, sm: 3 },
          bgcolor: "background.paper",
          borderRadius: { xs: 0, sm: 3 },
          boxShadow: { xs: 0, sm: 4 },
          minHeight: { xs: "calc(100vh - 100px)", sm: "calc(100vh - 150px)", md: 600 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={60} sx={{ color: "#ff9966" }} />
        <Typography variant="body1" sx={{ color: "text.secondary", fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          Loading transactions...
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        mt: { xs: 1, sm: 3 },
        p: { xs: 2, sm: 3 },
        bgcolor: "background.paper",
        borderRadius: { xs: 0, sm: 3 },
        boxShadow: { xs: 0, sm: 4 },
        minHeight: { xs: "calc(100vh - 100px)", sm: "calc(100vh - 150px)", md: 600 },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          pb: { xs: 2, sm: 3 },
          borderBottom: "2px solid #23272f",
        }}
      >
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #ff9966, #ff5e62)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0.5,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            }}
          >
            Transaction History
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "text.secondary",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            Track and manage your monthly transactions
          </Typography>
        </Box>

        {/* Month/Year Selector and Stats */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="stretch">
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: "background.default",
                border: "1px solid #23272f",
                borderRadius: 2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 1, sm: 2 },
                height: "100%",
              }}
            >
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1} 
                width={{ xs: "100%", sm: "auto" }}
                sx={{ 
                  justifyContent: { xs: "space-between", sm: "flex-start" },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ReceiptLongIcon sx={{ color: "#ff9966", fontSize: { xs: 20, sm: 24 } }} />
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                    Year: {currentYear}
                  </Typography>
                </Stack>
                <Divider 
                  orientation="vertical" 
                  flexItem 
                  sx={{ display: { xs: "none", sm: "block" } }}
                />
              </Stack>
              <Select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 120 },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiSelect-select": {
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    py: { xs: 0.5, sm: 1 },
                  },
                }}
              >
                {Months.map((month, index) => (
                  <MenuItem key={index} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction={{ xs: "row", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }} height="100%">
              <Paper
                sx={{
                  flex: 1,
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: "background.default",
                  border: "1px solid rgba(67, 160, 71, 0.3)",
                  borderRadius: 2,
                  minWidth: 0,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <TrendingUpIcon sx={{ color: "#43a047", fontSize: { xs: 18, sm: 20 } }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "text.secondary",
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    Income
                  </Typography>
                </Stack>
                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  sx={{ 
                    color: "#43a047",
                    fontSize: { xs: "0.95rem", sm: "1.25rem" },
                    wordBreak: "break-all",
                  }}
                >
                  {totals.income === "-"
                    ? "-"
                    : new Intl.NumberFormat().format(totals.income)}
                </Typography>
              </Paper>

              <Paper
                sx={{
                  flex: 1,
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: "background.default",
                  border: "1px solid rgba(239, 83, 80, 0.3)",
                  borderRadius: 2,
                  minWidth: 0,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <TrendingDownIcon sx={{ color: "#ef5350", fontSize: { xs: 18, sm: 20 } }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "text.secondary",
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    Expense
                  </Typography>
                </Stack>
                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  sx={{ 
                    color: "#ef5350",
                    fontSize: { xs: "0.95rem", sm: "1.25rem" },
                    wordBreak: "break-all",
                  }}
                >
                  {totals.expense === "-"
                    ? "-"
                    : new Intl.NumberFormat().format(totals.expense)}
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Transactions List */}
      {transactionDetails?.data?.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: { xs: "calc(100vh - 400px)", sm: "calc(100vh - 450px)", md: 300 },
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: { xs: 60, sm: 80 },
              height: { xs: 60, sm: 80 },
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff9966, #ff5e62)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.3,
            }}
          >
            <ReceiptLongIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: "#fff" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ 
              color: "text.secondary", 
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            No Transactions Found
          </Typography>
          <Typography
            variant="body2"
            sx={{ 
              color: "text.secondary", 
              textAlign: "center", 
              maxWidth: 400,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              px: { xs: 2, sm: 0 },
            }}
          >
            No transactions recorded for {currentMonth} {currentYear}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={{ xs: 2, sm: 3 }}>
          {groupByDay(transactionDetails?.data || []).map((group) => {
            const groupTotals = getTotals(group.transactions);
            const incomeVal =
              groupTotals.income === "-" ? 0 : Number(groupTotals.income);
            const expenseVal =
              groupTotals.expense === "-" ? 0 : Number(groupTotals.expense);
            const net = incomeVal - expenseVal;

            return (
              <Box key={`${group.day}-${group.month}-${group.year}`}>
                {/* Day Header */}
                <Paper
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    mb: { xs: 1.5, sm: 2 },
                    bgcolor: "background.default",
                    border: "1px solid #23272f",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
                    <Box
                      sx={{
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #ff9966, #ff5e62)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                        color: "#fff",
                      }}
                    >
                      {group.day}
                    </Box>
                    <Box>
                      <Typography 
                        variant="body1" 
                        fontWeight={700}
                        sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                      >
                        {group.weekday}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: "text.secondary",
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        }}
                      >
                        {group.month}/{group.year}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack 
                    direction={{ xs: "row", sm: "row" }} 
                    spacing={{ xs: 2, sm: 3 }}
                    sx={{ 
                      width: { xs: "100%", sm: "auto" },
                      justifyContent: { xs: "space-between", sm: "flex-start" },
                    }}
                  >
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: "text.secondary", 
                          display: "block",
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        }}
                      >
                        Income
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={700} 
                        sx={{ 
                          color: "#43a047",
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        ฿{new Intl.NumberFormat().format(Math.abs(incomeVal))}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: "text.secondary", 
                          display: "block",
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        }}
                      >
                        Expense
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={700} 
                        sx={{ 
                          color: "#ef5350",
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        ฿{new Intl.NumberFormat().format(Math.abs(expenseVal))}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Transactions */}
                <Stack spacing={{ xs: 1, sm: 1.5 }}>
                  {group.transactions.map((tx) => (
                    <Paper
                      key={tx._id}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: "background.paper",
                        border: `1px solid ${tx.type === "Income" ? "rgba(67, 160, 71, 0.3)" : "rgba(239, 83, 80, 0.3)"}`,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 1.5, sm: 2 },
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: { xs: "none", sm: "translateY(-2px)" },
                          boxShadow: `0 4px 12px ${tx.type === "Income" ? "rgba(67, 160, 71, 0.2)" : "rgba(239, 83, 80, 0.2)"}`,
                          borderColor: tx.type === "Income" ? "#43a047" : "#ff5e62",
                        },
                      }}
                    >
                      {/* Icon and Details - Mobile Horizontal Layout */}
                      <Stack 
                        direction="row" 
                        alignItems="center"
                        spacing={1.5}
                        sx={{ 
                          width: { xs: "100%", sm: "auto" },
                          flex: { xs: "none", sm: 1 },
                          minWidth: { xs: "auto", sm: 0 },
                        }}
                      >
                        {/* Icon */}
                        <Box
                          sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            borderRadius: "50%",
                            bgcolor: tx.type === "Income" ? "rgba(67, 160, 71, 0.1)" : "rgba(239, 83, 80, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {tx.type === "Income" ? (
                            <ArrowUpwardIcon sx={{ color: "#43a047", fontSize: { xs: 20, sm: 24 } }} />
                          ) : (
                            <ArrowDownwardIcon sx={{ color: "#ef5350", fontSize: { xs: 20, sm: 24 } }} />
                          )}
                        </Box>

                        {/* Details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack 
                            direction={{ xs: "column", sm: "row" }} 
                            alignItems={{ xs: "flex-start", sm: "center" }} 
                            spacing={{ xs: 0.5, sm: 1 }} 
                            mb={0.5}
                          >
                            <Typography 
                              variant="body1" 
                              fontWeight={700} 
                              sx={{ 
                                color: "text.primary",
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                              }}
                            >
                              {tx.category}
                            </Typography>
                            <Chip
                              label={tx.account}
                              size="small"
                              sx={{
                                height: { xs: 18, sm: 20 },
                                fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                bgcolor: "background.default",
                                border: "1px solid #23272f",
                              }}
                            />
                          </Stack>
                          {tx.note && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                              }}
                            >
                              {tx.note}
                            </Typography>
                          )}
                        </Box>
                      </Stack>

                      {/* Amount and Actions - Mobile Full Width */}
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        justifyContent="space-between"
                        sx={{ 
                          width: { xs: "100%", sm: "auto" },
                          gap: { xs: 2, sm: 2 },
                        }}
                      >
                        {/* Amount */}
                        <Box sx={{ textAlign: { xs: "left", sm: "right" }, minWidth: { xs: "auto", sm: 100 } }}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              color: tx.type === "Income" ? "#43a047" : "#ef5350",
                              fontSize: { xs: "1rem", sm: "1.25rem" },
                            }}
                          >
                            {tx.amount && new Intl.NumberFormat().format(tx.amount)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: "text.secondary",
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            }}
                          >
                            {tx.currency}
                          </Typography>
                        </Box>

                        {/* Actions */}
                        <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(tx)}
                            sx={{
                              color: "#90caf9",
                              bgcolor: "rgba(144, 202, 249, 0.1)",
                              border: "1px solid rgba(144, 202, 249, 0.3)",
                              width: { xs: 32, sm: 36 },
                              height: { xs: 32, sm: 36 },
                              "&:hover": {
                                bgcolor: "rgba(144, 202, 249, 0.2)",
                                transform: { xs: "none", sm: "scale(1.1)" },
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <EditIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(tx._id)}
                            sx={{
                              color: "#ef5350",
                              bgcolor: "rgba(239, 83, 80, 0.1)",
                              border: "1px solid rgba(239, 83, 80, 0.3)",
                              width: { xs: 32, sm: 36 },
                              height: { xs: 32, sm: 36 },
                              "&:hover": {
                                bgcolor: "rgba(239, 83, 80, 0.2)",
                                transform: { xs: "none", sm: "scale(1.1)" },
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            bgcolor: "background.paper",
            border: { xs: "none", sm: "1px solid #23272f" },
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #23272f",
            pb: 2,
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
              <Box
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #90caf9, #42a5f5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EditIcon sx={{ color: "#fff", fontSize: { xs: 18, sm: 20 } }} />
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  Edit Transaction
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "text.secondary",
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  Update transaction details
                </Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setEditDialogOpen(false)}
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>
          <Box component="form" onSubmit={handleEditSubmit}>
            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              {/* Date Time Picker */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Date & Time"
                  value={editData ? dayjs(editData.date) : dayjs()}
                  onChange={handleEditDateTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: isMobile ? "small" : "medium",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "background.default",
                        },
                        "& .MuiSvgIcon-root": { color: "#fff" },
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              {/* Transaction Type */}
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  sx={{ 
                    mb: 1.5,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  Transaction Type
                </Typography>
                <RadioGroup
                  row
                  name="type"
                  value={editData?.type || "Expense"}
                  onChange={handleEditChange}
                  sx={{
                    gap: { xs: 1.5, sm: 2 },
                    flexDirection: { xs: "column", sm: "row" },
                    "& .MuiFormControlLabel-root": {
                      flex: 1,
                      m: 0,
                    },
                  }}
                >
                  <Paper
                    sx={{
                      flex: 1,
                      border: editData?.type === "Income" ? "2px solid #43a047" : "1px solid #23272f",
                      borderRadius: 2,
                      bgcolor: editData?.type === "Income" ? "rgba(67, 160, 71, 0.1)" : "background.default",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FormControlLabel
                      value="Income"
                      control={<Radio sx={{ color: "#43a047" }} />}
                      label={<span style={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>Income</span>}
                      sx={{ p: { xs: 1, sm: 1.5 }, width: "100%" }}
                    />
                  </Paper>
                  <Paper
                    sx={{
                      flex: 1,
                      border: editData?.type === "Expense" ? "2px solid #ff5e62" : "1px solid #23272f",
                      borderRadius: 2,
                      bgcolor: editData?.type === "Expense" ? "rgba(255, 94, 98, 0.1)" : "background.default",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FormControlLabel
                      value="Expense"
                      control={<Radio sx={{ color: "#ff5e62" }} />}
                      label={<span style={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>Expense</span>}
                      sx={{ p: { xs: 1, sm: 1.5 }, width: "100%" }}
                    />
                  </Paper>
                </RadioGroup>
              </Box>

              {/* Category Selection */}
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  sx={{ 
                    mb: 1.5,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  Category
                </Typography>
                <Paper
                  ref={categoriesRef}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    maxHeight: { xs: 150, sm: 200 },
                    overflowY: "auto",
                    bgcolor: "background.default",
                    border: "1px solid #23272f",
                    borderRadius: 2,
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-track": { background: "transparent" },
                    "&::-webkit-scrollbar-thumb": {
                      background: editData?.type === "Income" ? "rgba(67, 160, 71, 0.3)" : "rgba(255, 94, 98, 0.3)",
                      borderRadius: 3,
                    },
                  }}
                >
                  {isCategoriesPending ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : filteredCategories.length === 0 ? (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "text.secondary", 
                        textAlign: "center",
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      }}
                    >
                      No categories found
                    </Typography>
                  ) : (
                    <Stack direction="row" flexWrap="wrap" gap={{ xs: 0.75, sm: 1 }}>
                      {filteredCategories.map((option) => (
                        <Chip
                          key={option?._id}
                          label={option?.name}
                          onClick={() =>
                            setEditData((prev) => ({
                              ...prev,
                              category: option?.name,
                            }))
                          }
                          sx={{
                            bgcolor: editData?.category === option?.name
                              ? (editData?.type === "Income" ? "#43a047" : "#ff5e62")
                              : "rgba(255,255,255,0.05)",
                            color: editData?.category === option?.name ? "#fff" : "text.primary",
                            border: editData?.category === option?.name
                              ? "none"
                              : `1px solid ${editData?.type === "Income" ? "rgba(67, 160, 71, 0.3)" : "rgba(255, 94, 98, 0.3)"}`,
                            fontWeight: editData?.category === option?.name ? 700 : 400,
                            fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                            height: { xs: 26, sm: 32 },
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: editData?.category === option?.name
                                ? (editData?.type === "Income" ? "#388e3c" : "#ff3d47")
                                : "rgba(255,255,255,0.1)",
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Box>

              {/* Account */}
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  sx={{ 
                    mb: 1.5,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  Account
                </Typography>
                <RadioGroup
                  row
                  name="account"
                  value={editData?.account || "Cash"}
                  onChange={handleEditChange}
                  sx={{ gap: { xs: 1.5, sm: 2 } }}
                >
                  {accountOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={
                        <Radio
                          sx={{
                            color: editData?.type === "Income" ? "#43a047" : "#ff5e62",
                          }}
                        />
                      }
                      label={<span style={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>{option}</span>}
                    />
                  ))}
                </RadioGroup>
              </Box>

              {/* Amount */}
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={editData?.amount || ""}
                onChange={handleEditChange}
                fullWidth
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">THB</InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "background.default",
                  },
                  "& .MuiInputBase-input": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
              />

              {/* Note */}
              <TextField
                label="Note (Optional)"
                name="note"
                value={editData?.note || ""}
                onChange={handleEditChange}
                fullWidth
                multiline
                rows={isMobile ? 2 : 3}
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "background.default",
                  },
                  "& .MuiInputBase-input": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
              />
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{
              background: "linear-gradient(135deg, #757575, #9e9e9e)",
              color: "#fff",
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              "&:hover": {
                background: "linear-gradient(135deg, #616161, #757575)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            disabled={updateTransactionMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #90caf9, #42a5f5)",
              color: "#fff",
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              "&:hover": {
                background: "linear-gradient(135deg, #64b5f6, #1e88e5)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #757575, #9e9e9e)",
                color: "#fff",
                opacity: 0.6,
              },
            }}
          >
            {updateTransactionMutation.isPending ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            border: "1px solid #23272f",
            m: { xs: 2, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #23272f",
            pb: 2,
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
            <Box
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                borderRadius: "50%",
                bgcolor: "rgba(239, 83, 80, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DeleteIcon sx={{ color: "#ef5350", fontSize: { xs: 18, sm: 20 } }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                Delete Transaction
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: "text.secondary",
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                This action cannot be undone
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2 },
              bgcolor: "background.default",
              border: "1px solid #23272f",
              borderRadius: 2,
            }}
          >
            <Typography 
              variant="body1"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Are you sure you want to delete this transaction?
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{
              background: "linear-gradient(135deg, #757575, #9e9e9e)",
              color: "#fff",
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              "&:hover": {
                background: "linear-gradient(135deg, #616161, #757575)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={mutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #ef5350, #f44336)",
              color: "#fff",
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              "&:hover": {
                background: "linear-gradient(135deg, #e53935, #d32f2f)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #757575, #9e9e9e)",
                color: "#fff",
                opacity: 0.6,
              },
            }}
          >
            {mutation.isPending ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionView;
