import { alpha } from "@mui/material/styles";

/** Design tokens — single source of truth for the money manager UI */
export const colors = {
  bg: {
    default: "#0f1115",
    paper: "#1e222a",
    elevated: "#252a33",
    inset: "rgba(35, 39, 47, 0.6)",
    cardStart: "rgba(30, 34, 45, 0.9)",
    cardEnd: "rgba(15, 17, 21, 0.95)",
  },
  primary: "#64b5f6",
  primaryDark: "#42a5f5",
  text: {
    primary: "#f0f2f5",
    secondary: "#b0b8c1",
    disabled: "#6b7280",
    heading: "#e8eaed",
  },
  border: "#23272f",
  borderSubtle: "rgba(255, 255, 255, 0.06)",
  success: "#66bb6a",
  successDark: "#43a047",
  error: "#ef5350",
  errorDark: "#e53935",
  warning: "#ffb74d",
  neutral: {
    gray: "#757575",
    grayLight: "#9e9e9e",
    grayDark: "#616161",
  },
};

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
  primaryHover: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
  income: `linear-gradient(135deg, ${colors.success} 0%, ${colors.successDark} 100%)`,
  incomeHover: `linear-gradient(135deg, ${colors.successDark} 0%, ${colors.success} 100%)`,
  expense: `linear-gradient(135deg, ${colors.error} 0%, ${colors.errorDark} 100%)`,
  expenseHover: `linear-gradient(135deg, ${colors.errorDark} 0%, ${colors.error} 100%)`,
  cancel: `linear-gradient(135deg, ${colors.neutral.gray} 0%, ${colors.neutral.grayLight} 100%)`,
  cancelHover: `linear-gradient(135deg, ${colors.neutral.grayDark} 0%, ${colors.neutral.gray} 100%)`,
  card: `linear-gradient(145deg, ${colors.bg.cardStart} 0%, ${colors.bg.cardEnd} 100%)`,
  disabled: `linear-gradient(135deg, #555 0%, #333 100%)`,
};

export const themedCardSx = {
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
  borderRadius: 3,
};

export const flatCardSx = {
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 3,
};

export const dialogPaperSx = {
  borderRadius: 3,
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
};

export const dialogTitleSx = {
  borderBottom: "1px solid",
  borderColor: "divider",
  pb: 2,
};

export const dialogActionsSx = {
  p: { xs: 2, sm: 2.5, md: 3 },
  borderTop: "1px solid",
  borderTopColor: "divider",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1, sm: 0 },
};

export const insetPanelSx = {
  bgcolor: "background.default",
  p: 2,
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
};

export const textFieldOutlinedSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "background.default",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "primary.main" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" },
  },
  "& .MuiInputBase-input": { color: "text.primary" },
  "& .MuiInputLabel-root": { color: "text.secondary" },
  "& .MuiSvgIcon-root": { color: "text.secondary" },
};

export const cancelButtonSx = {
  background: gradients.cancel,
  color: "common.white",
  fontWeight: 600,
  px: 3,
  py: 1,
  borderRadius: 2,
  textTransform: "none",
  boxShadow: "0 4px 12px rgba(117, 117, 117, 0.3)",
  "&:hover": {
    background: gradients.cancelHover,
    boxShadow: "0 6px 16px rgba(117, 117, 117, 0.4)",
  },
};

export const primaryButtonSx = {
  background: gradients.primary,
  color: "common.white",
  fontWeight: 600,
  px: 3,
  py: 1,
  borderRadius: 2,
  textTransform: "none",
  boxShadow: `0 4px 12px ${alpha(colors.primary, 0.35)}`,
  "&:hover": {
    background: gradients.primaryHover,
    boxShadow: `0 6px 16px ${alpha(colors.primary, 0.45)}`,
  },
  "&:disabled": {
    background: gradients.disabled,
    color: "common.white",
    opacity: 0.6,
  },
};

export const successButtonSx = {
  background: gradients.income,
  color: "common.white",
  fontWeight: 600,
  px: 3,
  py: 1,
  borderRadius: 2,
  textTransform: "none",
  boxShadow: `0 4px 12px ${alpha(colors.success, 0.35)}`,
  "&:hover": {
    background: gradients.incomeHover,
    boxShadow: `0 6px 16px ${alpha(colors.success, 0.45)}`,
  },
  "&:disabled": {
    background: gradients.disabled,
    color: "common.white",
    opacity: 0.6,
  },
};

