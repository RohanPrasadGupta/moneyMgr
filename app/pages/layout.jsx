"use client";
import { Box } from "@mui/material";
import React from "react";
import Navbar from "../components/navbar/Navbar";
import SpeedDialNavbar from "../components/navbar/SpeedDialNavbar";
import QueryProvider from "./QueryProvider";
import { useMediaQuery, useTheme } from "@mui/material";

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
            width: 240,
            // bgcolor: "background.paper",
            // borderRight: "1px solid #23272f",
            marginLeft: 2,
            boxShadow: 1,
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
          scrollbarColor: "#3a3f44 transparent",
          // Webkit
          "&::-webkit-scrollbar": {
            width: 10,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(180deg, #44494f 0%, #2a2a2f 100%)",
            borderRadius: 8,
            border: "2px solid transparent",
            backgroundClip: "padding-box",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#616568",
          },
        }}
      >
        <QueryProvider>{children}</QueryProvider>
      </Box>
    </Box>
  );
};

export default layout;
