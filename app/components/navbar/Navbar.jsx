"use client";

import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CategoryIcon from "@mui/icons-material/Category";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
// use native anchors to force full page reloads

const Navbar = () => {
  const router = useRouter();
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        textAlign: "center",
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 2,
        py: 3,
        px: 2,
        border: "1px solid #23272f",
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{ mb: 4, letterSpacing: 1, color: "text.primary" }}
      >
        Money Manager
      </Typography>
      <Stack spacing={2.5} padding={2}>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          sx={{
            borderRadius: "16px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            width: "100%",
            py: 1.5,
            px: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
              boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
          }}
          onClick={() => router.push("/pages/home")}
        >
          Home
        </Button>
        <Button
          variant="contained"
          startIcon={<BarChartIcon />}
          sx={{
            borderRadius: "16px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            width: "100%",
            py: 1.5,
            px: 3,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            boxShadow: "0 4px 15px rgba(245, 87, 108, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
              boxShadow: "0 6px 20px rgba(245, 87, 108, 0.6)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
          }}
          onClick={() => router.push("/pages/analysis")}
        >
          Analysis
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          sx={{
            borderRadius: "16px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            width: "100%",
            py: 1.5,
            px: 3,
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
              boxShadow: "0 6px 20px rgba(79, 172, 254, 0.6)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
          }}
          onClick={() => router.push("/pages/exportinfo")}
        >
          Export Data
        </Button>
        <Button
          variant="contained"
          startIcon={<CategoryIcon />}
          sx={{
            borderRadius: "16px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            width: "100%",
            py: 1.5,
            px: 3,
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            boxShadow: "0 4px 15px rgba(250, 112, 154, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #fee140 0%, #fa709a 100%)",
              boxShadow: "0 6px 20px rgba(250, 112, 154, 0.6)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
          }}
          onClick={() => router.push("/pages/categories")}
        >
          Categories
        </Button>
        <Button
          variant="contained"
          startIcon={<TrendingUpIcon />}
          sx={{
            borderRadius: "16px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            whiteSpace: "nowrap",
            width: "100%",
            py: 1.5,
            px: 3,
            background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
            boxShadow: "0 4px 15px rgba(48, 207, 208, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #330867 0%, #30cfd0 100%)",
              boxShadow: "0 6px 20px rgba(48, 207, 208, 0.6)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
          }}
          onClick={() => router.push("/pages/stocks")}
        >
          Stock Analysis
        </Button>
        <Button
          variant="contained"
          startIcon={<AccountBalanceIcon />}
          sx={{
            borderRadius: "16px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            width: "100%",
            py: 1.5,
            px: 3,
            background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
            boxShadow: "0 4px 15px rgba(255, 153, 102, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
              boxShadow: "0 6px 20px rgba(255, 153, 102, 0.6)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
          }}
          onClick={() => router.push("/pages/investments")}
        >
          Investments
        </Button>
      </Stack>
    </Box>
  );
};

export default Navbar;
