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

const Homepage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
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
