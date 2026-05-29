import { Box } from "@mui/material";
import React from "react";

const TitleHeader = ({ text }) => {
  return (
    <Box sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "text.primary" }}>
      {text}
    </Box>
  );
};

export default TitleHeader;
