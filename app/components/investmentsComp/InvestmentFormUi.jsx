"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  InputAdornment,
  Divider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import {
  colors,
  dialogPaperSx,
  dialogTitleSx,
  dialogActionsSx,
  textFieldOutlinedSx,
  cancelButtonSx,
  successButtonSx,
  primaryButtonSx,
  dangerButtonSx,
  gradients,
  insetPanelSx,
} from "../../themeStyles";

const ACCENT_MAP = {
  error: colors.error,
  primary: colors.primary,
  success: colors.successDark,
};

export const accentFieldSx = (accentKey = "primary") => {
  const accent = ACCENT_MAP[accentKey] || colors.primary;
  return {
    ...textFieldOutlinedSx,
    "& .MuiOutlinedInput-root": {
      ...textFieldOutlinedSx["& .MuiOutlinedInput-root"],
      "&:hover fieldset": { borderColor: accent },
      "&.Mui-focused fieldset": { borderColor: accent },
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: accent },
  };
};

const HEADER_GRADIENT = {
  stock: gradients.expense,
  coin: gradients.primary,
  sip: gradients.income,
};

export const InvestmentDialogHeader = ({
  title,
  subtitle,
  icon: Icon,
  onClose,
  variant = "primary",
}) => (
  <DialogTitle sx={{ ...dialogTitleSx, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 } }}>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: HEADER_GRADIENT[variant] || gradients.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 16px ${alpha(
              variant === "stock" ? colors.error : variant === "sip" ? colors.success : colors.primary,
              0.35
            )}`,
          }}
        >
          <Icon sx={{ color: "common.white", fontSize: 26 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: "text.primary" }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
            {subtitle}
          </Typography>
        </Box>
      </Stack>
      <IconButton
        size="small"
        onClick={onClose}
        aria-label="Close"
        sx={{
          color: "text.secondary",
          border: "1px solid",
          borderColor: "divider",
          "&:hover": { bgcolor: alpha(colors.text.secondary, 0.08) },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Stack>
  </DialogTitle>
);

const FormSection = ({ title, subtitle, children }) => (
  <Box>
    <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
      {subtitle}
    </Typography>
    {children}
  </Box>
);

export const StockFormFields = ({ formId, formData, onChange, onSubmit, accent = "error" }) => {
  const fieldSx = accentFieldSx(accent);
  return (
    <Box component="form" id={formId} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
          <FormSection title="Investment details" subtitle="Capital contribution in NPR">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Investment date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={onChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  inputProps={{ min: 0, step: "any" }}
                  value={formData.amount}
                  onChange={onChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaymentsIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary" }}>
                          NPR
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
          </FormSection>
        </Paper>
      </Stack>
    </Box>
  );
};

export const CoinFormFields = ({
  formId,
  formData,
  onChange,
  onSubmit,
  accent = "error",
  isMobile = false,
}) => {
  const fieldSx = accentFieldSx(accent);
  const size = isMobile ? "small" : "medium";
  const totalPreview =
    formData.amount && formData.transactionCharge
      ? Number(formData.amount) + Number(formData.transactionCharge)
      : null;

  return (
    <Box component="form" id={formId} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
          <FormSection title="Investment details" subtitle="Amounts in BHT (Thai Baht)">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size={size}
                  label="Investment date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={onChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size={size}
                  label="Investment amount"
                  name="amount"
                  type="number"
                  inputProps={{ min: 0, step: "any" }}
                  value={formData.amount}
                  onChange={onChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaymentsIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary" }}>
                          BHT
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size={size}
                  label="Transaction charge"
                  name="transactionCharge"
                  type="number"
                  inputProps={{ min: 0, step: "any" }}
                  value={formData.transactionCharge}
                  onChange={onChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptLongIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary" }}>
                          BHT
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
            {totalPreview != null && !Number.isNaN(totalPreview) && (
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: alpha(colors.primary, 0.35),
                  bgcolor: alpha(colors.primary, 0.08),
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  Estimated total (amount + charges)
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: "primary.main", mt: 0.25 }}>
                  {totalPreview.toLocaleString(undefined, { maximumFractionDigits: 2 })} BHT
                </Typography>
              </Paper>
            )}
          </FormSection>
        </Paper>
      </Stack>
    </Box>
  );
};

const SUBMIT_STYLES = {
  success: successButtonSx,
  primary: primaryButtonSx,
  danger: dangerButtonSx,
};

export const InvestmentFormDialog = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  headerVariant = "primary",
  formId,
  formData,
  onChange,
  onSubmit,
  submitLabel,
  isPending,
  submitDisabled = false,
  submitVariant = "success",
  fullScreen = false,
  children,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    fullScreen={fullScreen}
    PaperProps={{
      sx: {
        ...dialogPaperSx,
        borderRadius: fullScreen ? 0 : dialogPaperSx.borderRadius,
      },
    }}
  >
    <InvestmentDialogHeader
      title={title}
      subtitle={subtitle}
      icon={icon}
      onClose={onClose}
      variant={headerVariant}
    />
    <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
      {children || null}
    </DialogContent>
    <DialogActions sx={{ ...dialogActionsSx, justifyContent: "flex-end", gap: 1.5 }}>
      <Button onClick={onClose} sx={{ ...cancelButtonSx, width: { xs: "100%", sm: "auto" } }}>
        Cancel
      </Button>
      <Button
        type="submit"
        form={formId}
        disabled={isPending || submitDisabled}
        sx={{
          ...(SUBMIT_STYLES[submitVariant] || successButtonSx),
          width: { xs: "100%", sm: "auto" },
          minWidth: 140,
        }}
      >
        {isPending ? <CircularProgress size={22} sx={{ color: "common.white" }} /> : submitLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export const InvestmentDeleteDialog = ({
  open,
  onClose,
  title,
  subtitle,
  message,
  icon,
  headerVariant = "stock",
  rows = [],
  onConfirm,
  isPending,
  fullScreen = false,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    fullScreen={fullScreen}
    PaperProps={{
      sx: {
        ...dialogPaperSx,
        borderRadius: fullScreen ? 0 : dialogPaperSx.borderRadius,
      },
    }}
  >
    <InvestmentDialogHeader title={title} subtitle={subtitle} icon={icon} onClose={onClose} variant={headerVariant} />
    <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2.5 }}>
        {message}
      </Typography>
      {rows.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            ...insetPanelSx,
            p: 2,
            borderColor: alpha(colors.error, 0.35),
            bgcolor: alpha(colors.error, 0.06),
          }}
        >
          <Stack spacing={1.5} divider={<Divider sx={{ borderColor: "divider" }} />}>
            {rows.map((row) => (
              <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  {row.label}
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: row.color || "text.primary", textAlign: "right" }}>
                  {row.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}
    </DialogContent>
    <DialogActions sx={{ ...dialogActionsSx, justifyContent: "flex-end", gap: 1.5 }}>
      <Button onClick={onClose} sx={{ ...cancelButtonSx, width: { xs: "100%", sm: "auto" } }}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isPending}
        sx={{ ...dangerButtonSx, width: { xs: "100%", sm: "auto" }, minWidth: 120 }}
      >
        {isPending ? <CircularProgress size={22} sx={{ color: "common.white" }} /> : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);
