"use client";

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Badge,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import PaymentsIcon from "@mui/icons-material/Payments";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AbcIcon from "@mui/icons-material/Abc";
import { useCategoryQuery } from "../../services/useCategoryServices";
import { useCurrencyQuery, getCurrencyMenuOptions } from "../../services/useCurrencyServices";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  themedCardSx,
  gradients,
  navbarRadialBg,
  colors,
  textFieldOutlinedSx,
  insetPanelSx,
  primaryButtonSx,
  currencyBadgeSx,
} from "../../themeStyles";
import {
  InvestmentFormDialog,
  InvestmentDeleteDialog,
  InvestmentDialogHeader,
  accentFieldSx,
} from "../investmentsComp/InvestmentFormUi";

const CategoryTypeSelector = ({ value, onChange }) => (
  <Box>
    <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}>
      Category type
    </Typography>
    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
      Choose whether this label is used for money in or money out
    </Typography>
    <RadioGroup
      row
      value={value}
      onChange={onChange}
      sx={{
        gap: 2,
        "& .MuiFormControlLabel-root": { flex: 1, m: 0 },
      }}
    >
      {[
        {
          type: "Income",
          icon: TrendingUpIcon,
          accent: colors.success,
          label: "Income",
          hint: "Salary, refunds, etc.",
        },
        {
          type: "Expense",
          icon: TrendingDownIcon,
          accent: colors.error,
          label: "Expense",
          hint: "Bills, shopping, etc.",
        },
      ].map(({ type, icon: Icon, accent, label, hint }) => {
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
              transition: "all 0.2s ease",
              cursor: "pointer",
              "&:hover": {
                borderColor: selected ? accent : alpha(accent, 0.5),
                bgcolor: alpha(accent, selected ? 0.12 : 0.05),
              },
            }}
            onClick={() => onChange({ target: { value: type } })}
          >
            <FormControlLabel
              value={type}
              control={<Radio sx={{ color: accent, "&.Mui-checked": { color: accent } }} />}
              label={
                <Stack spacing={0.25}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Icon sx={{ fontSize: 20, color: accent }} />
                    <Typography fontWeight={700}>{label}</Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {hint}
                  </Typography>
                </Stack>
              }
              sx={{ p: 1.5, width: "100%", m: 0 }}
            />
          </Paper>
        );
      })}
    </RadioGroup>
  </Box>
);

