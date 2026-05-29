"use client";

import React from "react";
import { Box, Typography, Button, Stack, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "../../navConfig";
import { navbarRadialBg } from "../../themeStyles";

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
        backgroundImage: navbarRadialBg,
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
    </Box>
  );
};

export default Navbar;
