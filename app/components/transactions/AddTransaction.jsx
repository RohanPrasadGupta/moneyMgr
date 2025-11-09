import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  InputAdornment,
  Modal,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
  IconButton,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";
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
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1400,
        width: { xs: "90vw", sm: 500 },
        maxWidth: 500,
        outline: "none",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 4 },
          bgcolor: form.type === "Income" ? "#23272f" : "#1e1e1e",
          transition: "background 0.3s",
          position: "relative",
        }}
      >
        <Box sx={{ position: "absolute", top: 12, right: 12 }}>
          <IconButton
            aria-label="close"
            onClick={() => setAddModalOpen(false)}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.03)",
              color: "text.primary",
              boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
              borderRadius: 2,
              p: 0.6,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 3,
            mb: 3,
            mt: 2,
            p: 1,
            width: "100%",
            borderRadius: 3,
            background: "linear-gradient(145deg, #1e1e2f, #2a2a40)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
        >
          <Button
            variant="contained"
            onClick={() => handleTypeChange("Income")}
            sx={{
              fontWeight: 600,
              borderRadius: 3,
              minWidth: 140,
              py: 1.5,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              background:
                form.type === "Income"
                  ? "linear-gradient(135deg, #43a047, #66bb6a)"
                  : "transparent",
              border: "2px solid #43a047",
              color: form.type === "Income" ? "#fff" : "#43a047",
              boxShadow:
                form.type === "Income"
                  ? "0 4px 12px rgba(67, 160, 71, 0.5)"
                  : "inset 0 0 0 rgba(0,0,0,0)",
              "&:hover": {
                background:
                  form.type === "Income"
                    ? "linear-gradient(135deg, #388e3c, #43a047)"
                    : "rgba(67, 160, 71, 0.1)",
              },
            }}
          >
            Income
          </Button>

          <Button
            variant="contained"
            onClick={() => handleTypeChange("Expense")}
            sx={{
              fontWeight: 600,
              borderRadius: 3,
              minWidth: 140,
              py: 1.5,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              background:
                form.type === "Expense"
                  ? "linear-gradient(135deg, #ef5350, #e57373)"
                  : "transparent",
              border: "2px solid #ef5350",
              color: form.type === "Expense" ? "#fff" : "#ef5350",
              boxShadow:
                form.type === "Expense"
                  ? "0 4px 12px rgba(239, 83, 80, 0.5)"
                  : "inset 0 0 0 rgba(0,0,0,0)",
              "&:hover": {
                background:
                  form.type === "Expense"
                    ? "linear-gradient(135deg, #d32f2f, #ef5350)"
                    : "rgba(239, 83, 80, 0.1)",
              },
            }}
          >
            Expense
          </Button>
        </Stack>

        <Box
          noValidate
          autoComplete="off"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Grid component="form" container spacing={2} onSubmit={handleSubmit}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Date & Time"
                  value={dayjs(form.dateTime)}
                  onChange={handleDateTimeChange}
                  views={["year", "day", "hours", "minutes", "seconds"]}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} width="100%">
              <FormLabel
                component="legend"
                sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
              >
                Account
              </FormLabel>
              <RadioGroup
                row
                name="account"
                value={form.account}
                onChange={handleChange}
              >
                {accountOptions.map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={
                      <Radio
                        sx={{
                          color: form.type === "Income" ? "#43a047" : "#ef5350",
                        }}
                      />
                    }
                    label={option}
                    sx={{ color: "text.primary" }}
                  />
                ))}
              </RadioGroup>
            </Grid>
            <Grid item xs={12} width="100%">
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
                  height: { xs: "150px", sm: "220px" },
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
                      form.type === "Income"
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
                      form.type === "Income"
                        ? "linear-gradient(180deg, rgba(67,160,71,0.6), rgba(67,160,71,0.4))"
                        : "linear-gradient(180deg, rgba(239,83,80,0.6), rgba(239,83,80,0.4))",
                    transform: "scale(1.02)",
                  },
                  "&::-webkit-scrollbar-corner": { background: "transparent" },

                  scrollbarWidth: "thin",
                  scrollbarColor:
                    (form.type === "Income"
                      ? "rgba(67,160,71,0.35)"
                      : "rgba(239,83,80,0.35)") + " transparent",
                }}
              >
                {isPending ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      height: "100%",
                      pt: 1.5,
                    }}
                  >
                    <CircularProgress size={28} />
                  </Box>
                ) : filteredCategories.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      textAlign: "center",
                      width: "100%",
                    }}
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
                          form.category === option?.name
                            ? "contained"
                            : "outlined"
                        }
                        color={form.type === "Income" ? "success" : "error"}
                        sx={{
                          mb: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          background:
                            form.category === option?.name
                              ? form.type === "Income"
                                ? "#43a047"
                                : "#ef5350"
                              : undefined,
                          color:
                            form.category === option?.name
                              ? "#fff"
                              : form.type === "Income"
                              ? "#43a047"
                              : "#ef5350",
                          boxShadow: "none",
                          backgroundImage: "none",
                        }}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            category: option?.name,
                          }))
                        }
                      >
                        {option?.name}
                      </Button>
                    ))}

                    <Button
                      variant="outlined"
                      color="info"
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        minWidth: 40,
                        px: 1,
                        backgroundImage: "none",
                      }}
                      onClick={() => setOpenCategoryModal(true)}
                      startIcon={<AddCircleOutlineIcon />}
                    >
                      Add Category
                    </Button>
                  </Stack>
                )}
              </Box>
            </Grid>
            <Grid item width="100%">
              <TextField
                label="Note"
                name="note"
                value={form.note}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item width="100%">
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
                    <InputAdornment position="start">
                      <AttachMoneyIcon color="success" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item width="100%">
              <Button
                type="submit"
                variant="contained"
                color={form.type === "Income" ? "success" : "error"}
                fullWidth
                sx={{ mt: 2 }}
                disabled={!isFormValid}
              >
                Add Transaction
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Modal
          open={openCategoryModal}
          onClose={() => setOpenCategoryModal(false)}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              minWidth: 300,
            }}
          >
            <Typography variant="h6" mb={2}>
              Add New Category
            </Typography>
            <TextField
              label="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              fullWidth
              autoFocus
            />
            <FormLabel component="legend" sx={{ mt: 2, mb: 1 }}>
              Category Type
            </FormLabel>
            <RadioGroup
              row
              value={newCategoryType}
              onChange={(e) => setNewCategoryType(e.target.value)}
            >
              <FormControlLabel
                value="Income"
                control={<Radio color="success" />}
                label="Income"
              />
              <FormControlLabel
                value="Expense"
                control={<Radio color="error" />}
                label="Expense"
              />
            </RadioGroup>
            <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setOpenCategoryModal(false)}
                sx={{
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
                variant="contained"
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                sx={{
                  background: "#137fd1",
                  color: "#ffffff",
                  boxShadow: "none",
                  backgroundImage: "none",
                  "&:hover": { background: "#0f6fbf" },
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Paper>
    </Box>
  );
};

export default AddTransaction;