export const dangerButtonSx = {
  background: gradients.expense,
  color: "common.white",
  fontWeight: 600,
  px: 3,
  py: 1,
  borderRadius: 2,
  textTransform: "none",
  boxShadow: `0 4px 12px ${alpha(colors.error, 0.35)}`,
  "&:hover": {
    background: gradients.expenseHover,
    boxShadow: `0 6px 16px ${alpha(colors.error, 0.45)}`,
  },
  "&:disabled": {
    background: gradients.disabled,
    color: "common.white",
    opacity: 0.6,
  },
};

/** Income / expense / net stat chip panels */
export const semanticStatSx = (kind) => {
  const map = {
    income: {
      bgcolor: alpha(colors.success, 0.1),
      border: `1px solid ${alpha(colors.success, 0.3)}`,
      labelColor: colors.success,
    },
    expense: {
      bgcolor: alpha(colors.error, 0.1),
      border: `1px solid ${alpha(colors.error, 0.3)}`,
      labelColor: colors.error,
    },
    netPositive: {
      bgcolor: alpha(colors.primary, 0.1),
      border: `1px solid ${alpha(colors.primary, 0.3)}`,
      labelColor: colors.primary,
    },
    netNegative: {
      bgcolor: alpha(colors.error, 0.1),
      border: `1px solid ${alpha(colors.error, 0.3)}`,
      labelColor: colors.error,
    },
  };
  const s = map[kind] || map.netPositive;
  return {
    box: {
      flex: { xs: "1 1 45%", sm: "none" },
      ...s,
      p: { xs: 1.5, sm: 2 },
      borderRadius: 2,
      textAlign: "center",
      minWidth: { sm: "140px" },
    },
    label: { color: s.labelColor, fontWeight: "bold", display: "block", mb: 0.5 },
    value: { color: "text.primary", fontWeight: "bold" },
  };
};

export const typeTogglePaperSx = (selected, type) => {
  const isIncome = type === "Income";
  const activeColor = isIncome ? "success.dark" : "error.main";
  const tint = isIncome ? alpha(colors.success, 0.1) : alpha(colors.error, 0.1);
  const hoverBorder = isIncome ? "success.dark" : "error.main";
  return {
    flex: 1,
    p: 2,
    border: selected ? "2px solid" : "1px solid",
    borderColor: selected ? activeColor : "divider",
    borderRadius: 2,
    bgcolor: selected ? tint : "background.default",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    "&:hover": {
      borderColor: hoverBorder,
      transform: "translateY(-2px)",
    },
  };
};

export const typeToggleTextSx = (selected, type) => {
  const isIncome = type === "Income";
  return {
    color: selected ? (isIncome ? "success.dark" : "error.main") : "text.primary",
    fontWeight: selected ? 700 : 600,
  };
};

export const navbarRadialBg =
  "radial-gradient(circle at top right, rgba(100, 181, 246, 0.12), transparent 45%), radial-gradient(circle at bottom left, rgba(100, 181, 246, 0.08), transparent 42%)";

export const chartColors = {
  axis: "#b0b8c1",
  grid: "rgba(255, 255, 255, 0.08)",
  pieBorder: "#0f1115",
  pieLabel: "#f0f2f5",
  pieConnector: "rgba(255, 255, 255, 0.4)",
};

/** Multi-series / pie palette — matches analysis charts */
export const chartPalette = [
  colors.primary,
  colors.success,
  colors.error,
  colors.warning,
  "#ab47bc",
  "#26c6da",
  "#ff7043",
  "#7e57c2",
  "#8d6e63",
  "#4db6ac",
];

/** SVG pie slice gradients — start/end pairs for Recharts linearGradient defs */
export const chartPieGradients = [
  { start: "#00f2fe", end: "#4facfe" },
  { start: "#64b5f6", end: "#1976d2" },
  { start: "#66bb6a", end: "#2e7d32" },
  { start: "#ef5350", end: "#c62828" },
  { start: "#ffb74d", end: "#f57c00" },
  { start: "#ab47bc", end: "#7b1fa2" },
  { start: "#26c6da", end: "#00838f" },
  { start: "#f48fb1", end: "#d81b60" },
  { start: "#ffe082", end: "#ffb300" },
  { start: "#7e57c2", end: "#4527a0" },
];

