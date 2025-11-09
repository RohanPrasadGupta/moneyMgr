"use client";
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import dotenv from "dotenv";

dotenv.config();

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/pages/home");
  }, [router]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default Page;