const CategoryFormFields = ({
  name,
  onNameChange,
  categoryType,
  onTypeChange,
  currency,
  onCurrencyChange,
  currencies = [],
  accent = "primary",
}) => (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}>
          Details
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Name your category so you can pick it when adding transactions
        </Typography>
        <TextField
          label="Category name"
          placeholder="e.g. Groceries, Salary, Rent"
          fullWidth
          value={name}
          onChange={onNameChange}
          autoFocus
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LabelOutlinedIcon sx={{ fontSize: 20, color: colors.primary }} />
              </InputAdornment>
            ),
          }}
          sx={accentFieldSx(accent)}
        />
        <TextField
          select
          label="Currency"
          fullWidth
          value={currency}
          onChange={onCurrencyChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PaymentsIcon sx={{ fontSize: 20, color: colors.primary }} />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 2.5, ...accentFieldSx(accent) }}
        >
          {getCurrencyMenuOptions(currencies, currency).map((c) => (
            <MenuItem key={c.code} value={c.code}>
              {c.code} — {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Paper>
      <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
        <CategoryTypeSelector value={categoryType} onChange={onTypeChange} />
      </Paper>
    </Stack>
);

const CurrencyFormFields = ({
  code,
  onCodeChange,
  name,
  onNameChange,
  symbol,
  onSymbolChange,
  isDefault,
  onIsDefaultChange,
  accent = "primary",
}) => (
  <Stack spacing={3}>
    <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}>
        Currency details
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        Add a currency once and it becomes available for categories, transactions, and investments
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Code"
          placeholder="e.g. USD"
          fullWidth
          value={code}
          onChange={onCodeChange}
          autoFocus
          required
          inputProps={{ maxLength: 6, style: { textTransform: "uppercase" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AbcIcon sx={{ fontSize: 20, color: colors.primary }} />
              </InputAdornment>
            ),
          }}
          sx={accentFieldSx(accent)}
        />
        <TextField
          label="Name"
          placeholder="e.g. US Dollar"
          fullWidth
          value={name}
          onChange={onNameChange}
          required
          sx={accentFieldSx(accent)}
        />
        <TextField
          label="Symbol"
          placeholder="e.g. $"
          fullWidth
          value={symbol}
          onChange={onSymbolChange}
          required
          sx={accentFieldSx(accent)}
        />
      </Stack>
    </Paper>
    <Paper
      elevation={0}
      sx={{
        ...insetPanelSx,
        p: { xs: 2, sm: 2.5 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="body2" fontWeight={700}>
          Set as default currency
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Used as the fallback wherever a currency isn't set
        </Typography>
      </Box>
      <Switch checked={isDefault} onChange={onIsDefaultChange} color="primary" />
    </Paper>
  </Stack>
);

const CurrencyManagerDialog = ({ open, onClose, currencies = [], isPending, onAdd, onEdit, onDelete, fullScreen = false }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    fullScreen={fullScreen}
    PaperProps={{
      sx: {
        borderRadius: fullScreen ? 0 : 3,
        bgcolor: "background.paper",
        border: fullScreen ? "none" : "1px solid",
        borderColor: "divider",
      },
    }}
  >
    <InvestmentDialogHeader
      title="Manage Currencies"
      subtitle="Add, edit, or remove the currencies available across the app"
      icon={MonetizationOnIcon}
      onClose={onClose}
      variant="primary"
    />
    <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onAdd}
        fullWidth
        sx={{
          textTransform: "none",
          fontWeight: 700,
          borderColor: alpha(colors.primary, 0.4),
          color: colors.primary,
          mb: 2.5,
          py: 1.1,
          "&:hover": { borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.08) },
        }}
      >
        Add Currency
      </Button>

      {isPending ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} sx={{ color: colors.primary }} />
        </Box>
      ) : currencies.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 3 }}>
          No currencies yet. Add your first one above.
        </Typography>
      ) : (
        <Stack spacing={1.25}>
          {currencies.map((c) => (
            <Paper
              key={c._id}
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" flex={1} minWidth={0}>
                <Chip
                  label={c.code}
                  size="small"
                  sx={{ fontWeight: 700, flexShrink: 0, ...currencyBadgeSx(c.code) }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {c.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Symbol: {c.symbol || "—"}
                    {c.isDefault ? " • Default" : ""}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={0.5} flexShrink={0} ml={1}>
                <IconButton
                  size="small"
                  onClick={() => onEdit(c)}
                  sx={{
                    color: colors.primary,
                    bgcolor: alpha(colors.primary, 0.1),
                    border: `1px solid ${alpha(colors.primary, 0.3)}`,
                    "&:hover": { bgcolor: alpha(colors.primary, 0.2) },
                  }}
                  aria-label={`edit ${c.name}`}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(c)}
                  sx={{
                    color: colors.error,
                    bgcolor: alpha(colors.error, 0.1),
                    border: `1px solid ${alpha(colors.error, 0.3)}`,
                    "&:hover": { bgcolor: alpha(colors.error, 0.2) },
                  }}
                  aria-label={`delete ${c.name}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </DialogContent>
  </Dialog>
);

const CategoryFilterCard = ({ active, onClick, icon: Icon, label, count, color }) => (
  <Paper
    onClick={onClick}
    elevation={0}
    sx={{
      cursor: "pointer",
      flex: { xs: "0 0 130px", sm: 1 },
      p: { xs: 1.5, sm: 1.75 },
      borderRadius: 2.5,
      bgcolor: active ? alpha(color, 0.14) : alpha(color, 0.05),
      border: "1px solid",
      borderColor: active ? color : alpha(color, 0.25),
      boxShadow: active ? `0 4px 14px ${alpha(color, 0.3)}` : "none",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.2s ease",
      "&:hover": { borderColor: color, transform: "translateY(-1px)" },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: color,
        opacity: active ? 1 : 0.35,
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={0.75} mb={0.5}>
      <Icon sx={{ fontSize: { xs: 15, sm: 17 }, color }} />
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.3, fontSize: { xs: "0.65rem", sm: "0.7rem" } }}
      >
        {label.toUpperCase()}
      </Typography>
    </Stack>
    <Typography variant="h6" fontWeight={800} sx={{ color, fontSize: { xs: "1rem", sm: "1.15rem" } }}>
      {count}
    </Typography>
  </Paper>
);

const CategoryListItem = ({ category: c, onEdit, onDelete, isPending }) => {
  const isIncome = c.categoryType === "Income";
  const accent = isIncome ? colors.success : colors.error;

  return (
    <Paper
      elevation={0}
      sx={{
        ...themedCardSx,
        p: { xs: 1.5, sm: 1.75 },
        borderRadius: 2.5,
        border: `1px solid ${alpha(accent, 0.3)}`,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        opacity: isPending ? 0.55 : 1,
        pointerEvents: isPending ? "none" : "auto",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 18px ${alpha(accent, 0.2)}`,
          borderColor: accent,
        },
      }}
    >
      <Badge
        badgeContent={c.currency || "THB"}
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          "& .MuiBadge-badge": {
            ...currencyBadgeSx(c.currency || "THB"),
            fontSize: "0.58rem",
            height: 16,
            minWidth: 26,
            px: 0.5,
            borderRadius: "7px",
            border: "1.5px solid",
            borderColor: "background.paper",
          },
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: { xs: 38, sm: 42 },
            height: { xs: 38, sm: 42 },
            borderRadius: "50%",
            bgcolor: alpha(accent, 0.12),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isIncome ? (
            <TrendingUpIcon sx={{ color: accent, fontSize: 20 }} />
          ) : (
            <TrendingDownIcon sx={{ color: accent, fontSize: 20 }} />
          )}
        </Box>
      </Badge>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          fontWeight={700}
          sx={{
            color: "text.primary",
            fontSize: { xs: "0.9rem", sm: "0.95rem" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {c.name}
        </Typography>
        <Chip
          label={c.categoryType}
          size="small"
          sx={{
            mt: 0.5,
            height: 18,
            fontSize: "0.62rem",
            fontWeight: 700,
            bgcolor: alpha(accent, 0.12),
            color: accent,
            border: `1px solid ${alpha(accent, 0.3)}`,
          }}
        />
      </Box>

      {isPending ? (
        <CircularProgress size={20} sx={{ color: accent, flexShrink: 0 }} />
      ) : (
        <Stack direction="row" spacing={0.5} flexShrink={0}>
          <IconButton
            size="small"
            onClick={() => onEdit(c)}
            sx={{
              color: colors.primary,
              bgcolor: alpha(colors.primary, 0.1),
              border: `1px solid ${alpha(colors.primary, 0.3)}`,
              "&:hover": { bgcolor: alpha(colors.primary, 0.2), transform: "scale(1.05)" },
              transition: "all 0.2s ease",
            }}
            aria-label={`edit ${c.name}`}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(c)}
            sx={{
              color: colors.error,
              bgcolor: alpha(colors.error, 0.1),
              border: `1px solid ${alpha(colors.error, 0.3)}`,
              "&:hover": { bgcolor: alpha(colors.error, 0.2), transform: "scale(1.05)" },
              transition: "all 0.2s ease",
            }}
            aria-label={`delete ${c.name}`}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}
    </Paper>
  );
};

const CategoryPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    isPending,
    isError,
    data: categoriesFetched = [],
  } = useCategoryQuery();
  const { data: currenciesFetched = [], isPending: isCurrenciesPending } = useCurrencyQuery();

  const queryClient = useQueryClient();
  const [openCategoryModal, setOpenCategoryModal] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newCategoryType, setNewCategoryType] = React.useState("Expense");
  const [newCategoryCurrency, setNewCategoryCurrency] = React.useState("THB");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");

  const resetAddForm = () => {
    setNewCategoryName("");
    setNewCategoryType("Expense");
    setNewCategoryCurrency("THB");
  };

  const handleCloseAddModal = () => {
    setOpenCategoryModal(false);
    resetAddForm();
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
    onSuccess: () => {
      toast.success("Category added successfully");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      handleCloseAddModal();
    },
    onError: () => {
      toast.error("Failed to add category");
    },
  });

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState(null);
  const [editCategoryName, setEditCategoryName] = React.useState("");
  const [editCategoryType, setEditCategoryType] = React.useState("Expense");
  const [editCategoryCurrency, setEditCategoryCurrency] = React.useState("THB");

  const handleEditRequest = (category) => {
    setEditTarget(category);
    setEditCategoryName(category.name || "");
    setEditCategoryType(category.categoryType || "Expense");
    setEditCategoryCurrency(category.currency || "THB");
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditTarget(null);
  };

  const editCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categorydata }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categorydata),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      handleCloseEditModal();
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);

  const handleDeleteRequest = (category) => {
    setDeleteTarget(category);
    setDeleteModalOpen(true);
  };

  const categoryDeleteMutation = useMutation({
    mutationFn: async (categoryId) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const [manageCurrenciesOpen, setManageCurrenciesOpen] = React.useState(false);
  const [currencyFormOpen, setCurrencyFormOpen] = React.useState(false);
  const [editingCurrencyTarget, setEditingCurrencyTarget] = React.useState(null);
  const [currencyCode, setCurrencyCode] = React.useState("");
  const [currencyName, setCurrencyName] = React.useState("");
  const [currencySymbol, setCurrencySymbol] = React.useState("");
  const [currencyIsDefault, setCurrencyIsDefault] = React.useState(false);
  const [currencyDeleteOpen, setCurrencyDeleteOpen] = React.useState(false);
  const [currencyDeleteTarget, setCurrencyDeleteTarget] = React.useState(null);

  const resetCurrencyForm = () => {
    setCurrencyCode("");
    setCurrencyName("");
    setCurrencySymbol("");
    setCurrencyIsDefault(false);
  };

  const handleOpenAddCurrency = () => {
    setEditingCurrencyTarget(null);
    resetCurrencyForm();
    setCurrencyFormOpen(true);
  };

  const handleOpenEditCurrency = (currency) => {
    setEditingCurrencyTarget(currency);
    setCurrencyCode(currency.code || "");
    setCurrencyName(currency.name || "");
    setCurrencySymbol(currency.symbol || "");
    setCurrencyIsDefault(Boolean(currency.isDefault));
    setCurrencyFormOpen(true);
  };

  const handleCloseCurrencyForm = () => {
    setCurrencyFormOpen(false);
    setEditingCurrencyTarget(null);
    resetCurrencyForm();
  };

  const handleDeleteCurrencyRequest = (currency) => {
    setCurrencyDeleteTarget(currency);
    setCurrencyDeleteOpen(true);
  };

  const createCurrencyMutation = useMutation({
    mutationFn: async (currencyData) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/currency`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currencyData),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Currency added successfully");
      queryClient.invalidateQueries({ queryKey: ["getCurrencies"] });
      handleCloseCurrencyForm();
    },
    onError: () => {
      toast.error("Failed to add currency");
    },
  });

  const editCurrencyMutation = useMutation({
    mutationFn: async ({ id, ...currencyData }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/currency/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currencyData),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Currency updated successfully");
      queryClient.invalidateQueries({ queryKey: ["getCurrencies"] });
      handleCloseCurrencyForm();
    },
    onError: () => {
      toast.error("Failed to update currency");
    },
  });

  const deleteCurrencyMutation = useMutation({
    mutationFn: async (currencyId) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/currency/${currencyId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Currency deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["getCurrencies"] });
      setCurrencyDeleteOpen(false);
      setCurrencyDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete currency");
    },
  });

  const handleCurrencyFormSubmit = (e) => {
    e.preventDefault();
    const trimmedCode = currencyCode.trim().toUpperCase();
    const trimmedName = currencyName.trim();
    const trimmedSymbol = currencySymbol.trim();
    if (!trimmedCode || !trimmedName || !trimmedSymbol) return;
    const payload = {
      code: trimmedCode,
      name: trimmedName,
      symbol: trimmedSymbol,
      isDefault: currencyIsDefault,
    };
    if (editingCurrencyTarget?._id) {
      editCurrencyMutation.mutate({ id: editingCurrencyTarget._id, ...payload });
    } else {
      createCurrencyMutation.mutate(payload);
    }
  };

  const handleDeleteCurrencyConfirm = () => {
    if (currencyDeleteTarget?._id) {
      deleteCurrencyMutation.mutate(currencyDeleteTarget._id);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    categoryMutation.mutate({
      name: trimmed,
      categoryType: newCategoryType,
      currency: newCategoryCurrency,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const trimmed = editCategoryName.trim();
    if (!trimmed || !editTarget?._id) return;
    editCategoryMutation.mutate({
      id: editTarget._id,
      name: trimmed,
      categoryType: editCategoryType,
      currency: editCategoryCurrency,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget?._id) {
      categoryDeleteMutation.mutate(deleteTarget._id);
    }
  };

  const incomeCats = (categoriesFetched || []).filter((c) => c.categoryType === "Income");
  const expenseCats = (categoriesFetched || []).filter((c) => c.categoryType === "Expense");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const totalCategories = incomeCats.length + expenseCats.length;

  const visibleCategories = (categoriesFetched || [])
    .filter((c) => typeFilter === "all" || c.categoryType === (typeFilter === "income" ? "Income" : "Expense"))
    .filter((c) => c.name?.toLowerCase().includes(normalizedQuery));

  const getRowPending = (categoryId) =>
    (categoryDeleteMutation.isPending && deleteTarget?._id === categoryId) ||
    (editCategoryMutation.isPending && editTarget?._id === categoryId);

  return (
    <Box
      sx={{
        ...themedCardSx,
        width: "100%",
        mx: "auto",
        mt: { xs: 1, sm: 3 },
        p: { xs: 2, sm: 3 },
        borderRadius: { xs: 0, sm: 3 },
        minHeight: { xs: 300, sm: 400 },
        backgroundImage: navbarRadialBg,
      }}
    >
      <Box sx={{ mb: { xs: 2.5, sm: 3 }, pb: { xs: 2, sm: 2.5 }, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          sx={{ mb: { xs: 2, sm: 2.5 } }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                background: gradients.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 6px 16px ${alpha(colors.primary, 0.35)}`,
                flexShrink: 0,
              }}
            >
              <CategoryIcon sx={{ color: "common.white", fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: gradients.primary,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.2,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" },
                }}
              >
                Categories
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                Organize transactions with custom income and expense labels
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Button
              variant="outlined"
              startIcon={<MonetizationOnIcon />}
              onClick={() => setManageCurrenciesOpen(true)}
              sx={{
                py: 1.2,
                px: 2.5,
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                borderColor: alpha(colors.primary, 0.4),
                color: colors.primary,
                width: { xs: "100%", sm: "auto" },
                "&:hover": { borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.08) },
              }}
            >
              Manage Currencies
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCategoryModal(true)}
              sx={{
                ...primaryButtonSx,
                borderRadius: "999px",
                py: 1.2,
                px: 3,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Add Category
            </Button>
          </Stack>
        </Stack>

        {/* Filter / stat strip */}
        <Stack
          direction="row"
          spacing={{ xs: 1.25, sm: 1.5 }}
          sx={{
            mb: 2,
            overflowX: { xs: "auto", sm: "visible" },
            pb: { xs: 0.5, sm: 0 },
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <CategoryFilterCard
            active={typeFilter === "all"}
            onClick={() => setTypeFilter("all")}
            icon={CategoryIcon}
            label="Total"
            count={totalCategories}
            color={colors.primary}
          />
          <CategoryFilterCard
            active={typeFilter === "income"}
            onClick={() => setTypeFilter("income")}
            icon={TrendingUpIcon}
            label="Income"
            count={incomeCats.length}
            color={colors.success}
          />
          <CategoryFilterCard
            active={typeFilter === "expense"}
            onClick={() => setTypeFilter("expense")}
            icon={TrendingDownIcon}
            label="Expense"
            count={expenseCats.length}
            color={colors.error}
          />
        </Stack>

        <TextField
          fullWidth
          size="small"
          placeholder="Search categories by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            maxWidth: isMobile ? "100%" : 440,
            ...textFieldOutlinedSx,
            "& .MuiOutlinedInput-root": {
              ...(textFieldOutlinedSx["& .MuiOutlinedInput-root"] || {}),
              borderRadius: "999px",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {isPending ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            gap: 2,
          }}
        >
          <CircularProgress size={48} sx={{ color: colors.primary }} />
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Loading categories...
          </Typography>
        </Box>
      ) : isError ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: alpha(colors.error, 0.1),
            border: `1px solid ${alpha(colors.error, 0.35)}`,
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: colors.error, fontWeight: 600 }}>
            Failed to load categories
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Please try refreshing the page
          </Typography>
        </Paper>
      ) : visibleCategories.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: gradients.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.35,
            }}
          >
            <LocalOfferIcon sx={{ fontSize: 40, color: "common.white" }} />
          </Box>
          <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>
            No Categories Found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", maxWidth: 300 }}>
            {normalizedQuery
              ? `No categories match "${searchQuery}"`
              : "Add your first category to get started"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {visibleCategories.map((c) => (
            <Grid item key={c._id} xs={12} sm={6} md={4}>
              <CategoryListItem
                category={c}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
                isPending={getRowPending(c._id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <InvestmentDeleteDialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        title="Delete Category"
        subtitle="This action cannot be undone"
        message="Removing this category will unlink it from future transaction picks. Existing transactions may still reference it."
        icon={DeleteIcon}
        headerVariant="stock"
        onConfirm={handleDeleteConfirm}
        isPending={categoryDeleteMutation.isPending}
        fullScreen={isMobile}
        rows={
          deleteTarget
            ? [
                { label: "Name", value: deleteTarget.name },
                {
                  label: "Type",
                  value: deleteTarget.categoryType,
                  color: deleteTarget.categoryType === "Income" ? colors.success : colors.error,
                },
              ]
            : []
        }
      />

      <InvestmentFormDialog
        open={openCategoryModal}
        onClose={handleCloseAddModal}
        title="Add Category"
        subtitle="Create a label for income or expense transactions"
        icon={AddIcon}
        headerVariant="primary"
        formId="category-add-form"
        submitLabel="Add Category"
        isPending={categoryMutation.isPending}
        submitDisabled={!newCategoryName.trim()}
        submitVariant="success"
        fullScreen={isMobile}
      >
        <Box component="form" id="category-add-form" onSubmit={handleAddSubmit}>
          <CategoryFormFields
            name={newCategoryName}
            onNameChange={(e) => setNewCategoryName(e.target.value)}
            categoryType={newCategoryType}
            onTypeChange={(e) => setNewCategoryType(e.target.value)}
            currency={newCategoryCurrency}
            onCurrencyChange={(e) => setNewCategoryCurrency(e.target.value)}
            currencies={currenciesFetched}
            accent="primary"
          />
        </Box>
      </InvestmentFormDialog>

      <InvestmentFormDialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Category"
        subtitle="Update this category's name, type, or currency"
        icon={EditIcon}
        headerVariant="primary"
        formId="category-edit-form"
        submitLabel="Save Changes"
        isPending={editCategoryMutation.isPending}
        submitDisabled={!editCategoryName.trim()}
        submitVariant="success"
        fullScreen={isMobile}
      >
        <Box component="form" id="category-edit-form" onSubmit={handleEditSubmit}>
          <CategoryFormFields
            name={editCategoryName}
            onNameChange={(e) => setEditCategoryName(e.target.value)}
            categoryType={editCategoryType}
            onTypeChange={(e) => setEditCategoryType(e.target.value)}
            currency={editCategoryCurrency}
            onCurrencyChange={(e) => setEditCategoryCurrency(e.target.value)}
            currencies={currenciesFetched}
            accent="primary"
          />
        </Box>
      </InvestmentFormDialog>

      <CurrencyManagerDialog
        open={manageCurrenciesOpen}
        onClose={() => setManageCurrenciesOpen(false)}
        currencies={currenciesFetched}
        isPending={isCurrenciesPending}
        onAdd={handleOpenAddCurrency}
        onEdit={handleOpenEditCurrency}
        onDelete={handleDeleteCurrencyRequest}
        fullScreen={isMobile}
      />

      <InvestmentFormDialog
        open={currencyFormOpen}
        onClose={handleCloseCurrencyForm}
        title={editingCurrencyTarget ? "Edit Currency" : "Add Currency"}
        subtitle={editingCurrencyTarget ? "Update this currency's details" : "Make a new currency available app-wide"}
        icon={editingCurrencyTarget ? EditIcon : MonetizationOnIcon}
        headerVariant="primary"
        formId="currency-form"
        submitLabel={editingCurrencyTarget ? "Save Changes" : "Add Currency"}
        isPending={createCurrencyMutation.isPending || editCurrencyMutation.isPending}
        submitDisabled={!currencyCode.trim() || !currencyName.trim() || !currencySymbol.trim()}
        submitVariant="success"
        fullScreen={isMobile}
      >
        <Box component="form" id="currency-form" onSubmit={handleCurrencyFormSubmit}>
          <CurrencyFormFields
            code={currencyCode}
            onCodeChange={(e) => setCurrencyCode(e.target.value)}
            name={currencyName}
            onNameChange={(e) => setCurrencyName(e.target.value)}
            symbol={currencySymbol}
            onSymbolChange={(e) => setCurrencySymbol(e.target.value)}
            isDefault={currencyIsDefault}
            onIsDefaultChange={(e) => setCurrencyIsDefault(e.target.checked)}
            accent="primary"
          />
        </Box>
      </InvestmentFormDialog>

      <InvestmentDeleteDialog
        open={currencyDeleteOpen}
        onClose={() => {
          setCurrencyDeleteOpen(false);
          setCurrencyDeleteTarget(null);
        }}
        title="Delete Currency"
        subtitle="This action cannot be undone"
        message="Removing this currency won't change records that already use it, but it will no longer appear in dropdowns going forward."
        icon={DeleteIcon}
        headerVariant="stock"
        onConfirm={handleDeleteCurrencyConfirm}
        isPending={deleteCurrencyMutation.isPending}
        fullScreen={isMobile}
        rows={
          currencyDeleteTarget
            ? [
                { label: "Code", value: currencyDeleteTarget.code },
                { label: "Name", value: currencyDeleteTarget.name },
                { label: "Symbol", value: currencyDeleteTarget.symbol },
              ]
            : []
        }
      />
    </Box>
  );
};

export default CategoryPage;
