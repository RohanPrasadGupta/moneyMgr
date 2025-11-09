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
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
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
          p: { xs: 2, sm: 4 },
          maxWidth: 800,
          mx: "auto",
          height: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="error" size={48} thickness={5} />
        <Typography variant="h6" color="error" mt={3}>
          Loading transactions...
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 4 },
        maxWidth: { xs: "100%", sm: 800 },
        mx: "auto",
        minHeight: "80vh",
        bgcolor: "background.default",
        color: "text.primary",
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        mb={{ xs: 1, sm: 1.5 }}
        sx={{ fontSize: { xs: "1.2rem", sm: "1.7rem", md: "2rem" } }}
      >
        Transactions
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        mb={{ xs: 2, sm: 3 }}
        sx={{ fontSize: { xs: "0.95rem", sm: "1.1rem" } }}
      >
        Overview of your monthly transactions
      </Typography>
      <Box
        mb={{ xs: 2, sm: 3 }}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
        >
          Year: <b>{currentYear}</b> | Month:{" "}
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
              minWidth: 100,
            }}
          >
            {Months.map((month, index) => (
              <MenuItem
                key={index}
                value={month}
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }}
              >
                {month}
              </MenuItem>
            ))}
          </Select>
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, fontSize: { xs: "0.85rem", sm: "1rem" } }}
        >
          Income:{" "}
          <b
            style={{
              color: "#43a047",
              display: "inline-block",
              minWidth: 60,
              textAlign: "right",
            }}
          >
            {totals.income === "-"
              ? "-"
              : new Intl.NumberFormat().format(totals.income)}
          </b>
          <span style={{ color: "#757575", margin: "0 8px" }}>|</span>
          Expenses:{" "}
          <b
            style={{
              color: "#ef5350",
              display: "inline-block",
              minWidth: 60,
              textAlign: "right",
            }}
          >
            {totals.expense === "-"
              ? "-"
              : new Intl.NumberFormat().format(totals.expense)}
          </b>
        </Typography>
      </Box>

      {transactionDetails?.data?.length === 0 ? (
        <Box
          sx={{
            p: { xs: 2, sm: 4 },
            maxWidth: 800,
            mx: "auto",
            height: "100vh",
            bgcolor: "background.default",
            color: "text.primary",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" color="error" mt={3}>
            No transactions found
          </Typography>
        </Box>
      ) : (
        <Stack spacing={{ xs: 1.5, sm: 3 }}>
          {groupByDay(transactionDetails?.data || []).map((group) => {
            const groupTotals = getTotals(group.transactions);
            const incomeVal =
              groupTotals.income === "-" ? 0 : Number(groupTotals.income);
            const expenseVal =
              groupTotals.expense === "-" ? 0 : Number(groupTotals.expense);
            const net = incomeVal - expenseVal;

            return (
              <Box
                key={`${group.day}-${group.month}-${group.year}`}
                sx={{ mb: { xs: 1, sm: 2 } }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        bgcolor: "#23272f",
                        color: "#fff",
                        px: { xs: 1, sm: 2 },
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        minWidth: 32,
                        textAlign: "center",
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      {group.day}
                    </Typography>
                    <Chip
                      label={group.weekday}
                      size="small"
                      sx={{
                        bgcolor: "#616161",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: { xs: "0.7rem", sm: "0.9rem" },
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, fontSize: { xs: "0.7rem", sm: "0.9rem" } }}
                    >
                      {group.month}.{group.year}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      ml: { xs: "auto", sm: "auto" },
                      mt: { xs: 0, sm: 0 },
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "#43a047",
                        fontSize: { xs: "0.85rem", sm: "1rem" },
                      }}
                    >
                      {new Intl.NumberFormat().format(Math.abs(incomeVal))} THB
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "#ef5350",
                        fontSize: { xs: "0.85rem", sm: "1rem" },
                      }}
                    >
                      {new Intl.NumberFormat().format(Math.abs(expenseVal))} THB
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={1}>
                  {group.transactions.map((tx) => (
                    <Paper
                      key={tx._id}
                      elevation={2}
                      sx={{
                        mb: 1,
                        borderLeft: "4px solid",
                        borderColor:
                          tx.type === "Expense" ? "#ef5350" : "#43a047",
                        p: { xs: 1, sm: 2 },
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, sm: 2 },
                        borderRadius: 2,
                        bgcolor: "background.paper",
                        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.08)",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: { xs: "flex-end", sm: "space-between" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        {/* Icon */}
                        <Box
                          sx={{
                            textAlign: "center",
                            minWidth: 32,
                          }}
                        >
                          {tx.type === "Income" ? (
                            <ArrowUpwardIcon
                              sx={{
                                color: "#43a047",
                                fontSize: { xs: 20, sm: 24 },
                              }}
                            />
                          ) : (
                            <ArrowDownwardIcon
                              sx={{
                                color: "#ef5350",
                                fontSize: { xs: 20, sm: 24 },
                              }}
                            />
                          )}
                        </Box>

                        {/* Details */}
                        <Box
                          sx={{
                            flex: 1,
                            width: "100%",
                            pl: { xs: 0.5, sm: 1 },
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ flexWrap: "wrap" }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              sx={{ fontSize: { xs: "0.95rem", sm: "1.1rem" } }}
                            >
                              {tx.category}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.95rem" },
                                lineHeight: 0,
                              }}
                            >
                              {tx.account}
                            </Typography>
                          </Stack>
                          {tx.note && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
                            >
                              {tx.note}
                            </Typography>
                          )}
                        </Box>

                        {/* Amount */}
                        <Box
                          sx={{
                            textAlign: "right",
                            height: "auto",
                            width: "auto",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body1"
                            fontWeight={700}
                            sx={{
                              color:
                                tx.type === "Income" ? "#43a047" : "#ef5350",
                              fontSize: { xs: "0.95rem", sm: "1.1rem" },
                            }}
                          >
                            {tx.amount &&
                              new Intl.NumberFormat().format(tx.amount)}{" "}
                            {tx.currency}
                          </Typography>
                        </Box>

                        {/* Edit & Delete Buttons */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            ml: { xs: 0.5, sm: 1 },
                          }}
                        >
                          <IconButton
                            onClick={() => openEditDialog(tx)}
                            sx={{
                              color: "#fff",
                              bgcolor: "#121316",
                              border: "1px solid rgba(255,255,255,0.04)",
                              "&:hover": { bgcolor: "#1b1f24" },
                              width: 28,
                              height: 28,
                            }}
                            aria-label="edit-transaction"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteClick(tx._id)}
                            sx={{
                              color: "#fff",
                              bgcolor: "#ef5350",
                              "&:hover": { bgcolor: "#d32f2f" },
                              width: 28,
                              height: 28,
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      <Dialog open={editDialogOpen}>
        <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Edit Transaction
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Date & Time"
                value={editData ? dayjs(editData.date) : dayjs()}
                onChange={handleEditDateTimeChange}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />
            </LocalizationProvider>

            <Typography
              variant="subtitle1"
              sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
            >
              Category
            </Typography>

            <Box
              ref={categoriesRef}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                height: { xs: "120px", sm: "180px" },
                width: "100%",
                overflowY: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1,
                boxSizing: "border-box",

                "&::-webkit-scrollbar": { width: 8, height: 8 },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  background:
                    editData?.type === "Income"
                      ? "linear-gradient(180deg, rgba(67,160,71,0.28), rgba(67,160,71,0.18))"
                      : "linear-gradient(180deg, rgba(239,83,80,0.28), rgba(239,83,80,0.18))",
                  borderRadius: 8,
                  border: "2px solid rgba(0,0,0,0)",
                  minHeight: 24,
                  transition:
                    "background-color 200ms ease, transform 200ms ease",
                },
                "&:hover::-webkit-scrollbar-thumb": {
                  background:
                    editData?.type === "Income"
                      ? "linear-gradient(180deg, rgba(67,160,71,0.6), rgba(67,160,71,0.4))"
                      : "linear-gradient(180deg, rgba(239,83,80,0.6), rgba(239,83,80,0.4))",
                  transform: "scale(1.02)",
                },
                "&::-webkit-scrollbar-corner": { background: "transparent" },

                scrollbarWidth: "thin",
              }}
            >
              {isCategoriesPending ? (
                <CircularProgress size={24} />
              ) : filteredCategories.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", width: "100%" }}
                >
                  No categories found.
                </Typography>
              ) : (
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 1,
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {filteredCategories.map((option) => (
                    <Button
                      key={option?._id}
                      variant={
                        editData?.category === option?.name
                          ? "contained"
                          : "outlined"
                      }
                      color={editData?.type === "Income" ? "success" : "error"}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        background:
                          editData?.category === option?.name
                            ? editData?.type === "Income"
                              ? "#43a047"
                              : "#ef5350"
                            : undefined,
                        color:
                          editData?.category === option?.name
                            ? "#fff"
                            : editData?.type === "Income"
                            ? "#43a047"
                            : "#ef5350",
                        boxShadow: "none",
                        backgroundImage: "none",
                      }}
                      onClick={() =>
                        setEditData((prev) => ({
                          ...prev,
                          category: option?.name,
                        }))
                      }
                    >
                      {option?.name}
                    </Button>
                  ))}
                </Stack>
              )}
            </Box>
            <RadioGroup
              row
              name="account"
              value={editData?.account || "Cash"}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            >
              {accountOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={
                    <Radio
                      sx={{
                        color:
                          editData?.type === "Income" ? "#43a047" : "#ef5350",
                      }}
                    />
                  }
                  label={option}
                  sx={{ color: "text.primary", mr: 2 }}
                />
              ))}
            </RadioGroup>
            <TextField
              label="Note"
              name="note"
              value={editData?.note || ""}
              onChange={handleEditChange}
              fullWidth
              sx={{ mb: 2, fontSize: { xs: "0.9rem", sm: "1rem" } }}
            />
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={editData?.amount || ""}
              onChange={handleEditChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">THB</InputAdornment>
                ),
              }}
              sx={{ mb: 2, fontSize: { xs: "0.9rem", sm: "1rem" } }}
            />

            <RadioGroup
              row
              name="type"
              value={editData?.type || "Expense"}
              onChange={handleEditChange}
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              <FormControlLabel
                value="Income"
                control={<Radio />}
                label="Income"
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
              />
              <FormControlLabel
                value="Expense"
                control={<Radio />}
                label="Expense"
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
              />
            </RadioGroup>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              <Button
                onClick={() => setEditDialogOpen(false)}
                sx={{
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  background: "#d14313",
                  color: "#ffffff",
                  boxShadow: "none",
                  backgroundImage: "none",
                  borderColor: "#d14313",
                  "&:hover": {
                    background: "#b7370f",
                    borderColor: "#b7370f",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  background: "#137fd1",
                  color: "#ffffff",
                  boxShadow: "none",
                  backgroundImage: "none",
                  "&:hover": { background: "#0f6fbf" },
                }}
              >
                Confirm
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
            This action cannot be undone. Do you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              background: "#d14313",
              color: "#ffffff",
              boxShadow: "none",
              backgroundImage: "none",
              borderColor: "#d14313",
              "&:hover": {
                background: "#b7370f",
                borderColor: "#b7370f",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              background: "#137fd1",
              color: "#ffffff",
              boxShadow: "none",
              backgroundImage: "none",
              "&:hover": { background: "#0f6fbf" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionView;
