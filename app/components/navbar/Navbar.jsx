"use client";

import React from "react";
import { Box, Typography, Button, Stack, Chip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CategoryIcon from "@mui/icons-material/Category";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const navItems = [
  {
    label: "Home",
    link: "/pages/home",
    icon: <HomeIcon />,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#667eea",
  },
  {
    label: "Analysis",
    link: "/pages/analysis",
    icon: <BarChartIcon />,
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#f5576c",
  },
  {
    label: "Export Data",
    link: "/pages/exportinfo",
    icon: <FileDownloadIcon />,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "#4facfe",
  },
  {
    label: "Categories",
    link: "/pages/categories",
    icon: <CategoryIcon />,
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    color: "#fa709a",
  },
  {
    label: "Stock Analysis",
    link: "/pages/stocks",
    icon: <TrendingUpIcon />,
    gradient: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
    color: "#00a3ff",
  },
  {
    label: "Investments",
    link: "/pages/investments",
    icon: <AccountBalanceIcon />,
    gradient: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
    color: "#ff9966",
  },
];

const Navbar = () => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: theme.palette.mode === "dark" ? 6 : 4,
        py: 3,
        px: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundImage:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at top right, rgba(255,153,102,0.16), transparent 45%), radial-gradient(circle at bottom left, rgba(100,181,246,0.12), transparent 42%)"
            : "radial-gradient(circle at top right, rgba(255,153,102,0.13), transparent 45%), radial-gradient(circle at bottom left, rgba(100,181,246,0.10), transparent 42%)",
      }}
    >
      <Stack spacing={1} sx={{ mb: 3, px: 1 }}>
        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 0.4 }}>
          Money Manager
        </Typography>
      </Stack>
      <Stack spacing={2.5} padding={2}>
        {navItems.map((item) => {
          const active = pathname === item.link;
          return (
            <Button
              key={item.link}
              variant={active ? "contained" : "outlined"}
              startIcon={item.icon}
              onClick={() => router.push(item.link)}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                justifyContent: "flex-start",
                fontWeight: active ? 800 : 700,
                fontSize: "0.98rem",
                width: "100%",
                py: 1.25,
                px: 2,
                color: active ? "#fff" : "text.primary",
                whiteSpace: "nowrap",
                borderColor: active ? "transparent" : alpha(item.color, 0.45),
                bgcolor: active ? "transparent" : alpha(item.color, 0.08),
                background: active ? item.gradient : undefined,
                boxShadow: active
                  ? `0 10px 22px ${alpha(item.color, 0.38)}`
                  : `0 2px 10px ${alpha(item.color, 0.16)}`,
                transition: "all 0.22s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  borderColor: alpha(item.color, 0.7),
                  bgcolor: active ? "transparent" : alpha(item.color, 0.13),
                  boxShadow: active
                    ? `0 12px 24px ${alpha(item.color, 0.46)}`
                    : `0 6px 16px ${alpha(item.color, 0.28)}`,
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};

export default Navbar;
