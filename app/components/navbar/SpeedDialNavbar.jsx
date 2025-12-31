"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  const actions = [
    { 
      icon: <HomeIcon />, 
      name: "Home", 
      link: "/pages/home",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#667eea"
    },
    {
      icon: <BarChartIcon />,
      name: "Analysis",
      link: "/pages/analysis",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "#f5576c"
    },
    {
      icon: <FileDownloadIcon />,
      name: "Export Data",
      link: "/pages/exportinfo",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      color: "#4facfe"
    },
    {
      icon: <CategoryIcon />,
      name: "Categories",
      link: "/pages/categories",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      color: "#fa709a"
    },
    {
      icon: <TrendingUpIcon />,
      name: "Stock Analysis",
      link: "/pages/stocks",
      gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      color: "#30cfd0"
    },
    {
      icon: <AccountBalanceIcon />,
      name: "Investments",
      link: "/pages/investments",
      gradient: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
      color: "#ff9966"
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
          boxShadow: "0 4px 15px rgba(255, 153, 102, 0.4)",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)",
            boxShadow: "0 6px 20px rgba(255, 153, 102, 0.6)",
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
        <SpeedDialAction
          key={action.name}
          icon={React.cloneElement(action.icon, {
            sx: {
              color: "#fff",
              fontSize: 22,
            },
          })}
          tooltipPlacement="right"
          slotProps={{
            tooltip: {
              open: true,
              title: (
                <span style={{ whiteSpace: "nowrap" }}>{action.name}</span>
              ),
              sx: { 
                whiteSpace: "nowrap",
                bgcolor: "background.paper",
                color: "text.primary",
                border: "1px solid #23272f",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              },
            },
          }}
          sx={{
            color: "#fff",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
          onClick={() => {
            setOpen(false);
            setTimeout(() => {
              router.push(action.link);
            }, 100);
          }}
        />
      ))}
    </SpeedDial>
  );
};

export default SpeedDialNavbar;
