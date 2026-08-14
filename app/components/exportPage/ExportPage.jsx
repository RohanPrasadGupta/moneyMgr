import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  TextField,
  Stack,
  Tooltip,
  Chip,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { themedCardSx, colors, gradients, currencyBadgeSx } from "../../themeStyles";

const KpiCard = ({ icon: Icon, label, value, gradient, glow }) => (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 3,
      p: { xs: 1.5, sm: 2 },
      background: gradient,
      boxShadow: `0 10px 24px ${alpha(glow, 0.4)}`,
      color: "#fff",
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: -24,
        right: -24,
        width: 90,
        height: 90,
        borderRadius: "50%",
        bgcolor: "rgba(255,255,255,0.14)",
      }}
    />
    {Icon && (
      <Box
        sx={{
          position: "relative",
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Icon sx={{ fontSize: 16, color: "#fff" }} />
      </Box>
    )}
    <Typography
      variant="caption"
      sx={{ position: "relative", fontWeight: 800, letterSpacing: 0.6, opacity: 0.92, display: "block", whiteSpace: "nowrap" }}
    >
      {label.toUpperCase()}
    </Typography>
    <Typography
      variant="h6"
      fontWeight={800}
      sx={{ position: "relative", fontSize: { xs: "0.95rem", sm: "1.1rem" }, mt: 0.25, wordBreak: "break-word", overflowWrap: "break-word", lineHeight: 1.2 }}
    >
      {value}
    </Typography>
  </Box>
);

const SectionHeader = ({ icon: Icon, iconColor = colors.primaryDark, title, subtitle }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
    {Icon && (
      <Box
        sx={{
          width: { xs: 36, sm: 40 },
          height: { xs: 36, sm: 40 },
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${iconColor} 0%, ${alpha(iconColor, 0.65)} 100%)`,
          boxShadow: `0 4px 14px ${alpha(iconColor, 0.45)}`,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: "#fff", fontSize: { xs: 18, sm: 20 } }} />
      </Box>
    )}
    <Box>
      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  </Stack>
);

let jsPDF;

const ExportPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [activeQuickRange, setActiveQuickRange] = useState(30);

  const sectionPaperSx = {
    ...themedCardSx,
    mb: { xs: 3, sm: 4 },
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: { xs: 2, sm: 4 },
    position: "relative",
    overflow: "hidden",
  };

  const extractTextAfterEmoji = (text) => {
    if (!text) return "";

    const emojiTextPattern =
      /^[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}]+\s+(.*)/u;

    const match = text.match(emojiTextPattern);

    return match && match[1] ? match[1] : text;
  };

  useEffect(() => {
    const loadPdfLibs = async () => {
      try {
        const jsPdfModule = await import("jspdf");
        await import("jspdf-autotable");

        jsPDF = jsPdfModule.jsPDF;

        setPdfLoaded(true);
      } catch (err) {
        console.error("Error loading PDF libraries:", err);
        toast.error(
          "Error loading PDF export functionality. Please try again later."
        );
      }
    };

    loadPdfLibs();
  }, []);

  const isDateRangeValid =
    startDate &&
    endDate &&
    (endDate.isAfter(startDate) || endDate.isSame(startDate, "day"));

  const { data: categoryData, isPending: isCategoryPending } = useQuery({
    queryKey: ["exportCategories"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`, {
        method: "GET",
        credentials: "include",
      }).then((res) => res.json()),
  });

  const categories = React.useMemo(() => {
    if (!Array.isArray(categoryData)) return [];
    return categoryData.map((cat) => String(cat?.name || "")).filter(Boolean);
  }, [categoryData]);

  const {
    isPending,
    data: reportData,
    error,
  } = useQuery({
    queryKey: [
      "reportData",
      startDate?.toISOString(),
      endDate?.toISOString(),
      selectedCategory,
    ],
    enabled: Boolean(isDateRangeValid),
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: startDate.startOf("day").toISOString(),
        endDate: endDate.endOf("day").toISOString(),
      });

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/data/report?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      return res.json();
    },
  });

  const filteredData = React.useMemo(
    () => (Array.isArray(reportData?.data) ? reportData.data : []),
    [reportData]
  );

  const handleExportCSV = () => {
    if (!filteredData.length) {
      toast.error("No data available for the selected date range");

      return;
    }

    const headers = [
      "Date",
      "Account",
      "Category",
      "Note",
      "Currency",
      "Type",
      "Amount",
    ];

    const csvData = filteredData.map((item) => [
      dayjs(item.date).format("DD MMM YYYY, HH:mm"),
      item.account,
      extractTextAfterEmoji(String(item.category || "")),
      item.note,
      item.currency,
      item.type,
      item.amount,
    ]);

    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      [
        headers.join(","),
        ...csvData.map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell
            )
            .join(",")
        ),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `moneyMgr_export_${dayjs(startDate).format("YYYYMMDD")}_${dayjs(
        endDate
      ).format("YYYYMMDD")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file has been downloaded successfully!");
  };

  const handleExportPDF = () => {
    if (!filteredData.length) {
      toast.error("No data available for the selected date range");

      return;
    }

    if (!pdfLoaded || !jsPDF) {
      toast(
        "PDF export functionality is still loading. Please try again in a moment.",
        { icon: "⚠️" }
      );

      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        hotfixes: ["px_scaling"],
      });

      doc.setFontSize(18);
      doc.text("Money Manager - Transaction Report [RPG]", 14, 22);

      doc.setFontSize(11);
      doc.text(
        `Date Range: ${startDate.format("DD MMM YYYY")} to ${endDate.format(
          "DD MMM YYYY"
        )}`,
        14,
        32
      );

      const totalExpense = filteredData
        .filter((tx) => tx.type === "Expense")
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      const totalIncome = filteredData
        .filter((tx) => tx.type === "Income")
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      doc.setFontSize(12);
      doc.text(`Total Expense: ${totalExpense} THB`, 14, 42);
      doc.text(`Total Income: ${totalIncome} THB`, 14, 50);
      doc.text(`Net: ${totalIncome - totalExpense} THB`, 14, 58);

      const tableData = filteredData.map((item) => [
        dayjs(item.date).format("DD MMM YYYY, HH:mm"),
        String(item.account || ""),
        extractTextAfterEmoji(String(item.category || "")),

        item.note
          ? String(item.note).substring(0, 20) +
            (String(item.note).length > 20 ? "..." : "")
          : "",
        String(item.currency || ""),
        String(item.type || ""),
        Number(item.amount || 0),
      ]);

      doc.setFont("helvetica", "normal");

      doc.autoTable({
        head: [
          ["Date", "Account", "Category", "Note", "Currency", "Type", "Amount"],
        ],
        body: tableData,
        startY: 65,
        theme: "striped",
        headStyles: {
          fillColor: [239, 83, 80],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: "linebreak",
          font: "helvetica",
          halign: "left",
          minCellHeight: 12,
          valign: "middle",
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
        },
        didDrawCell: (data) => {},
      });

      try {
        doc.save(
          `moneyMgr_export_${dayjs(startDate).format("YYYYMMDD")}_${dayjs(
            endDate
          ).format("YYYYMMDD")}.pdf`
        );
        toast.success("PDF file has been generated and downloaded!");
      } catch (saveErr) {
        console.error("Error saving PDF:", saveErr);
        toast.error("Error saving PDF: " + saveErr.message);
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Error generating PDF: " + err.message);
    }
  };

  const totalExpense = React.useMemo(
    () =>
      filteredData
        .filter((tx) => tx.type === "Expense")
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
    [filteredData]
  );
  const totalIncome = React.useMemo(
    () =>
      filteredData
        .filter((tx) => tx.type === "Income")
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
    [filteredData]
  );

  const applyQuickRange = (days) => {
    const end = dayjs();
    setEndDate(end);
    setStartDate(end.subtract(days, "day"));
    setActiveQuickRange(days);
  };

  const quickRanges = [
    { days: 7, label: "Last 7d" },
    { days: 30, label: "Last 30d" },
    { days: 90, label: "Last 90d" },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        mt: { xs: 1, sm: 3 },
        p: { xs: 1, sm: 3 },
        bgcolor: "background.paper",
        borderRadius: { xs: 0, sm: 3 },
        boxShadow: { xs: 0, sm: 4 },
        minHeight: { xs: 300, sm: 400 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ ...sectionPaperSx, width: "100%", mb: { xs: 3, sm: 4 }, p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ position: "absolute", top: "-50%", right: "-20%", width: "60%", height: "150%", background: "radial-gradient(ellipse at center, rgba(100, 181, 246, 0.15) 0%, transparent 70%)", zIndex: 0 }} />

        <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", lg: "center" }, gap: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: "text.primary", letterSpacing: 0.5, fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" } }}>
                Export Transaction Data
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.875rem" }, maxWidth: 500 }}>
                Pick a date range, preview what will be exported, and download a clean CSV or PDF report in one click.
              </Typography>
            </Box>

            {/* Quick stats — vibrant gradient KPI cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 152px)" },
                gap: { xs: 1.5, sm: 2 },
                width: { xs: "100%", lg: "auto" },
                flexShrink: 0,
              }}
            >
              <KpiCard
                icon={ListAltIcon}
                label="Transactions"
                value={isPending ? "…" : filteredData.length}
                gradient={gradients.primary}
                glow={colors.primaryDark}
              />
              <KpiCard
                icon={TrendingUpIcon}
                label="Income"
                value={isPending ? "…" : `${totalIncome} THB`}
                gradient={gradients.income}
                glow={colors.successDark}
              />
              <KpiCard
                icon={TrendingDownIcon}
                label="Expense"
                value={isPending ? "…" : `${totalExpense} THB`}
                gradient={gradients.expense}
                glow={colors.errorDark}
              />
            </Box>
          </Box>

          {/* Quick range pill toggle */}
          <Stack
            direction="row"
            sx={{ bgcolor: "background.paper", borderRadius: "999px", border: "1px solid", borderColor: "divider", p: 0.4, alignSelf: { xs: "stretch", sm: "flex-start" } }}
          >
            {quickRanges.map((opt) => {
              const active = activeQuickRange === opt.days;
              return (
                <Box
                  key={opt.days}
                  component="button"
                  onClick={() => applyQuickRange(opt.days)}
                  sx={{
                    all: "unset",
                    cursor: "pointer",
                    flex: { xs: 1, sm: "none" },
                    textAlign: "center",
                    px: 1.75,
                    py: 0.75,
                    borderRadius: "999px",
                    fontWeight: active ? 800 : 600,
                    fontSize: "0.8rem",
                    color: active ? "#fff" : "text.secondary",
                    bgcolor: active ? colors.primaryDark : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": { bgcolor: active ? colors.primaryDark : "action.hover" },
                  }}
                >
                  {opt.label}
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ width: "100%", mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ ...sectionPaperSx, width: "100%" }}>
          <SectionHeader
            icon={FilterAltIcon}
            iconColor={colors.primaryDark}
            title="Filters"
            subtitle="Narrow the export down to a date range and, optionally, a single category."
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ mb: 2 }}
            >
              <FormControl>
                <FormLabel
                  sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CalendarMonthIcon fontSize="small" sx={{ color: colors.primaryDark }} />
                  <span>Start Date</span>
                </FormLabel>
                <DatePicker
                  value={startDate}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                    setActiveQuickRange(null);
                  }}
                  disableFuture
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      error: !isDateRangeValid,
                      helperText: !isDateRangeValid ? "Invalid date range" : "",
                    },
                  }}
                  sx={{ minWidth: isMobile ? "100%" : 220 }}
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CalendarMonthIcon fontSize="small" sx={{ color: colors.primaryDark }} />
                  <span>End Date</span>
                </FormLabel>
                <DatePicker
                  value={endDate}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                    setActiveQuickRange(null);
                  }}
                  disableFuture
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      error: !isDateRangeValid,
                      helperText: !isDateRangeValid
                        ? "End date must be after start date"
                        : "",
                    },
                  }}
                  sx={{ minWidth: isMobile ? "100%" : 220 }}
                />
              </FormControl>

              <FormControl sx={{ minWidth: isMobile ? "100%" : 260 }}>
                <FormLabel sx={{ mb: 1 }}>Category (Optional)</FormLabel>
                <TextField
                  select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={isCategoryPending}
                  helperText="Leave as All Categories to export everything"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Stack>
          </LocalizationProvider>

          {isPending ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress size={32} sx={{ color: "primary.main" }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Error loading transaction data. Please try again later.
            </Alert>
          ) : (
            <Alert
              severity={filteredData.length ? "info" : "warning"}
              sx={{ borderRadius: 2 }}
            >
              {filteredData.length
                ? `${filteredData.length} transactions found for the selected filters.`
                : "No transactions found for the selected filters."}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Download options */}
      <Box sx={{ width: "100%", mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ ...sectionPaperSx, width: "100%" }}>
          <SectionHeader
            icon={FileDownloadIcon}
            iconColor={colors.successDark}
            title="Download options"
            subtitle="Choose a format for the filtered transactions above."
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
            <Box
              sx={{
                flex: 1,
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: gradients.primary,
                    boxShadow: `0 4px 14px ${alpha(colors.primaryDark, 0.4)}`,
                    flexShrink: 0,
                  }}
                >
                  <InsertDriveFileIcon sx={{ color: "#fff", fontSize: 20 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  CSV Export
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Best for spreadsheet analysis and bulk edits.
              </Typography>
              <Tooltip title="Download as CSV for spreadsheet applications">
                <span>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<InsertDriveFileIcon />}
                    onClick={handleExportCSV}
                    disabled={!isDateRangeValid || isPending || !filteredData.length}
                    sx={{
                      py: 1.3,
                      borderRadius: "999px",
                      textTransform: "none",
                      fontWeight: 700,
                      background: gradients.primary,
                      boxShadow: `0 8px 20px ${alpha(colors.primaryDark, 0.35)}`,
                      "&:hover": {
                        background: gradients.primaryHover,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Export as CSV
                  </Button>
                </span>
              </Tooltip>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: gradients.expense,
                    boxShadow: `0 4px 14px ${alpha(colors.errorDark, 0.4)}`,
                    flexShrink: 0,
                  }}
                >
                  <PictureAsPdfIcon sx={{ color: "#fff", fontSize: 20 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  PDF Export
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Best for printing, reporting, and sharing snapshots.
              </Typography>
              <Tooltip title="Download as PDF for printing or sharing">
                <span>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportPDF}
                    disabled={
                      !isDateRangeValid ||
                      isPending ||
                      !filteredData.length ||
                      !pdfLoaded
                    }
                    sx={{
                      py: 1.3,
                      borderRadius: "999px",
                      textTransform: "none",
                      fontWeight: 700,
                      background: gradients.expense,
                      boxShadow: `0 8px 20px ${alpha(colors.errorDark, 0.35)}`,
                      "&:hover": {
                        background: gradients.expenseHover,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Export as PDF
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Preview */}
      {!isPending && filteredData.length > 0 && (
        <Box sx={{ width: "100%" }}>
          <Box sx={{ ...sectionPaperSx, width: "100%", mb: 0 }}>
            <SectionHeader
              icon={ReceiptLongIcon}
              iconColor={colors.warning}
              title="Preview"
              subtitle={`Showing ${Math.min(5, filteredData.length)} of ${filteredData.length} transactions that will be exported.`}
            />

            <Box
              sx={{
                bgcolor: "background.default",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                p: { xs: 1.5, sm: 2 },
                maxHeight: 400,
                overflow: "auto",
              }}
            >
              <Box component="ul" sx={{ pl: 0, m: 0, listStyleType: "none" }}>
                {filteredData.slice(0, 5).map((tx) => {
                  const isExpense = tx.type === "Expense";
                  const accent = isExpense ? colors.errorDark : colors.successDark;
                  return (
                    <Box
                      component="li"
                      key={tx._id}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderLeft: "4px solid",
                        borderColor: accent,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        "&:last-of-type": { mb: 0 },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight={700}>
                          {tx.category}
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Typography variant="body2" fontWeight={700} sx={{ color: accent }}>
                            {isExpense ? "-" : "+"}
                            {tx.amount}
                          </Typography>
                          <Chip
                            label={tx.currency || "THB"}
                            size="small"
                            sx={{ ...currencyBadgeSx(tx.currency || "THB"), height: 20, fontSize: "0.65rem" }}
                          />
                        </Stack>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(tx.date).format("YYYY-MM-DD")} • {tx.account}
                        {tx.note && ` • ${tx.note}`}
                      </Typography>
                    </Box>
                  );
                })}
                {filteredData.length > 5 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "center", pt: 0.5 }}
                  >
                    ...and {filteredData.length - 5} more transactions
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ExportPage;
