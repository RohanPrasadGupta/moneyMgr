"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  IconButton,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PushPinIcon from "@mui/icons-material/PushPin";
import CloseIcon from "@mui/icons-material/Close";
import NotesIcon from "@mui/icons-material/Notes";
import TitleIcon from "@mui/icons-material/Title";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  themedCardSx,
  gradients,
  navbarRadialBg,
  colors,
  textFieldOutlinedSx,
  primaryButtonSx,
  cancelButtonSx,
  dangerButtonSx,
} from "../../themeStyles";
import { InvestmentDeleteDialog } from "../investmentsComp/InvestmentFormUi";
import {
  createNote,
  deleteNote,
  fetchNote,
  notesQueryKey,
  updateNote,
  useNotesQuery,
} from "../../services/useNoteServices";

const STICKY_STYLES = [
  { paper: "#fff4b8", ruled: "rgba(180, 140, 40, 0.2)", ink: "#3a3220", pin: "#e53935" },
  { paper: "#d7f3ff", ruled: "rgba(40, 120, 180, 0.18)", ink: "#1e3648", pin: "#1e88e5" },
  { paper: "#e4f8d4", ruled: "rgba(70, 130, 50, 0.18)", ink: "#24361c", pin: "#43a047" },
  { paper: "#ffe0d4", ruled: "rgba(180, 80, 40, 0.18)", ink: "#4a2c20", pin: "#fb8c00" },
  { paper: "#f0e0ff", ruled: "rgba(120, 70, 180, 0.18)", ink: "#322448", pin: "#8e24aa" },
  { paper: "#ffe8f0", ruled: "rgba(180, 70, 100, 0.18)", ink: "#4a2430", pin: "#ec407a" },
];

