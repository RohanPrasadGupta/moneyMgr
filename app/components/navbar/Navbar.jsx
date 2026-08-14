"use client";

import React from "react";
import { Box, Typography, Stack, IconButton, Tooltip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "../../navConfig";
import { navbarRadialBg, gradients, colors } from "../../themeStyles";
import { useThemeMode } from "../../context/ThemeContext";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
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
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3, px: 1 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            background: gradients.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 16px ${alpha(colors.primary, 0.35)}`,
            flexShrink: 0,
          }}
        >
          <AccountBalanceWalletIcon sx={{ color: "common.white", fontSize: 21 }} />
        </Box>
        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.3, lineHeight: 1.15 }}>
          Money Manager
        </Typography>
      </Stack>

      <Stack spacing={0.75} padding={1} sx={{ flex: 1 }}>
        {navItems.map((item) => {
          const active = pathname === item.link;
          return (
            <Box
              key={item.link}
              component="button"
              onClick={() => router.push(item.link)}
              sx={{
                all: "unset",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
                boxSizing: "border-box",
                borderRadius: "999px",
                py: 1,
                pl: 1,
                pr: 2,
                bgcolor: active ? "transparent" : "transparent",
                background: active ? item.gradient : undefined,
                boxShadow: active ? `0 8px 20px ${alpha(item.color, 0.4)}` : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: active ? undefined : alpha(item.color, 0.08),
                  transform: "translateX(2px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: active ? alpha("#ffffff", 0.22) : alpha(item.color, 0.12),
                }}
              >
                {React.cloneElement(item.icon, {
                  sx: { fontSize: 18, color: active ? "common.white" : item.color },
                })}
              </Box>
              <Typography
                sx={{
                  fontWeight: active ? 800 : 600,
                  fontSize: "0.9rem",
                  color: active ? "common.white" : "text.primary",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {/* Bottom controls */}
      <Box sx={{ px: 1.5, mt: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "999px",
            py: 0.75,
            px: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {mode === "dark" ? "Dark mode" : "Light mode"}
          </Typography>
          <Tooltip title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                width: 30,
                height: 30,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.18) },
              }}
            >
              {mode === "dark" ? (
                <Brightness7Icon sx={{ fontSize: 16, color: "primary.main" }} />
              ) : (
                <Brightness4Icon sx={{ fontSize: 16, color: "primary.main" }} />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};

export default Navbar;
