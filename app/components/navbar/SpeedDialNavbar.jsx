"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { navItems, speedDialFabSx } from "../../navConfig";

const SpeedDialNavbar = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <SpeedDial
      ariaLabel="SpeedDial navigation"
      sx={{
        position: "static",
        m: 0,
        zIndex: 1500,
        ".MuiSpeedDial-fab": speedDialFabSx,
      }}
      icon={<WidgetsIcon sx={{ color: "common.white" }} />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      direction="up"
    >
      {navItems.map((action) => {
        const isActive = pathname === action.link;
        return (
          <SpeedDialAction
            key={action.name}
            icon={React.cloneElement(action.icon, {
              sx: {
                color: "common.white",
                fontSize: 21,
              },
            })}
            tooltipPlacement="right"
            slotProps={{
              tooltip: {
                open: true,
                title: <span style={{ whiteSpace: "nowrap" }}>{action.label}</span>,
                sx: {
                  whiteSpace: "nowrap",
                  bgcolor: "background.paper",
                  color: "text.primary",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: theme.palette.mode === "dark" ? 6 : 4,
                  fontWeight: 600,
                },
              },
            }}
            FabProps={{
              sx: {
                background: action.gradient,
                color: "common.white",
                boxShadow: isActive
                  ? `0 12px 24px ${alpha(action.color, 0.52)}`
                  : `0 8px 18px ${alpha(action.color, 0.34)}`,
                border: isActive
                  ? `2px solid ${alpha("#ffffff", 0.8)}`
                  : `1px solid ${alpha("#ffffff", 0.35)}`,
                transition: "all 0.22s ease",
                "&:hover": {
                  transform: "translateY(-2px) scale(1.06)",
                  boxShadow: `0 14px 26px ${alpha(action.color, 0.56)}`,
                },
              },
            }}
            sx={{
              transition: "transform 0.22s ease",
            }}
            onClick={() => {
              setOpen(false);
              setTimeout(() => {
                router.push(action.link);
              }, 100);
            }}
          />
        );
      })}
    </SpeedDial>
  );
};

export default SpeedDialNavbar;
