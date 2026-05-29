"use client";

import React, { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab, useMediaQuery, useTheme, Chip, Stack } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import SavingsIcon from "@mui/icons-material/Savings";
import StockInvestmentPage from "./StockInvestmentPage";
import CoinInvestmentPage from "./CoinInvestmentPage";
import SipInvestmentPage from "./SipInvestmentPage";
import { themedCardSx } from "../../themeStyles";

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
        bgcolor: "background.paper",
        position: "relative",
        overflowX: "hidden",
        overflowY: "visible",
      }}
    >
      {/* Subtle background accents */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(500px at 20% 20%, rgba(255,153,102,0.08), transparent), radial-gradient(500px at 80% 0%, rgba(255,94,98,0.06), transparent)",
        }}
      />

      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          ...themedCardSx,
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,153,102,0.08), rgba(255,94,98,0.04))",
            opacity: 0.7,
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" }, 
            gap: { xs: 1.5, sm: 2 }, 
            mb: { xs: 1.5, sm: 2 } 
          }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #ef5350, #e53935)",
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

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: { xs: 1, sm: 1.5 } }}>
            <Chip label="Stocks" icon={<ShowChartIcon sx={{ fontSize: 18 }} />} sx={{ border: "1px solid", borderColor: "divider" }} />
            <Chip label="Crypto" icon={<CurrencyBitcoinIcon sx={{ fontSize: 18 }} />} sx={{ border: "1px solid", borderColor: "divider" }} />
            <Chip label="SIP" icon={<SavingsIcon sx={{ fontSize: 18 }} />} sx={{ border: "1px solid", borderColor: "divider" }} />
            <Chip label="Multi-asset view" sx={{ border: "1px solid", borderColor: "divider", bgcolor: "rgba(255,255,255,0.04)" }} />
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            position: "relative",
            zIndex: 1,
            mt: { xs: 1.5, sm: 2 },
            "& .MuiTabs-indicator": {
              background: "linear-gradient(135deg, #ef5350, #e53935)",
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
                color: "error.main",
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
                color: "error.main",
              },
              "&:hover": {
                bgcolor: "rgba(239, 83, 80, 0.08)",
              },
              transition: "all 0.3s ease",
            }}
          />
          <Tab
            icon={<SavingsIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />}
            iconPosition="start"
            label={isMobile ? "SIP" : "SIP Investment"}
            sx={{
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
              fontWeight: 600,
              color: "text.secondary",
              minHeight: { xs: 48, sm: 56 },
              px: { xs: 1, sm: 2 },
              "&.Mui-selected": {
                color: "#ce93d8",
              },
              "&:hover": {
                bgcolor: "rgba(206, 147, 216, 0.08)",
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
        {activeTab === 2 && <SipInvestmentPage />}
      </Box>
    </Box>
  );
};

export default InvestmentsPage;
