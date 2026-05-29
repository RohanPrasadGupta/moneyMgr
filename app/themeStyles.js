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
  background: gradients.card,
  backdropFilter: "blur(10px)",
  border: `1px solid ${colors.borderSubtle}`,
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
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
  bgcolor: colors.bg.inset,
  p: 2,
  borderRadius: 3,
  border: `1px solid ${colors.borderSubtle}`,
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

/** Recharts / Highcharts need real hex — not MUI palette paths */
/** Bordered stat / summary cards (investments, etc.) */
export const statCardSx = (variant = "default") => {
  const base = {
    p: { xs: 2, sm: 2.5, md: 3 },
    borderRadius: { xs: 2, sm: 2.5, md: 3 },
    bgcolor: colors.bg.paper,
    textAlign: "center",
    height: "100%",
    border: "1px solid",
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
      borderColor: alpha(colors.error, 0.4),
      bgcolor: alpha(colors.error, 0.06),
    },
    primary: {
      borderColor: alpha(colors.primary, 0.4),
      bgcolor: alpha(colors.primary, 0.06),
    },
    success: {
      borderColor: alpha(colors.success, 0.5),
      bgcolor: alpha(colors.success, 0.08),
      boxShadow: `0 4px 12px ${alpha(colors.success, 0.2)}`,
    },
    action: {
      borderColor: alpha(colors.primary, 0.45),
      bgcolor: alpha(colors.primary, 0.06),
      textAlign: "left",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
  };
  return { ...base, ...variants[variant] };
};

export const investmentChartColors = {
  stockBar: { top: colors.error, bottom: colors.errorDark },
  coinBar: { top: colors.primary, bottom: colors.primaryDark },
  sipBar: chartPalette,
  areaLine: colors.success,
  areaFillTop: colors.success,
  areaFillBottom: colors.successDark,
  cumulativeLine: colors.warning,
  axis: colors.text.secondary,
  grid: colors.border,
  legend: colors.text.primary,
};
