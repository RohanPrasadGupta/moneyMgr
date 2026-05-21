"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import HomeIcon from "@mui/icons-material/Home";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import BarChartIcon from "@mui/icons-material/BarChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CategoryIcon from "@mui/icons-material/Category";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WidgetsIcon from "@mui/icons-material/Widgets";

const SpeedDialNavbar = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const actions = [
    {
      icon: <HomeIcon />,
      name: "Home",
      link: "/pages/home",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#667eea",
    },
    {
      icon: <BarChartIcon />,
      name: "Analysis",
      link: "/pages/analysis",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "#f5576c",
    },
    {
      icon: <FileDownloadIcon />,
      name: "Export Data",
      link: "/pages/exportinfo",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      color: "#4facfe",
    },
    {
      icon: <CategoryIcon />,
      name: "Categories",
      link: "/pages/categories",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      color: "#fa709a",
    },
    {
      icon: <TrendingUpIcon />,
      name: "Stock Analysis",
      link: "/pages/stocks",
      gradient: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
      color: "#00a3ff",
    },
    {
      icon: <AccountBalanceIcon />,
      name: "Investments",
      link: "/pages/investments",
      gradient: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
      color: "#ff9966",
    },
  ];

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
        ".MuiSpeedDial-fab": {
          background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
          color: "#fff",
          width: 58,
          height: 58,
          boxShadow: "0 8px 24px rgba(255, 94, 98, 0.42)",
          transition: "all 0.24s ease",
          "&:hover": {
            background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
            boxShadow: "0 12px 26px rgba(255, 94, 98, 0.52)",
            transform: "scale(1.05)",
          },
        },
      }}
      icon={<WidgetsIcon sx={{ color: "#fff" }} />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      direction="up"
    >
      {actions.map((action, idx) => (
        (() => {
          const isActive = pathname === action.link;
          return (
            <SpeedDialAction
              key={action.name}
              icon={React.cloneElement(action.icon, {
                sx: {
                  color: "#fff",
                  fontSize: 21,
                },
              })}
              tooltipPlacement="right"
              slotProps={{
                tooltip: {
                  open: true,
                  title: <span style={{ whiteSpace: "nowrap" }}>{action.name}</span>,
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
                  color: "#fff",
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
        })()
      ))}
    </SpeedDial>
  );
};

export default SpeedDialNavbar;
