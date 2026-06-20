"use client";

import React from "react";
import { Box, Typography, Button, Stack, IconButton, Tooltip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "../../navConfig";
import { navbarRadialBg } from "../../themeStyles";
import { useThemeMode } from "../../context/ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

const Navbar = () => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleTheme } = useThemeMode();

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
        backgroundImage: navbarRadialBg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack spacing={1} sx={{ mb: 3, px: 1 }}>
        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 0.4 }}>
          Money Manager
        </Typography>
      </Stack>
      <Stack spacing={2.5} padding={2} sx={{ flex: 1 }}>
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
                color: active ? "common.white" : "text.primary",
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

      {/* Bottom controls */}
      <Box sx={{ px: 2, mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* Theme toggle */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {mode === "dark" ? "Dark mode" : "Light mode"}
          </Typography>
          <Tooltip title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) },
              }}
            >
              {mode === "dark" ? (
                <Brightness7Icon sx={{ fontSize: 18, color: "primary.main" }} />
              ) : (
                <Brightness4Icon sx={{ fontSize: 18, color: "primary.main" }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