/** Recharts / Highcharts need real hex — not MUI palette paths */
/** Bordered stat / summary cards (investments, etc.) */
/**
 * Picks a calmer, more contrasted tint in light mode (Material "600"-level
 * tones read better on white than the punchier "400"-level tones used for
 * dark backgrounds) while keeping the vivid tones in dark mode.
 */
export const adaptiveColor = (base, darkTint, mode = "dark") => (mode === "light" ? darkTint : base);

export const statCardSx = (variant = "default", mode = "dark") => {
  const base = {
    p: { xs: 2, sm: 2.5, md: 3 },
    borderRadius: { xs: 2, sm: 2.5, md: 3 },
    bgcolor: "background.paper",
    textAlign: "center",
    height: "100%",
    border: "1px solid",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.2s ease",
  };
  // Always use the calmer "Dark" tint (not just in light mode) — the punchier
  // base tones read as too loud/neon for stat-card accents in either theme.
  const accentFor = {
    default: colors.text.secondary,
    neutral: colors.text.secondary,
    error: colors.errorDark,
    primary: colors.primaryDark,
    success: colors.successDark,
    action: colors.primaryDark,
  };
  const accent = accentFor[variant] || colors.text.secondary;
  const bgAlpha = mode === "light" ? 0.08 : 0.06;
  const borderAlpha = mode === "light" ? 0.3 : 0.4;
  const accentBar = {
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: accent,
    },
  };
  const variants = {
    default: {
      borderColor: alpha(colors.text.secondary, 0.45),
      bgcolor: alpha(colors.text.secondary, 0.06),
    },
    neutral: {
      borderColor: alpha(colors.text.secondary, 0.55),
      bgcolor: alpha(colors.text.secondary, 0.08),
      boxShadow: `0 0 0 1px ${alpha(colors.text.secondary, 0.12)}`,
    },
    error: {
      borderColor: alpha(accent, borderAlpha),
      bgcolor: alpha(accent, bgAlpha),
    },
    primary: {
      borderColor: alpha(accent, borderAlpha),
      bgcolor: alpha(accent, bgAlpha),
    },
    success: {
      borderColor: alpha(accent, borderAlpha + 0.1),
      bgcolor: alpha(accent, bgAlpha + 0.02),
      boxShadow: `0 4px 12px ${alpha(accent, mode === "light" ? 0.12 : 0.2)}`,
    },
    action: {
      borderColor: alpha(accent, borderAlpha + 0.05),
      bgcolor: alpha(accent, bgAlpha),
      textAlign: "left",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
  };
  return { ...base, ...variants[variant], ...accentBar, accentColor: accent };
};

const CURRENCY_COLOR_MAP = {
  THB: colors.primary,
  NPR: colors.warning,
};

/** Small pill treatment for a currency code (Badge/Chip content) */
export const currencyBadgeSx = (code) => {
  const accent = CURRENCY_COLOR_MAP[code] || colors.neutral.gray;
  return {
    bgcolor: alpha(accent, 0.15),
    color: accent,
    border: `1px solid ${alpha(accent, 0.35)}`,
    fontWeight: 700,
  };
};

/**
 * Chart accent/axis colors, tuned per theme mode. The dark-mode palette
 * (light gridlines, near-white legend text, "400-level" vivid accents) reads
 * fine on a dark background but is nearly invisible or overly harsh on white,
 * so light mode gets its own readable axis/grid/legend tones plus the calmer
 * "Dark"-tint accent colors.
 */
export const investmentChartColors = (mode = "dark") => {
  const isLight = mode === "light";
  // Bar/area accents always use the calmer "Dark" tint now (not just in light
  // mode) — the gradient's opacity taper still gives it visual depth without
  // needing the punchier base tone.
  return {
    stockBar: { top: colors.errorDark, bottom: colors.errorDark },
    coinBar: { top: colors.primaryDark, bottom: colors.primaryDark },
    sipBar: chartPalette,
    areaLine: colors.successDark,
    areaFillTop: colors.successDark,
    areaFillBottom: colors.successDark,
    cumulativeLine: colors.warning,
    axis: isLight ? "#555f6d" : colors.text.secondary,
    grid: isLight ? "#e0e4ea" : colors.border,
    legend: isLight ? "#1a1a2e" : colors.text.primary,
  };
};
