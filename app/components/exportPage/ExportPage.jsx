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
  Stack,
  Divider,
  Tooltip,
  Snackbar,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TitleHeader from "../header/TitleHeader";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

let jsPDF;

const ExportPage = () => {
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [pdfLoaded, setPdfLoaded] = useState(false);

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

  const {
    isPending,
    data: allTransactionData,
    error,
  } = useQuery({
    queryKey: ["getAllTransactionData"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data`, {
        method: "GET",
        credentials: "include",
      }).then((res) => res.json()),
  });

  const filteredData = React.useMemo(() => {
    if (!allTransactionData?.data) return [];
    return allTransactionData.data.filter((tx) => {
      const txDate = dayjs(tx.date);
      return (
        (txDate.isAfter(startDate, "day") || txDate.isSame(startDate, "day")) &&
        (txDate.isBefore(endDate, "day") || txDate.isSame(endDate, "day"))
      );
    });
  }, [allTransactionData, startDate, endDate]);

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

  const isDateRangeValid =
    (startDate && endDate && endDate.isAfter(startDate)) ||
    endDate.isSame(startDate, "day");

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        mt: { xs: 1, sm: 3 },
        p: { xs: 2, sm: 3 },
        bgcolor: "background.paper",
        borderRadius: { xs: 0, sm: 3 },
        boxShadow: { xs: 0, sm: 4 },
        minHeight: { xs: 500, sm: 500 },
      }}
    >
      <TitleHeader text="Export Transaction Data" />

      <Paper
        elevation={0}
        sx={{ p: 3, bgcolor: "rgba(0,0,0,0.02)", borderRadius: 2, mb: 3 }}
      >
        <Typography variant="body1" sx={{ mb: 2 }}>
          Select a date range to export your transaction data.
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <FormControl>
              <FormLabel
                sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <CalendarMonthIcon fontSize="small" color="primary" />
                <span>Start Date</span>
              </FormLabel>
              <DatePicker
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                disableFuture
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    error: !isDateRangeValid,
                    helperText: !isDateRangeValid ? "Invalid date range" : "",
                  },
                }}
                sx={{ minWidth: 200 }}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <CalendarMonthIcon fontSize="small" color="primary" />
                <span>End Date</span>
              </FormLabel>
              <DatePicker
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
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
                sx={{ minWidth: 200 }}
              />
            </FormControl>
          </Stack>
        </LocalizationProvider>

        {isPending ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading transaction data. Please try again later.
          </Alert>
        ) : (
          <Alert
            severity={filteredData.length ? "info" : "warning"}
            sx={{ mb: 3 }}
          >
            {filteredData.length
              ? `${filteredData.length} transactions found in the selected date range.`
              : "No transactions found in the selected date range."}
          </Alert>
        )}
      </Paper>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Download Options
        </Typography>
      </Divider>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        justifyContent="center"
        sx={{ mb: 3 }}
      >
        <Tooltip title="Download as CSV for spreadsheet applications">
          <span>
            <Button
              variant="contained"
              color="primary"
              startIcon={<InsertDriveFileIcon />}
              onClick={handleExportCSV}
              disabled={!isDateRangeValid || isPending || !filteredData.length}
              sx={{
                minWidth: 180,
                py: 1.5,
                boxShadow: 2,
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Export as CSV
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Download as PDF for printing or sharing">
          <span>
            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportPDF}
              disabled={
                !isDateRangeValid ||
                isPending ||
                !filteredData.length ||
                !pdfLoaded
              }
              sx={{
                minWidth: 180,
                py: 1.5,
                boxShadow: 2,
                backgroundColor: "#ef5350",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                },
              }}
            >
              Export as PDF
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {!isPending && filteredData.length > 0 && (
        <Paper
          sx={{
            p: 2,
            mt: 3,
            bgcolor: "rgba(0,0,0,0.03)",
            borderRadius: 2,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Preview: {Math.min(5, filteredData.length)} of {filteredData.length}{" "}
            transactions
          </Typography>

          <Box component="ul" sx={{ pl: 0, listStyleType: "none" }}>
            {filteredData.slice(0, 5).map((tx) => (
              <Box
                component="li"
                key={tx._id}
                sx={{
                  p: 1,
                  mb: 1,
                  borderLeft: "4px solid",
                  borderColor: tx.type === "Expense" ? "#ef5350" : "#43a047",
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {tx.category}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: tx.type === "Expense" ? "#ef5350" : "#43a047",
                    }}
                  >
                    {tx.type === "Expense" ? "-" : "+"}
                    {tx.amount} {tx.currency}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(tx.date).format("YYYY-MM-DD")} • {tx.account}
                  {tx.note && ` • ${tx.note}`}
                </Typography>
              </Box>
            ))}
            {filteredData.length > 5 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "center" }}
              >
                ...and {filteredData.length - 5} more transactions
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ExportPage;
