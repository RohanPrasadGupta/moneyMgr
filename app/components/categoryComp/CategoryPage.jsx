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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useCategoryQuery } from "../../services/useCategoryServices";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const CategoryList = ({ title, categories = [], color, onDelete }) => {
  const isIncome = title === "Income";
  const gradient = isIncome
    ? "linear-gradient(135deg, #66bb6a, #43a047)"
    : "linear-gradient(135deg, #ff9966, #ff5e62)";

  return (
    <Paper
      sx={{
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid #23272f",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid #23272f",
          background: gradient,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            <CategoryIcon sx={{ color: "#fff", fontSize: 28 }} />
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
            >
              {title}
            </Typography>
          </Stack>
          <Chip
            label={`${categories.length} ${categories.length === 1 ? "Category" : "Categories"}`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.25)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.8rem",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </Stack>
      </Box>

      {/* Categories Grid */}
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
                opacity: 0.3,
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 40, color: "#fff" }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              No Categories Yet
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", textAlign: "center", maxWidth: 300 }}
            >
              Add your first {title.toLowerCase()} category to get started
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {categories.map((c) => (
              <Grid item key={c._id} xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "background.default",
                    border: `1px solid ${isIncome ? "rgba(67, 160, 71, 0.3)" : "rgba(255, 94, 98, 0.3)"}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${isIncome ? "rgba(67, 160, 71, 0.2)" : "rgba(255, 94, 98, 0.2)"}`,
                      borderColor: isIncome ? "#43a047" : "#ff5e62",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: color,
                        boxShadow: `0 0 8px ${color}`,
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
                      color: "#ef5350",
                      bgcolor: "rgba(239, 83, 80, 0.1)",
                      border: "1px solid rgba(239, 83, 80, 0.3)",
                      "&:hover": {
                        bgcolor: "rgba(239, 83, 80, 0.2)",
                        transform: "scale(1.1)",
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
      </Box>
    </Paper>
  );
};

const CategoryPage = () => {
  const {
    isPending,
    isError,
    data: categoriesFetched = [],
    refetch,
  } = useCategoryQuery();

  const queryClient = useQueryClient();
  const [openCategoryModal, setOpenCategoryModal] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newCategoryType, setNewCategoryType] = React.useState("Expense");

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
      setNewCategoryName("");
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/${categoryId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const incomeCats = (categoriesFetched || []).filter(
    (c) => c.categoryType === "Income"
  );
  const expenseCats = (categoriesFetched || []).filter(
    (c) => c.categoryType === "Expense"
  );

  const totalCategories = incomeCats.length + expenseCats.length;

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
        minHeight: { xs: 300, sm: 400 },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: "2px solid #23272f",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: "linear-gradient(135deg, #ff9966, #ff5e62)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.5,
              }}
            >
              Category Management
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Organize your transactions with custom categories
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Paper
              sx={{
                px: 2,
                py: 1,
                bgcolor: "background.default",
                border: "1px solid #23272f",
                borderRadius: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <CategoryIcon sx={{ color: "#ff9966", fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600}>
                  Total: {totalCategories}
                </Typography>
              </Stack>
            </Paper>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCategoryModal(true)}
              sx={{
                background: "linear-gradient(135deg, #66bb6a, #43a047)",
                color: "#fff",
                fontWeight: 700,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(67, 160, 71, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5cb860, #388e3c)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(67, 160, 71, 0.4)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Add Category
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Loading & Error States */}
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
          <CircularProgress size={60} sx={{ color: "#ff9966" }} />
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Loading categories...
          </Typography>
        </Box>
      ) : isError ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "rgba(239, 83, 80, 0.1)",
            border: "1px solid rgba(239, 83, 80, 0.3)",
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" color="error" fontWeight={600}>
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
              categories={incomeCats}
              color="#43a047"
              onDelete={handleDeleteRequest}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <CategoryList
              title="Expense"
              categories={expenseCats}
              color="#ff5e62"
              onDelete={handleDeleteRequest}
            />
          </Grid>
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
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
                bgcolor: "rgba(239, 83, 80, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DeleteIcon sx={{ color: "#ef5350" }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Delete Category
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                This action cannot be undone
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Paper
            sx={{
              p: 2,
              bgcolor: "background.default",
              border: "1px solid #23272f",
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              Are you sure you want to delete{" "}
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  color: "#ff5e62",
                }}
              >
                {deleteTarget?.name}
              </Typography>
              ?
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 1 }}
            >
              This will remove the category from your system.
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
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
            onClick={() => {
              if (deleteTarget?._id) {
                categoryDeleteMutation.mutate(deleteTarget._id);
                setDeleteModalOpen(false);
                setDeleteTarget(null);
              }
            }}
            disabled={categoryDeleteMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #ef5350, #f44336)",
              color: "#fff",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
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
            {categoryDeleteMutation.isPending ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
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
                Add New Category
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Create a custom category for your transactions
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Category Name"
              placeholder="Enter category name..."
              fullWidth
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "background.default",
                  "&:hover fieldset": {
                    borderColor: "#ff9966",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ff9966",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#ff9966",
                },
              }}
            />

            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ mb: 1.5, color: "text.primary" }}
              >
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
                    border:
                      newCategoryType === "Income"
                        ? "2px solid #43a047"
                        : "1px solid #23272f",
                    borderRadius: 2,
                    bgcolor:
                      newCategoryType === "Income"
                        ? "rgba(67, 160, 71, 0.1)"
                        : "background.default",
                    transition: "all 0.2s ease",
                  }}
                >
                  <FormControlLabel
                    value="Income"
                    control={<Radio sx={{ color: "#43a047" }} />}
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={600}>Income</Typography>
                      </Stack>
                    }
                    sx={{ p: 1.5, width: "100%" }}
                  />
                </Paper>
                <Paper
                  sx={{
                    flex: 1,
                    border:
                      newCategoryType === "Expense"
                        ? "2px solid #ff5e62"
                        : "1px solid #23272f",
                    borderRadius: 2,
                    bgcolor:
                      newCategoryType === "Expense"
                        ? "rgba(255, 94, 98, 0.1)"
                        : "background.default",
                    transition: "all 0.2s ease",
                  }}
                >
                  <FormControlLabel
                    value="Expense"
                    control={<Radio sx={{ color: "#ff5e62" }} />}
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={600}>Expense</Typography>
                      </Stack>
                    }
                    sx={{ p: 1.5, width: "100%" }}
                  />
                </Paper>
              </RadioGroup>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => {
              setOpenCategoryModal(false);
              setNewCategoryName("");
            }}
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
            onClick={() =>
              categoryMutation.mutate({
                name: newCategoryName.trim(),
                categoryType: newCategoryType,
              })
            }
            disabled={!newCategoryName.trim() || categoryMutation.isPending}
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
    </Box>
  );
};

export default CategoryPage;
