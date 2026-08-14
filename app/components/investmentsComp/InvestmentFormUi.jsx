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
  MenuItem,
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
import { getCurrencyMenuOptions } from "../../services/useCurrencyServices";

// Calmer "Dark" tints throughout — the punchier base tones read as too
// vivid/neon for form field accents.
const ACCENT_MAP = {
  error: colors.errorDark,
  primary: colors.primaryDark,
  success: colors.successDark,
};

export const accentFieldSx = (accentKey = "primary") => {
  const accent = ACCENT_MAP[accentKey] || colors.primaryDark;
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

/**
 * Shared glass-style stat card — a colored top accent bar over a soft tinted
 * background, used consistently across the Investments overview and every
 * sub-tab so stats always look like one connected strip, not disconnected
 * boxes of different sizes/styles.
 */
export const InvestmentStatCard = ({ label, value, sub, color, icon: Icon, flexBasis = "0 0 190px" }) => (
  <Paper
    elevation={0}
    sx={{
      flex: { xs: flexBasis, sm: 1 },
      p: { xs: 1.75, sm: 2 },
      borderRadius: 2.5,
      bgcolor: alpha(color, 0.07),
      border: "1px solid",
      borderColor: alpha(color, 0.3),
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: color,
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={0.75} mb={0.5}>
      {Icon && <Icon sx={{ fontSize: 16, color }} />}
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.3, fontSize: "0.68rem" }}>
        {label.toUpperCase()}
      </Typography>
    </Stack>
    <Typography variant="h6" fontWeight={800} sx={{ color, fontSize: { xs: "1.05rem", sm: "1.2rem" } }}>
      {value}
    </Typography>
    {sub && (
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
        {sub}
      </Typography>
    )}
  </Paper>
);

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
              variant === "stock" ? colors.errorDark : variant === "sip" ? colors.successDark : colors.primaryDark,
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

export const StockFormFields = ({ formId, formData, onChange, onSubmit, currencies = [], accent = "error" }) => {
  const fieldSx = accentFieldSx(accent);
  const accentColor = ACCENT_MAP[accent] || colors.primaryDark;
  const previewAmount = formData.amount && !Number.isNaN(Number(formData.amount)) ? Number(formData.amount) : null;
  return (
    <Box component="form" id={formId} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Paper elevation={0} sx={{ ...insetPanelSx, p: { xs: 2, sm: 2.5 } }}>
          <FormSection title="Investment details" subtitle={`Capital contribution in ${formData.currency || "NPR"}`}>
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
                          {formData.currency || "NPR"}
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Currency"
                  name="currency"
                  value={formData.currency || "NPR"}
                  onChange={onChange}
                  required
                  sx={fieldSx}
                >
                  {getCurrencyMenuOptions(currencies, formData.currency).map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            {previewAmount != null && (
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: alpha(accentColor, 0.35),
                  bgcolor: alpha(accentColor, 0.08),
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  You're about to add
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: accentColor, mt: 0.25 }}>
                  {previewAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {formData.currency || "NPR"}
                </Typography>
              </Paper>
            )}
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
                  borderColor: alpha(colors.primaryDark, 0.35),
                  bgcolor: alpha(colors.primaryDark, 0.08),
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  Estimated total (amount + charges)
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: colors.primaryDark, mt: 0.25 }}>
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
