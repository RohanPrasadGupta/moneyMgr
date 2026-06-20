"use client";
import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <Paper sx={{ p: 4, textAlign: "center", maxWidth: 480, borderRadius: 3, border: "1px solid", borderColor: "error.main" }}>
            <ErrorOutlineIcon sx={{ fontSize: 56, color: "error.main", mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>Something went wrong</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </Typography>
            <Button variant="contained" onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
