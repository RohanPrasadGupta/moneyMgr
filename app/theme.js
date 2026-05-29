import { createTheme } from "@mui/material/styles";
import { colors } from "./themeStyles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      contrastText: colors.bg.default,
    },
    secondary: {
      main: colors.text.secondary,
      contrastText: colors.bg.default,
    },
    success: {
      main: colors.success,
      dark: colors.successDark,
      contrastText: colors.bg.default,
    },
    error: {
      main: colors.error,
      dark: colors.errorDark,
      contrastText: colors.bg.default,
    },
    warning: {
      main: colors.warning,
      contrastText: colors.bg.default,
    },
    info: {
      main: colors.primary,
      contrastText: colors.bg.default,
    },
    background: {
      default: colors.bg.default,
      paper: colors.bg.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    divider: colors.border,
    common: {
      white: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
    fontWeightBold: 700,
    h4: {
      fontWeight: 700,
      color: colors.text.heading,
    },
    h5: {
      fontWeight: 700,
      color: colors.text.heading,
    },
    h6: {
      fontWeight: 700,
      color: colors.text.heading,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg.default,
          color: colors.text.primary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: colors.bg.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 700,
          transition:
            "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
        },
        contained: {
          boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
          "&:hover": {
            boxShadow: "0 10px 20px rgba(0,0,0,0.26)",
            transform: "translateY(-1px)",
            filter: "brightness(1.03)",
          },
          "&:active": {
            transform: "translateY(0px)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: colors.primary,
        },
      },
    },
  },
});

export default theme;
