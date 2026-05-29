import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CategoryIcon from "@mui/icons-material/Category";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { colors, gradients } from "./themeStyles";

/** Unified nav styling — primary blue family for all routes */
const navAccent = colors.primary;

export const navItems = [
  { label: "Home", link: "/pages/home", icon: <HomeIcon /> },
  { label: "Analysis", link: "/pages/analysis", icon: <BarChartIcon /> },
  { label: "Export Data", link: "/pages/exportinfo", icon: <FileDownloadIcon /> },
  { label: "Categories", link: "/pages/categories", icon: <CategoryIcon /> },
  { label: "Stock Analysis", link: "/pages/stocks", icon: <TrendingUpIcon /> },
  { label: "Investments", link: "/pages/investments", icon: <AccountBalanceIcon /> },
].map((item) => ({
  ...item,
  gradient: gradients.primary,
  color: navAccent,
}));

export const speedDialFabSx = {
  background: gradients.primary,
  color: "common.white",
  width: 58,
  height: 58,
  boxShadow: `0 8px 24px rgba(100, 181, 246, 0.42)`,
  transition: "all 0.24s ease",
  "&:hover": {
    background: gradients.primaryHover,
    boxShadow: `0 12px 26px rgba(100, 181, 246, 0.52)`,
    transform: "scale(1.05)",
  },
};
