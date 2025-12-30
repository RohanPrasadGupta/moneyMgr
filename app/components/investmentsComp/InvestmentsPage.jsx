"use client";

import React, { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import StockInvestmentPage from "./StockInvestmentPage";
import CoinInvestmentPage from "./CoinInvestmentPage";

const InvestmentsPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        p: 4,
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid #23272f",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 36, color: "#fff" }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: "text.primary",
                letterSpacing: 0.5,
              }}
            >
              Investments
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Manage and monitor your investment portfolio
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mt: 2,
            "& .MuiTabs-indicator": {
              background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
              height: 3,
              borderRadius: 1,
            },
          }}
        >
          <Tab
            icon={<ShowChartIcon />}
            iconPosition="start"
            label="Stock Investment"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              color: "text.secondary",
              minHeight: 56,
              "&.Mui-selected": {
                color: "#ff9966",
              },
              "&:hover": {
                bgcolor: "rgba(255, 153, 102, 0.08)",
              },
              transition: "all 0.3s ease",
            }}
          />
          <Tab
            icon={<CurrencyBitcoinIcon />}
            iconPosition="start"
            label="Coin Investment"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              color: "text.secondary",
              minHeight: 56,
              "&.Mui-selected": {
                color: "#ff5e62",
              },
              "&:hover": {
                bgcolor: "rgba(255, 94, 98, 0.08)",
              },
              transition: "all 0.3s ease",
            }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && <StockInvestmentPage />}
        {activeTab === 1 && <CoinInvestmentPage />}
      </Box>
    </Box>
  );
};

export default InvestmentsPage;
