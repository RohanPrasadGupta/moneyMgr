"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Chip,
  FormHelperText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PaymentsIcon from "@mui/icons-material/Payments";
import NotesIcon from "@mui/icons-material/Notes";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCategoryQuery } from "../../services/useCategoryServices";
import {
  dialogPaperSx,
  dialogActionsSx,
  cancelButtonSx,
  successButtonSx,
  dangerButtonSx,
  colors,
  insetPanelSx,
} from "../../themeStyles";
import {
  InvestmentDialogHeader,
  InvestmentFormDialog,
  accentFieldSx,
} from "../investmentsComp/InvestmentFormUi";

const accountOptions = ["Cash", "Online"];

const getDefaultForm = (type = "Expense") => ({
  dateTime: dayjs().toISOString(),
  account: "Cash",
  category: "",
  note: "",
  type,
  amount: "",
});

const FormSection = ({ title, subtitle, children }) => (
  <Box>
    <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        {subtitle}
      </Typography>
    )}
    {!subtitle && <Box sx={{ mb: 2 }} />}
    {children}
  </Box>
);

const TransactionTypeSelector = ({ value, onChange }) => (
  <Stack direction="row" spacing={2}>
    {[
      { type: "Income", icon: TrendingUpIcon, accent: colors.success, hint: "Money in" },
      { type: "Expense", icon: TrendingDownIcon, accent: colors.error, hint: "Money out" },
    ].map(({ type, icon: Icon, accent, hint }) => {
      const selected = value === type;
      return (
        <Paper
          key={type}
          elevation={0}
          onClick={() => onChange(type)}
          sx={{
            flex: 1,
            p: 2,
            border: "2px solid",
            borderColor: selected ? accent : "divider",
            borderRadius: 2,
            bgcolor: selected ? alpha(accent, 0.1) : "background.default",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: selected ? accent : alpha(accent, 0.5),
              transform: "translateY(-2px)",
              bgcolor: alpha(accent, selected ? 0.12 : 0.05),
            },
          }}
        >
          <Icon sx={{ fontSize: 28, color: accent, mb: 0.5 }} />
          <Typography variant="body1" fontWeight={selected ? 800 : 600} sx={{ color: selected ? accent : "text.primary" }}>
            {type}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {hint}
          </Typography>
        </Paper>
      );
    })}
  </Stack>
);

const CategoryTypeSelector = ({ value, onChange }) => (
  <RadioGroup row value={value} onChange={onChange} sx={{ gap: 2, "& .MuiFormControlLabel-root": { flex: 1, m: 0 } }}>
    {[
      { type: "Income", accent: colors.success },
      { type: "Expense", accent: colors.error },
    ].map(({ type, accent }) => {
      const selected = value === type;
      return (
        <Paper
          key={type}
          elevation={0}
          sx={{
            flex: 1,
            border: "2px solid",
            borderColor: selected ? accent : "divider",
            borderRadius: 2,
            bgcolor: selected ? alpha(accent, 0.1) : "background.default",
            cursor: "pointer",
          }}
          onClick={() => onChange({ target: { value: type } })}
        >
          <FormControlLabel
            value={type}
            control={<Radio sx={{ color: accent, "&.Mui-checked": { color: accent } }} />}
            label={<Typography fontWeight={700}>{type}</Typography>}
            sx={{ p: 1.5, width: "100%", m: 0 }}
          />
        </Paper>
      );
    })}
  </RadioGroup>
);

