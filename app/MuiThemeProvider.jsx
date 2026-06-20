"use client";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeModeProvider, useThemeMode } from "./context/ThemeContext";
import { colors } from "./themeStyles";
import { alpha } from "@mui/material/styles";

const lightColors = {
  bg: {
    default: "#f5f7fa",
    paper: "#ffffff",
  },
  text: {
    primary: "#1a1a2e",
    secondary: "#555f6d",
    disabled: "#9aa0a6",
  },
  border: "#e0e4ea",
  primary: "#1976d2",
  primaryDark: "#1565c0",
};

function buildTheme(mode) {
  if (mode === "light") {
    return createTheme({
      palette: {
        mode: "light",
        primary: { main: lightColors.primary, dark: lightColors.primaryDark, contrastText: "#fff" },
        secondary: { main: lightColors.text.secondary, contrastText: "#fff" },
        success: { main: colors.success, dark: colors.successDark, contrastText: "#fff" },
        error: { main: colors.error, dark: colors.errorDark, contrastText: "#fff" },
        warning: { main: colors.warning, contrastText: "#fff" },
        info: { main: lightColors.primary, contrastText: "#fff" },
        background: { default: lightColors.bg.default, paper: lightColors.bg.paper },
        text: { primary: lightColors.text.primary, secondary: lightColors.text.secondary, disabled: lightColors.text.disabled },
        divider: lightColors.border,
        common: { white: "#ffffff" },
      },
      typography: {
        fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
        fontWeightBold: 700,
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: { textTransform: "none", fontWeight: 600, letterSpacing: 0.5 },
      },
      shape: { borderRadius: 14 },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: { backgroundColor: lightColors.bg.default, color: lightColors.text.primary },
          },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiButton: {
          styleOverrides: {
            root: { borderRadius: 12, textTransform: "none", fontWeight: 700, transition: "transform 0.2s ease, box-shadow 0.2s ease" },
            contained: {
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              "&:hover": { boxShadow: "0 10px 20px rgba(0,0,0,0.18)", transform: "translateY(-1px)" },
            },
          },
        },
        MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      },
    });
  }

  return createTheme({
    palette: {
      mode: "dark",
      primary: { main: colors.primary, dark: colors.primaryDark, contrastText: colors.bg.default },
      secondary: { main: colors.text.secondary, contrastText: colors.bg.default },
      success: { main: colors.success, dark: colors.successDark, contrastText: colors.bg.default },
      error: { main: colors.error, dark: colors.errorDark, contrastText: colors.bg.default },
      warning: { main: colors.warning, contrastText: colors.bg.default },
      info: { main: colors.primary, contrastText: colors.bg.default },
      background: { default: colors.bg.default, paper: colors.bg.paper },
      text: { primary: colors.text.primary, secondary: colors.text.secondary, disabled: colors.text.disabled },
      divider: colors.border,
      common: { white: "#ffffff" },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
      fontWeightBold: 700,
      h4: { fontWeight: 700, color: colors.text.heading },
      h5: { fontWeight: 700, color: colors.text.heading },
      h6: { fontWeight: 700, color: colors.text.heading },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: 0.5 },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiCssBaseline: {
        styleOverrides: { body: { backgroundColor: colors.bg.default, color: colors.text.primary } },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiDialog: {
        styleOverrides: {
          paper: { backgroundImage: "none", backgroundColor: colors.bg.paper, border: `1px solid ${colors.border}`, borderRadius: 16 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.primary },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: colors.primary },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 12, textTransform: "none", fontWeight: 700, transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease" },
          contained: {
            boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
            "&:hover": { boxShadow: "0 10px 20px rgba(0,0,0,0.26)", transform: "translateY(-1px)", filter: "brightness(1.03)" },
            "&:active": { transform: "translateY(0px)" },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiFab: { styleOverrides: { root: { textTransform: "none" } } },
      MuiCircularProgress: { styleOverrides: { root: { color: colors.primary } } },
    },
  });
}

function ThemedContent({ children }) {
  const { mode } = useThemeMode();
  const theme = buildTheme(mode);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function MuiThemeProvider({ children }) {
  return (
    <ThemeModeProvider>
      <ThemedContent>{children}</ThemedContent>
    </ThemeModeProvider>
  );
}

export { useThemeMode as useMuiThemeMode };
