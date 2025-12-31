"use client";

import React, { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab, useMediaQuery, useTheme } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import StockInvestmentPage from "./StockInvestmentPage";
import CoinInvestmentPage from "./CoinInvestmentPage";

const InvestmentsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: "background.paper",
          border: "1px solid #23272f",
          mb: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" }, 
          gap: { xs: 1.5, sm: 2 }, 
          mb: { xs: 1.5, sm: 2 } 
        }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
              borderRadius: 2,
              p: { xs: 1, sm: 1.5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 }, color: "#fff" }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: "text.primary",
                letterSpacing: 0.5,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" }
              }}
            >
              Investments
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary", 
                mt: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.875rem" }
              }}
            >
              Manage and monitor your investment portfolio
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            mt: { xs: 1.5, sm: 2 },
            "& .MuiTabs-indicator": {
              background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
              height: 3,
              borderRadius: 1,
            },
            "& .MuiTabs-flexContainer": {
              gap: { xs: 0, sm: 1 },
            }
          }}
        >
          <Tab
            icon={<ShowChartIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />}
            iconPosition="start"
            label={isMobile ? "Stocks" : "Stock Investment"}
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
              fontWeight: 600,
              color: "text.secondary",
              minHeight: { xs: 48, sm: 56 },
              px: { xs: 1, sm: 2 },
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
            icon={<CurrencyBitcoinIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />}
            iconPosition="start"
            label={isMobile ? "Coins" : "Coin Investment"}
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
              fontWeight: 600,
              color: "text.secondary",
              minHeight: { xs: 48, sm: 56 },
              px: { xs: 1, sm: 2 },
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