const AddTransaction = ({ open = true, setAddModalOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState(getDefaultForm);
  const [errors, setErrors] = useState({ amount: "", category: "" });
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("Expense");
  const queryClient = useQueryClient();

  const { isPending, data: categoriesFetched, refetch } = useCategoryQuery();

  const isIncome = form.type === "Income";
  const accentKey = isIncome ? "success" : "error";
  const accentColor = isIncome ? colors.success : colors.error;
  const headerVariant = isIncome ? "sip" : "stock";

  const handleClose = () => {
    setForm(getDefaultForm());
    setErrors({ amount: "", category: "" });
    setAddModalOpen(false);
  };

  const mutation = useMutation({
    mutationFn: async (submitData) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      return res.json();
    },
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries({ queryKey: ["getMonthlyTransactions"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("transactions:changed"));
      }
      toast.success("Transaction added successfully");
    },
    onError: () => {
      toast.error("Failed to add transaction");
    },
  });

  const filteredCategories = useMemo(() => {
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
    if (name === "amount") setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const handleDateTimeChange = (newValue) => {
    if (newValue) {
      setForm((prev) => ({ ...prev, dateTime: dayjs(newValue).toISOString() }));
    }
  };

  const handleTypeChange = (type) => {
    setForm(getDefaultForm(type));
    setErrors({ amount: "", category: "" });
  };

  const categoryMutation = useMutation({
    mutationFn: async (categorydata) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categorydata),
      });
      return res.json();
    },
    onSuccess: async () => {
      toast.success("Category added successfully");
      await queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      refetch();
      setOpenCategoryModal(false);
      setNewCategory("");
    },
    onError: () => {
      toast.error("Failed to add category");
    },
  });

  const handleOpenCategoryModal = () => {
    setNewCategoryType(form.type);
    setNewCategory("");
    setOpenCategoryModal(true);
  };

  const handleAddCategory = (e) => {
    e?.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    categoryMutation.mutate({ name: trimmed, categoryType: newCategoryType });
  };

  const isFormValid =
    form.dateTime && form.account && form.category && Number(form.amount) > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = { amount: "", category: "" };
    let hasError = false;
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
      hasError = true;
    }
    if (!form.category) {
      newErrors.category = "Please select a category";
      hasError = true;
    }
    if (hasError) {
      setErrors(newErrors);
      return;
    }
    mutation.mutate({
      date: form.dateTime,
      account: form.account,
      category: form.category,
      note: form.note || "",
      currency: "THB",
      type: form.type,
      amount: Number(form.amount),
    });
  };

  const fieldSx = accentFieldSx(accentKey);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            ...dialogPaperSx,
            borderRadius: isMobile ? 0 : dialogPaperSx.borderRadius,
          },
        }}
      >
        <InvestmentDialogHeader
          title="Add Transaction"
          subtitle={`Record a new ${form.type.toLowerCase()} in THB`}
          icon={AddIcon}
          onClose={handleClose}
          variant={headerVariant}
        />

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
          <Box component="form" id="add-transaction-form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
                <FormSection title="Transaction type" subtitle="Switching type clears amount and category">
                  <TransactionTypeSelector value={form.type} onChange={handleTypeChange} />
                </FormSection>
              </Paper>

              <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
                <FormSection title="When & how much" subtitle="Date, account, and amount in baht">
                  <Stack spacing={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label="Date & time"
                        value={dayjs(form.dateTime)}
                        onChange={handleDateTimeChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: {
                              ...fieldSx,
                              "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: accentColor },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>

                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 1, display: "block" }}>
                        Account
                      </Typography>
                      <Stack direction="row" spacing={1.5}>
                        {accountOptions.map((option) => {
                          const selected = form.account === option;
                          return (
                            <Chip
                              key={option}
                              icon={<AccountBalanceWalletIcon sx={{ fontSize: "18px !important" }} />}
                              label={option}
                              onClick={() => setForm((prev) => ({ ...prev, account: option }))}
                              sx={{
                                flex: 1,
                                py: 2.5,
                                height: "auto",
                                fontWeight: 700,
                                borderRadius: 2,
                                bgcolor: selected ? alpha(accentColor, 0.2) : "transparent",
                                color: selected ? accentColor : "text.primary",
                                border: "2px solid",
                                borderColor: selected ? accentColor : "divider",
                                "& .MuiChip-icon": { color: selected ? accentColor : "text.secondary" },
                                "&:hover": {
                                  bgcolor: alpha(accentColor, 0.12),
                                  borderColor: accentColor,
                                },
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>

                    <Box>
                    <TextField
                      label="Amount"
                      name="amount"
                      type="number"
                      inputProps={{ min: 0, step: "any" }}
                      value={form.amount}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={Boolean(errors.amount)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PaymentsIcon sx={{ fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary" }}>
                              THB
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    {errors.amount && (
                      <FormHelperText error sx={{ mx: 1.5 }}>{errors.amount}</FormHelperText>
                    )}
                    </Box>
                  </Stack>
                </FormSection>
              </Paper>

              <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2} gap={1}>
                  <Box>
                    <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}>
                      Category
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                      Tap a label for this {form.type.toLowerCase()}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleOpenCategoryModal}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      flexShrink: 0,
                      color: accentColor,
                      border: `1px solid ${alpha(accentColor, 0.4)}`,
                      bgcolor: alpha(accentColor, 0.08),
                      "&:hover": {
                        bgcolor: alpha(accentColor, 0.15),
                        borderColor: accentColor,
                      },
                    }}
                  >
                    New
                  </Button>
                </Stack>
                <Paper
                  ref={categoriesRef}
                  elevation={0}
                  sx={{
                    p: 2,
                    maxHeight: 200,
                    overflowY: "auto",
                    bgcolor: alpha(accentColor, 0.04),
                    border: `1px solid ${alpha(accentColor, 0.25)}`,
                    borderRadius: 2,
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-thumb": {
                      background: alpha(accentColor, 0.35),
                      borderRadius: 3,
                    },
                  }}
                >
                  {isPending ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                      <CircularProgress size={28} sx={{ color: accentColor }} />
                    </Box>
                  ) : filteredCategories.length === 0 ? (
                    <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                      No {form.type.toLowerCase()} categories yet. Create one with New.
                    </Typography>
                  ) : (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {filteredCategories.map((option) => {
                        const selected = form.category === option?.name;
                        return (
                          <Chip
                            key={option?._id}
                            label={option?.name}
                            onClick={() => { setForm((prev) => ({ ...prev, category: option?.name })); setErrors((prev) => ({ ...prev, category: "" })); }}
                            sx={{
                              fontWeight: selected ? 700 : 500,
                              cursor: "pointer",
                              bgcolor: selected ? accentColor : alpha(accentColor, 0.08),
                              color: selected ? "common.white" : "text.primary",
                              border: `1px solid ${alpha(accentColor, selected ? 1 : 0.35)}`,
                              "&:hover": {
                                bgcolor: selected ? accentColor : alpha(accentColor, 0.18),
                              },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  )}
                </Paper>
                {errors.category && (
                  <FormHelperText error sx={{ mx: 1, mt: 0.5 }}>{errors.category}</FormHelperText>
                )}
              </Paper>

              <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
                <FormSection title="Note" subtitle="Optional — memo, place, or reference">
                  <TextField
                    label="Note"
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="e.g. Lunch with team, monthly rent"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                          <NotesIcon sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </FormSection>
              </Paper>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ ...dialogActionsSx, justifyContent: "flex-end", gap: 1.5 }}>
          <Button onClick={handleClose} sx={{ ...cancelButtonSx, width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-transaction-form"
            disabled={!isFormValid || mutation.isPending}
            sx={{
              ...(isIncome ? successButtonSx : dangerButtonSx),
              width: { xs: "100%", sm: "auto" },
              minWidth: 150,
            }}
          >
            {mutation.isPending ? (
              <CircularProgress size={22} sx={{ color: "common.white" }} />
            ) : (
              "Add Transaction"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <InvestmentFormDialog
        open={openCategoryModal}
        onClose={() => {
          setOpenCategoryModal(false);
          setNewCategory("");
        }}
        title="Quick Add Category"
        subtitle="Available immediately in this form"
        icon={LabelOutlinedIcon}
        headerVariant="primary"
        formId="quick-category-form"
        submitLabel="Add Category"
        isPending={categoryMutation.isPending}
        submitDisabled={!newCategory.trim()}
        submitVariant="success"
        fullScreen={isMobile}
      >
        <Box component="form" id="quick-category-form" onSubmit={handleAddCategory}>
          <Stack spacing={3}>
            <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
              <TextField
                label="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                fullWidth
                autoFocus
                required
                sx={accentFieldSx("primary")}
              />
            </Paper>
            <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}>
                Type
              </Typography>
              <Box sx={{ mt: 2 }}>
                <CategoryTypeSelector
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value)}
                />
              </Box>
            </Paper>
          </Stack>
        </Box>
      </InvestmentFormDialog>
    </>
  );
};

export default AddTransaction;
