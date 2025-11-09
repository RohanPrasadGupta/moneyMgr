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
  Modal,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import CloseIcon from "@mui/icons-material/Close";
import { useCategoryQuery } from "../../services/useCategoryServices";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const CategoryList = ({ title, categories = [], color, onDelete }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        minHeight: 220,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <CategoryIcon sx={{ color }} />
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <Chip label={categories.length} size="small" sx={{ ml: 1 }} />
        </Stack>
      </Stack>

      <Box sx={{ mt: 1 }}>
        <Grid container spacing={1}>
          {categories.map((c) => (
            <Grid item key={c._id} xs={6} sm={4} md={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 1,
                  borderRadius: 2,
                  background:
                    title === "Expense"
                      ? "linear-gradient(135deg, #ef5350, #e57373)"
                      : "linear-gradient(135deg, #43a047, #66bb6a)",
                  border:
                    title === "Expense"
                      ? "2px solid #ef5350"
                      : "2px solid #43a047",

                  boxShadow:
                    title === "Income"
                      ? "0 4px 12px rgba(67, 160, 71, 0.5)"
                      : "0 4px 12px rgba(239, 83, 80, 0.5)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Button
                  variant="contained"
                  disableElevation
                  fullWidth
                  sx={{
                    background:
                      title === "Expense"
                        ? "linear-gradient(135deg, #ef5350, #e57373)"
                        : "linear-gradient(135deg, #43a047, #66bb6a)",
                    color: "#fff",
                    p: 1.25,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    transition: "transform 180ms ease, box-shadow 180ms ease",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#fff" }}
                  >
                    {c.name}
                  </Typography>
                </Button>

                <IconButton
                  size="small"
                  onClick={() => onDelete && onDelete(c)}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.35)",
                    color: "#fff",
                    p: 0.6,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(0,0,0,0.45)" },
                  }}
                  aria-label={`delete ${c.name}`}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: "100%" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={800}>
          Categories
        </Typography>

        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => refetch()} aria-label="refresh">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCategoryModal(true)}
          >
            Add Category
          </Button>
        </Stack>
      </Stack>

      {isPending ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="error">Failed to load categories</Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid width={"100%"} item xs={12} sm={6}>
            <CategoryList
              title="Income"
              categories={incomeCats}
              color="#43a047"
              onDelete={handleDeleteRequest}
            />
          </Grid>

          <Grid width={"100%"} item xs={12} sm={6}>
            <CategoryList
              title="Expense"
              categories={expenseCats}
              color="#ef5350"
              onDelete={handleDeleteRequest}
            />
          </Grid>
        </Grid>
      )}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            minWidth: 320,
          }}
        >
          <Typography variant="h6" mb={1}>
            Delete Category
          </Typography>
          <Typography mb={2}>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>?
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setDeleteModalOpen(false)}
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
              sx={{
                background: "#137fd1",
                color: "#ffffff",
                boxShadow: "none",
                backgroundImage: "none",
                "&:hover": { background: "#0f6fbf" },
              }}
              onClick={() => {
                if (deleteTarget?._id) {
                  categoryDeleteMutation.mutate(deleteTarget._id);
                  setDeleteModalOpen(false);
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
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
            p: 3,
            borderRadius: 2,
            minWidth: 320,
          }}
        >
          <Typography variant="h6" mb={2}>
            Add Category
          </Typography>
          <TextField
            label="Category name"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <RadioGroup
            row
            value={newCategoryType}
            onChange={(e) => setNewCategoryType(e.target.value)}
            sx={{ mb: 2 }}
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
          <Stack direction="row" spacing={2} justifyContent="flex-end">
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
              disabled={!newCategoryName.trim()}
              onClick={() =>
                categoryMutation.mutate({
                  name: newCategoryName.trim(),
                  categoryType: newCategoryType,
                })
              }
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
    </Box>
  );
};

export default CategoryPage;
