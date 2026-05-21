import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Light blue
      contrastText: "#0d1117",
    },
    secondary: {
      main: "#f48fb1", // Pink accent
      contrastText: "#0d1117",
    },
    success: {
      main: "#66bb6a",
      contrastText: "#0d1117",
    },
    error: {
      main: "#ef5350",
      contrastText: "#0d1117",
    },
    info: {
      main: "#29b6f6",
      contrastText: "#0d1117",
    },
    background: {
      default: "#121212", // true dark
      paper: "#1e1e1e", // slightly lighter for cards
    },
    text: {
      primary: "#f5f6fa", // bright for dark bg
      secondary: "#b0b8c1", // muted but visible
      disabled: "#6b778c", // for disabled text
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
    fontWeightBold: 700,
    h4: {
      fontWeight: 700,
      color: "#e3eafc",
    },
    h5: {
      fontWeight: 700,
      color: "#e3eafc",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: 1,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 700,
          transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
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
  },
  shape: {
    borderRadius: 14,
  },
});

export default theme;
