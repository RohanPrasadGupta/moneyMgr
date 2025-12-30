"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCategoryQuery } from "../../services/useCategoryServices";

const accountOptions = ["Cash", "Online"];

const AddTransaction = ({ setAddModalOpen }) => {
  const [form, setForm] = useState({
    dateTime: dayjs().toISOString(),
    account: "Cash",
    category: "",
    note: "",
    type: "Expense",
    amount: "",
  });
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("Expense");
  const queryClient = useQueryClient();

  const {
    isPending,
    isError,
    data: categoriesFetched,
    error,
    refetch,
  } = useCategoryQuery();

  const mutation = useMutation({
    mutationFn: async (submitData) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });
      return res.json();
    },
    onSuccess: () => {
      setAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["getMonthlyTransactions"] });
      toast.success("Transaction added successfully");
    },
    onError: () => {
      toast.error("Failed to add transaction");
    },
  });

  const filteredCategories = React.useMemo(() => {
    if (!categoriesFetched || !Array.isArray(categoriesFetched)) return [];
    return categoriesFetched.filter((cat) => cat.categoryType === form.type);
  }, [categoriesFetched, form.type]);

  const categoriesRef = useRef(null);

  useEffect(() => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollTop = 0;
    }
  }, [filteredCategories, form.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleDateTimeChange = (newValue) => {
    setForm((prev) => ({ ...prev, dateTime: dayjs(newValue).toISOString() }));
  };

  const handleTypeChange = (type) => {
    setForm({
      dateTime: dayjs().toISOString(),
      account: "Cash",
      category: "",
      note: "",
      type,
      amount: "",
    });
  };

  const categoryMutation = useMutation({
    mutationFn: async (categorydata) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categorydata),
        }
      );
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category added successfully");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      setOpenCategoryModal(false);
    },
    onError: () => {
      toast.error("Failed to add category");
    },
  });

  const handleAddCategory = () => {
    categoryMutation.mutate({
      name: newCategory.trim(),
      categoryType: newCategoryType,
    });
  };

  const isFormValid =
    form.dateTime && form.account && form.category && form.amount > 0;

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    const submitData = {
      date: form.dateTime,
      account: form.account,
      category: form.category,
      note: form.note || "",
      currency: "THB",
      type: form.type,
      amount: Number(form.amount),
    };
    mutation.mutate(submitData);
  };

  return (
    <Dialog
      open={true}
      onClose={() => setAddModalOpen(false)}
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
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          borderBottom: "1px solid #23272f",
          pb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: form.type === "Income"
                  ? "linear-gradient(135deg, #66bb6a, #43a047)"
                  : "linear-gradient(135deg, #ff9966, #ff5e62)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AddIcon sx={{ color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Add Transaction
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Record a new {form.type.toLowerCase()} transaction
              </Typography>
            </Box>
          </Stack>
          <IconButton
            size="small"
            onClick={() => setAddModalOpen(false)}
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Transaction Type Toggle */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                Transaction Type
              </Typography>
              <Stack direction="row" spacing={2}>
                <Paper
                  onClick={() => handleTypeChange("Income")}
                  sx={{
                    flex: 1,
                    p: 2,
                    border: form.type === "Income" ? "2px solid #43a047" : "1px solid #23272f",
                    borderRadius: 2,
                    bgcolor: form.type === "Income" ? "rgba(67, 160, 71, 0.1)" : "background.default",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    "&:hover": {
                      borderColor: "#43a047",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight={form.type === "Income" ? 700 : 600}
                    sx={{ color: form.type === "Income" ? "#43a047" : "text.primary" }}
                  >
                    Income
                  </Typography>
                </Paper>
                <Paper
                  onClick={() => handleTypeChange("Expense")}
                  sx={{
                    flex: 1,
                    p: 2,
                    border: form.type === "Expense" ? "2px solid #ff5e62" : "1px solid #23272f",
                    borderRadius: 2,
                    bgcolor: form.type === "Expense" ? "rgba(255, 94, 98, 0.1)" : "background.default",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    "&:hover": {
                      borderColor: "#ff5e62",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight={form.type === "Expense" ? 700 : 600}
                    sx={{ color: form.type === "Expense" ? "#ff5e62" : "text.primary" }}
                  >
                    Expense
                  </Typography>
                </Paper>
              </Stack>
            </Box>

            {/* Date & Time */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Date & Time"
                value={dayjs(form.dateTime)}
                onChange={handleDateTimeChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "background.default",
                      },
                      "& .MuiSvgIcon-root": { color: "#fff" },
                    },
                  },
                }}
              />
            </LocalizationProvider>

            {/* Account */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                Account
              </Typography>
              <RadioGroup
                row
                name="account"
                value={form.account}
                onChange={handleChange}
                sx={{ gap: 2 }}
              >
                {accountOptions.map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={
                      <Radio
                        sx={{
                          color: form.type === "Income" ? "#43a047" : "#ff5e62",
                        }}
                      />
                    }
                    label={option}
                  />
                ))}
              </RadioGroup>
            </Box>

            {/* Category */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" fontWeight={600}>
                  Category
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setOpenCategoryModal(true)}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    background: form.type === "Income" 
                      ? "rgba(67, 160, 71, 0.1)" 
                      : "rgba(255, 94, 98, 0.1)",
                    color: form.type === "Income" ? "#43a047" : "#ff5e62",
                    border: `1px solid ${form.type === "Income" ? "rgba(67, 160, 71, 0.3)" : "rgba(255, 94, 98, 0.3)"}`,
                    "&:hover": {
                      background: form.type === "Income" 
                        ? "rgba(67, 160, 71, 0.2)" 
                        : "rgba(255, 94, 98, 0.2)",
                      borderColor: form.type === "Income" ? "#43a047" : "#ff5e62",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Add Category
                </Button>
              </Stack>
              <Paper
                ref={categoriesRef}
                sx={{
                  p: 2,
                  maxHeight: 200,
                  overflowY: "auto",
                  bgcolor: "background.default",
                  border: "1px solid #23272f",
                  borderRadius: 2,
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-track": { background: "transparent" },
                  "&::-webkit-scrollbar-thumb": {
                    background: form.type === "Income" ? "rgba(67, 160, 71, 0.3)" : "rgba(255, 94, 98, 0.3)",
                    borderRadius: 3,
                  },
                }}
              >
                {isPending ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : filteredCategories.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
                    No categories found
                  </Typography>
                ) : (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {filteredCategories.map((option) => (
                      <Chip
                        key={option?._id}
                        label={option?.name}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            category: option?.name,
                          }))
                        }
                        sx={{
                          bgcolor: form.category === option?.name
                            ? (form.type === "Income" ? "#43a047" : "#ff5e62")
                            : "rgba(255,255,255,0.05)",
                          color: form.category === option?.name ? "#fff" : "text.primary",
                          border: form.category === option?.name
                            ? "none"
                            : `1px solid ${form.type === "Income" ? "rgba(67, 160, 71, 0.3)" : "rgba(255, 94, 98, 0.3)"}`,
                          fontWeight: form.category === option?.name ? 700 : 400,
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: form.category === option?.name
                              ? (form.type === "Income" ? "#388e3c" : "#ff3d47")
                              : "rgba(255,255,255,0.1)",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Paper>
            </Box>

            {/* Amount */}
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              fullWidth
              required
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
              }}
            />

            {/* Note */}
            <TextField
              label="Note (Optional)"
              name="note"
              value={form.note}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "background.default",
                },
              }}
            />
          </Stack>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button
          onClick={() => setAddModalOpen(false)}
          sx={{
            background: "linear-gradient(135deg, #757575, #9e9e9e)",
            color: "#fff",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
              background: "linear-gradient(135deg, #616161, #757575)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || mutation.isPending}
          sx={{
            background: form.type === "Income"
              ? "linear-gradient(135deg, #66bb6a, #43a047)"
              : "linear-gradient(135deg, #ff9966, #ff5e62)",
            color: "#fff",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
              background: form.type === "Income"
                ? "linear-gradient(135deg, #5cb860, #388e3c)"
                : "linear-gradient(135deg, #ff8a50, #ff3d47)",
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
            "Add Transaction"
          )}
        </Button>
      </DialogActions>

      {/* Add Category Dialog */}
      <Dialog
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
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
            borderBottom: "1px solid #23272f",
            pb: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #66bb6a, #43a047)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AddIcon sx={{ color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Add Category
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Create a new category
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              fullWidth
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "background.default",
                },
              }}
            />

            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                Category Type
              </Typography>
              <RadioGroup
                row
                value={newCategoryType}
                onChange={(e) => setNewCategoryType(e.target.value)}
                sx={{
                  gap: 2,
                  "& .MuiFormControlLabel-root": {
                    flex: 1,
                    m: 0,
                  },
                }}
              >
                <Paper
                  sx={{
                    flex: 1,
                    border: newCategoryType === "Income" ? "2px solid #43a047" : "1px solid #23272f",
                    borderRadius: 2,
                    bgcolor: newCategoryType === "Income" ? "rgba(67, 160, 71, 0.1)" : "background.default",
                    transition: "all 0.2s ease",
                  }}
                >
                  <FormControlLabel
                    value="Income"
                    control={<Radio sx={{ color: "#43a047" }} />}
                    label="Income"
                    sx={{ p: 1.5, width: "100%" }}
                  />
                </Paper>
                <Paper
                  sx={{
                    flex: 1,
                    border: newCategoryType === "Expense" ? "2px solid #ff5e62" : "1px solid #23272f",
                    borderRadius: 2,
                    bgcolor: newCategoryType === "Expense" ? "rgba(255, 94, 98, 0.1)" : "background.default",
                    transition: "all 0.2s ease",
                  }}
                >
                  <FormControlLabel
                    value="Expense"
                    control={<Radio sx={{ color: "#ff5e62" }} />}
                    label="Expense"
                    sx={{ p: 1.5, width: "100%" }}
                  />
                </Paper>
              </RadioGroup>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setOpenCategoryModal(false)}
            sx={{
              background: "linear-gradient(135deg, #757575, #9e9e9e)",
              color: "#fff",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #616161, #757575)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCategory}
            disabled={!newCategory.trim() || categoryMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #66bb6a, #43a047)",
              color: "#fff",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #5cb860, #388e3c)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #757575, #9e9e9e)",
                color: "#fff",
                opacity: 0.6,
              },
            }}
          >
            {categoryMutation.isPending ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Add Category"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AddTransaction;
