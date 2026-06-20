"use client";
import { Box, Fab, Tooltip, Grid, Paper, Typography, Stack } from "@mui/material";
import React, { useState } from "react";
import TransactionView from "./transactions/TransactionView";
import AddTransaction from "./transactions/AddTransaction";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { gradients, statCardSx, colors } from "../themeStyles";
import { alpha } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";

function SummaryCardSkeleton() {
  return (
    <Box
      sx={{
        height: 100,
        borderRadius: 3,
        bgcolor: alpha(colors.text.secondary, 0.08),
        border: "1px solid",
        borderColor: "divider",
        animation: "pulse 1.5s ease-in-out infinite",
        "@keyframes pulse": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.4 },
          "100%": { opacity: 1 },
        },
      }}
    />
  );
}

const formatAmount = (amount) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

function SummaryCards() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleString("en-US", { month: "long" });

  const { data, isLoading } = useQuery({
    queryKey: ["getMonthlyTransactions", year, month],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/${year}/${month}`, {
        method: "GET",
        credentials: "include",
      }).then((res) => res.json()),
    enabled: Boolean(year && month),
    staleTime: 0,
  });

  const transactions = data?.data || [];

  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach((tx) => {
    if (tx.type === "Income") totalIncome += Number(tx.amount);
    else if (tx.type === "Expense") totalExpense += Number(tx.amount);
  });
  const netBalance = totalIncome - totalExpense;

  const cards = [
    {
      label: "This Month's Income",
      value: totalIncome,
      icon: TrendingUpIcon,
      variant: "success",
      color: colors.success,
    },
    {
      label: "This Month's Expense",
      value: totalExpense,
      icon: TrendingDownIcon,
      variant: "error",
      color: colors.error,
    },
    {
      label: "Net Balance",
      value: netBalance,
      icon: AccountBalanceWalletIcon,
      variant: netBalance >= 0 ? "primary" : "error",
      color: netBalance >= 0 ? colors.primary : colors.error,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Grid item xs={12} sm={4} key={card.label}>
            {isLoading ? (
              <SummaryCardSkeleton />
            ) : (
              <Paper sx={{ ...statCardSx(card.variant), display: "flex", flexDirection: "column", gap: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Icon sx={{ fontSize: 20, color: card.color }} />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    {card.label}
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={700} sx={{ color: card.color }}>
                  {formatAmount(card.value)}
                </Typography>
              </Paper>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}

const Homepage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      <SummaryCards />
      <TransactionView />
      <Tooltip title="Add Transaction" placement="left">
        <Fab
          aria-label="add"
          onClick={() => setAddModalOpen(true)}
          sx={{
            position: "fixed",
            right: 15,
            bottom: 25,
            zIndex: 1300,
            color: "common.white",
            background: gradients.primary,
            boxShadow: 6,
            "&:hover": {
              background: gradients.primaryHover,
            },
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      <AddTransaction open={addModalOpen} setAddModalOpen={setAddModalOpen} />
    </Box>
  );
};

export default Homepage;
