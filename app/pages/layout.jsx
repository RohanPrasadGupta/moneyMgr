"use client";
import { Box } from "@mui/material";
import React from "react";
import Navbar from "../components/navbar/Navbar";
import SpeedDialNavbar from "../components/navbar/SpeedDialNavbar";
import QueryProvider from "./QueryProvider";
import { useMediaQuery, useTheme } from "@mui/material";
import { themedCardSx } from "../themeStyles";

const layout = ({ children }) => {
  const theme = useTheme();
  const isTabletOrBelow = useMediaQuery(theme.breakpoints.down("md"));
  const isBigScreen = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isTabletOrBelow && (
        <Box
          sx={{
            position: "fixed",
            left: 16,
            bottom: 24,
            zIndex: 1500,
          }}
        >
          <SpeedDialNavbar />
        </Box>
      )}

      {isBigScreen && (
        <Box
          sx={{
            // ...themedCardSx,
            width: 240,
            marginLeft: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 3,
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Navbar />
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 4 },
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          boxSizing: "border-box",
          maxWidth: "100vw",
          // Firefox
          scrollbarWidth: "thin",
          scrollbarColor: "#23272f transparent",
          // Webkit
          "&::-webkit-scrollbar": {
            width: 10,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(180deg, #3a3f47 0%, #252a33 100%)",
            borderRadius: 8,
            border: "2px solid transparent",
            backgroundClip: "padding-box",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#64b5f6",
          },
        }}
      >
        <QueryProvider>{children}</QueryProvider>
      </Box>
    </Box>
  );
};

export default layout;