const hashValue = (value) => {
  const text = String(value || "");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const stickyStyleFor = (id) => STICKY_STYLES[hashValue(id) % STICKY_STYLES.length];

const tiltFor = (id) => (hashValue(id) % 7) - 3;

const formatNoteDate = (value) => {
  if (!value) return "Just now";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Just now";
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const stickyInputSx = (ink) => ({
  "& .MuiInputBase-root": {
    color: ink,
    fontFamily: "inherit",
  },
  "& .MuiInputBase-input": { color: ink },
  "& .MuiInput-underline:before": { borderBottomColor: alpha(ink, 0.25) },
  "& .MuiInput-underline:hover:before": { borderBottomColor: alpha(ink, 0.45) },
  "& .MuiInput-underline:after": { borderBottomColor: ink },
});

const StickyNoteCard = ({ note, onOpen, onDelete, isPending }) => {
  const style = stickyStyleFor(note._id);
  const tilt = tiltFor(note._id);

  return (
    <Paper
      elevation={0}
      onClick={() => onOpen(note)}
      sx={{
        position: "relative",
        height: { xs: 220, sm: 240 },
        p: 2.25,
        pt: 3.5,
        cursor: "pointer",
        bgcolor: style.paper,
        color: style.ink,
        borderRadius: "2px 2px 6px 6px",
        boxShadow: `4px 8px 18px rgba(0, 0, 0, 0.18), inset 0 1px 0 ${alpha("#ffffff", 0.55)}`,
        transform: `rotate(${tilt}deg)`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        backgroundImage: `repeating-linear-gradient(
          to bottom,
          transparent 0,
          transparent 27px,
          ${style.ruled} 28px
        )`,
        backgroundPosition: "0 52px",
        "&:hover": {
          transform: "rotate(0deg) translateY(-6px)",
          boxShadow: `6px 16px 28px rgba(0, 0, 0, 0.22)`,
          zIndex: 2,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 18,
          height: 18,
          borderRadius: "50%",
          bgcolor: style.pin,
          boxShadow: `0 4px 8px ${alpha(style.pin, 0.45)}`,
          zIndex: 1,
        }}
      />
      <PushPinIcon
        sx={{
          position: "absolute",
          top: 4,
          left: "50%",
          transform: "translateX(-50%) rotate(-18deg)",
          fontSize: 18,
          color: style.pin,
        }}
      />
      <Tooltip title="Delete note">
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(note);
          }}
          disabled={isPending}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            color: alpha(style.ink, 0.55),
            "&:hover": { color: colors.error, bgcolor: alpha(colors.error, 0.12) },
          }}
        >
          {isPending ? <CircularProgress size={16} /> : <DeleteIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Tooltip>
      <Typography
        fontWeight={800}
        sx={{
          fontSize: "1.05rem",
          lineHeight: 1.3,
          mb: 1,
          pr: 3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {note.title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          whiteSpace: "pre-wrap",
          display: "-webkit-box",
          WebkitLineClamp: 5,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          opacity: 0.88,
          minHeight: 88,
        }}
      >
        {note.content}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ position: "absolute", bottom: 12, left: 16 }}>
        <CalendarMonthIcon sx={{ fontSize: 14, opacity: 0.7 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>
          {formatNoteDate(note.date)}
        </Typography>
      </Stack>
    </Paper>
  );
};

const StickyNoteEditor = ({
  open,
  onClose,
  mode,
  styleKey,
  title,
  content,
  date,
  loading,
  saving,
  onTitleChange,
  onContentChange,
  onSave,
  onDelete,
  fullScreen,
}) => {
  const style = stickyStyleFor(styleKey || "new-note");
  const canSave = Boolean(title.trim() && content.trim());

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          bgcolor: style.paper,
          color: style.ink,
          borderRadius: fullScreen ? 0 : "4px 4px 10px 10px",
          boxShadow: `8px 18px 40px rgba(0, 0, 0, 0.28)`,
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 31px,
            ${style.ruled} 32px
          )`,
          backgroundPosition: "0 92px",
        },
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1, position: "relative" }}>
        <PushPinIcon
          sx={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%) rotate(-16deg)",
            fontSize: 26,
            color: style.pin,
          }}
        />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <StickyNote2Icon sx={{ color: style.pin }} />
            <Box>
              <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
                {mode === "edit" ? "Edit note" : "New sticky note"}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                {mode === "edit" ? formatNoteDate(date) : "Title and details are both required"}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} sx={{ color: alpha(style.ink, 0.7) }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 1, pb: 2.5 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 1.5 }}>
            <CircularProgress size={36} sx={{ color: style.pin }} />
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Opening note...
            </Typography>
          </Box>
        ) : (
          <Box component="form" id="sticky-note-form" onSubmit={onSave}>
            <TextField
              variant="standard"
              fullWidth
              required
              autoFocus
              placeholder="Note title"
              value={title}
              onChange={onTitleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon sx={{ fontSize: 20, color: style.pin }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5, ...stickyInputSx(style.ink), "& .MuiInputBase-input": { fontWeight: 800, fontSize: "1.25rem" } }}
            />
            <TextField
              variant="standard"
              fullWidth
              required
              multiline
              minRows={fullScreen ? 12 : 8}
              placeholder="Write the details..."
              value={content}
              onChange={onContentChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 0.5 }}>
                    <NotesIcon sx={{ fontSize: 20, color: style.pin }} />
                  </InputAdornment>
                ),
              }}
              sx={stickyInputSx(style.ink)}
            />
          </Box>
        )}
      </DialogContent>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        justifyContent="flex-end"
        sx={{ px: { xs: 2, sm: 3 }, pb: 2.5 }}
      >
        {mode === "edit" && (
          <Button
            onClick={onDelete}
            disabled={loading || saving}
            startIcon={<DeleteIcon />}
            sx={{ ...dangerButtonSx, width: { xs: "100%", sm: "auto" } }}
          >
            Delete
          </Button>
        )}
        <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }} />
        <Button onClick={onClose} sx={{ ...cancelButtonSx, width: { xs: "100%", sm: "auto" } }}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="sticky-note-form"
          disabled={loading || saving || !canSave}
          sx={{ ...primaryButtonSx, width: { xs: "100%", sm: "auto" }, minWidth: 140 }}
        >
          {saving ? <CircularProgress size={22} sx={{ color: "common.white" }} /> : "Save note"}
        </Button>
      </Stack>
    </Dialog>
  );
};

const NotesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const { isPending, isError, data: notes = [] } = useNotesQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create");
  const [activeNote, setActiveNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [opening, setOpening] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setActiveNote(null);
    setOpening(false);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    resetEditor();
  };

  const handleCreateRequest = () => {
    setEditorMode("create");
    setActiveNote({ _id: `new-${Date.now()}` });
    setTitle("");
    setContent("");
    setEditorOpen(true);
  };

  const handleOpenNote = async (note) => {
    setEditorMode("edit");
    setActiveNote(note);
    setTitle(note.title || "");
    setContent(note.content || "");
    setEditorOpen(true);
    setOpening(true);
    try {
      const latest = await fetchNote(note._id);
      setActiveNote(latest);
      setTitle(latest.title || "");
      setContent(latest.content || "");
    } catch (error) {
      toast.error(error.message || "Failed to open note");
    } finally {
      setOpening(false);
    }
  };

  const handleDeleteRequest = (note) => {
    setDeleteTarget(note);
    setDeleteModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      toast.success("Note added successfully");
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
      handleCloseEditor();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add note");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) => updateNote(id, payload),
    onSuccess: () => {
      toast.success("Note updated successfully");
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
      handleCloseEditor();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update note");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      toast.success("Note deleted successfully");
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      if (editorOpen) handleCloseEditor();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete note");
    },
  });

  const handleSave = (event) => {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextContent = content.trim();
    if (!nextTitle || !nextContent) {
      toast.error("Please add both a title and note details before saving");
      return;
    }
    if (editorMode === "edit" && activeNote?._id) {
      updateMutation.mutate({ id: activeNote._id, title: nextTitle, content: nextContent });
      return;
    }
    createMutation.mutate({ title: nextTitle, content: nextContent });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget?._id) deleteMutation.mutate(deleteTarget._id);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleNotes = useMemo(
    () =>
      (notes || []).filter((note) => {
        if (!normalizedQuery) return true;
        return (
          note.title?.toLowerCase().includes(normalizedQuery) ||
          note.content?.toLowerCase().includes(normalizedQuery)
        );
      }),
    [notes, normalizedQuery]
  );

  const saving = createMutation.isPending || updateMutation.isPending;

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
              <StickyNote2Icon sx={{ color: "common.white", fontSize: 26 }} />
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
                Notes
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                Pin reminders, details, and ideas on sticky notes
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRequest}
            sx={{
              ...primaryButtonSx,
              borderRadius: "999px",
              py: 1.2,
              px: 3,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Add Note
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1.25,
              borderRadius: 2,
              bgcolor: alpha(colors.primary, 0.1),
              border: `1px solid ${alpha(colors.primary, 0.3)}`,
              minWidth: 140,
            }}
          >
            <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 700 }}>
              TOTAL NOTES
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {notes.length}
            </Typography>
          </Paper>
        </Stack>

        <TextField
          fullWidth
          size="small"
          placeholder="Search notes by title or details..."
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
            Loading notes...
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
            Failed to load notes
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Please try refreshing the page
          </Typography>
        </Paper>
      ) : visibleNotes.length === 0 ? (
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
            <StickyNote2Icon sx={{ fontSize: 40, color: "common.white" }} />
          </Box>
          <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>
            No Notes Found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", maxWidth: 300 }}>
            {normalizedQuery ? `No notes match "${searchQuery}"` : "Add your first sticky note to get started"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          {visibleNotes.map((note) => (
            <Grid key={note._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <StickyNoteCard
                note={note}
                onOpen={handleOpenNote}
                onDelete={handleDeleteRequest}
                isPending={deleteMutation.isPending && deleteTarget?._id === note._id}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <StickyNoteEditor
        open={editorOpen}
        onClose={handleCloseEditor}
        mode={editorMode}
        styleKey={activeNote?._id}
        title={title}
        content={content}
        date={activeNote?.date}
        loading={opening}
        saving={saving}
        onTitleChange={(e) => setTitle(e.target.value)}
        onContentChange={(e) => setContent(e.target.value)}
        onSave={handleSave}
        onDelete={() => activeNote && handleDeleteRequest(activeNote)}
        fullScreen={isMobile}
      />

      <InvestmentDeleteDialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        title="Delete Note"
        subtitle="This action cannot be undone"
        message="This sticky note and its details will be removed permanently."
        icon={DeleteIcon}
        headerVariant="stock"
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        fullScreen={isMobile}
        rows={
          deleteTarget
            ? [
                { label: "Title", value: deleteTarget.title },
                { label: "Date", value: formatNoteDate(deleteTarget.date) },
              ]
            : []
        }
      />
    </Box>
  );
};

export default NotesPage;
