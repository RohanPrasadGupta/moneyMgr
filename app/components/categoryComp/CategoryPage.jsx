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
  useTheme,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { useCategoryQuery } from "../../services/useCategoryServices";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  themedCardSx,
  gradients,
  navbarRadialBg,
  colors,
  statCardSx,
  textFieldOutlinedSx,
  insetPanelSx,
  primaryButtonSx,
} from "../../themeStyles";
import {
  InvestmentFormDialog,
  InvestmentDeleteDialog,
  accentFieldSx,
} from "../investmentsComp/InvestmentFormUi";

const CategoryList = ({ title, categories = [], accentColor, onDelete, searchTerm = "" }) => {
  const isIncome = title === "Income";
  const gradient = isIncome ? gradients.income : gradients.expense;
  const borderAccent = isIncome ? colors.success : colors.error;

  return (
    <Paper
      sx={{
        ...themedCardSx,
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
        border: `1px solid ${alpha(borderAccent, 0.25)}`,
      }}
    >
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          background: gradient,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {isIncome ? (
              <TrendingUpIcon sx={{ color: "common.white", fontSize: 28 }} />
            ) : (
              <TrendingDownIcon sx={{ color: "common.white", fontSize: 28 }} />
            )}
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: "common.white", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
            >
              {title}
            </Typography>
          </Stack>
          <Chip
            label={`${categories.length} ${categories.length === 1 ? "Category" : "Categories"}`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.25)",
              color: "common.white",
              fontWeight: 700,
              fontSize: "0.8rem",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {categories.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 250,
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.35,
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 40, color: "common.white" }} />
            </Box>
            <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>
              No Categories Yet
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", textAlign: "center", maxWidth: 300 }}
            >
              {searchTerm
                ? `No ${title.toLowerCase()} categories match your search`
                : `Add your first ${title.toLowerCase()} category to get started`}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {categories.map((c) => (
              <Grid item key={c._id} xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(borderAccent, 0.06),
                    border: `1px solid ${alpha(borderAccent, 0.3)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 10px 18px ${alpha(borderAccent, 0.2)}`,
                      borderColor: accentColor,
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} flex={1} minWidth={0}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: accentColor,
                        boxShadow: `0 0 8px ${accentColor}`,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.name}
                    </Typography>
                  </Stack>
                  <IconButton
                    size="small"
                    onClick={() => onDelete && onDelete(c)}
                    sx={{
                      color: colors.error,
                      bgcolor: alpha(colors.error, 0.1),
                      border: `1px solid ${alpha(colors.error, 0.3)}`,
                      flexShrink: 0,
                      ml: 0.5,
                      "&:hover": {
                        bgcolor: alpha(colors.error, 0.2),
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                    aria-label={`delete ${c.name}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        {categories.length > 0 && searchTerm && (
          <Typography variant="caption" sx={{ mt: 2, display: "block", color: "text.secondary" }}>
            Showing {categories.length} result{categories.length > 1 ? "s" : ""} for &ldquo;{searchTerm}&rdquo;
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

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

const CategoryFormFields = ({ name, onNameChange, categoryType, onTypeChange, accent = "primary" }) => (
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
      </Paper>
      <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
        <CategoryTypeSelector value={categoryType} onChange={onTypeChange} />
      </Paper>
    </Stack>
);

const CategoryPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    isPending,
    isError,
    data: categoriesFetched = [],
  } = useCategoryQuery();

  const queryClient = useQueryClient();
  const [openCategoryModal, setOpenCategoryModal] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newCategoryType, setNewCategoryType] = React.useState("Expense");
  const [searchQuery, setSearchQuery] = React.useState("");

  const resetAddForm = () => {
    setNewCategoryName("");
    setNewCategoryType("Expense");
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

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    categoryMutation.mutate({ name: trimmed, categoryType: newCategoryType });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget?._id) {
      categoryDeleteMutation.mutate(deleteTarget._id);
    }
  };

  const incomeCats = (categoriesFetched || []).filter((c) => c.categoryType === "Income");
  const expenseCats = (categoriesFetched || []).filter((c) => c.categoryType === "Expense");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredIncomeCats = incomeCats.filter((c) => c.name?.toLowerCase().includes(normalizedQuery));
  const filteredExpenseCats = expenseCats.filter((c) => c.name?.toLowerCase().includes(normalizedQuery));
  const totalCategories = incomeCats.length + expenseCats.length;

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
      <Box sx={{ mb: 4, pb: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
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
                  }}
                >
                  Categories
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Organize transactions with custom income and expense labels
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
              <Paper sx={{ ...statCardSx("neutral"), minWidth: 100, py: 1.5, px: 2 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  TOTAL
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {totalCategories}
                </Typography>
              </Paper>
              <Paper sx={{ ...statCardSx("success"), minWidth: 100, py: 1.5, px: 2 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  INCOME
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: colors.success }}>
                  {incomeCats.length}
                </Typography>
              </Paper>
              <Paper sx={{ ...statCardSx("error"), minWidth: 100, py: 1.5, px: 2 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  EXPENSE
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: colors.error }}>
                  {expenseCats.length}
                </Typography>
              </Paper>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCategoryModal(true)}
              sx={{
                ...primaryButtonSx,
                py: 1.2,
                px: 3,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Add Category
            </Button>
          </Stack>
        </Stack>

        <TextField
          fullWidth
          size="small"
          placeholder="Search categories by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mt: 2.5,
            maxWidth: isMobile ? "100%" : 440,
            ...textFieldOutlinedSx,
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
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <CategoryList
              title="Income"
              categories={filteredIncomeCats}
              accentColor={colors.success}
              onDelete={handleDeleteRequest}
              searchTerm={normalizedQuery}
            />
          </Grid>
          <Grid item xs={12} lg={6}>
            <CategoryList
              title="Expense"
              categories={filteredExpenseCats}
              accentColor={colors.error}
              onDelete={handleDeleteRequest}
              searchTerm={normalizedQuery}
            />
          </Grid>
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
            accent="primary"
          />
        </Box>
      </InvestmentFormDialog>
    </Box>
  );
};

export default CategoryPage;
