'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_STOCK

const StocksPage = () => {
  const queryClient = useQueryClient()
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Fetch transactions using React Query
  const { data: apiResponse, isLoading, isError, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/transactions`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      return response.json()
    }
  })

  // Mutation for adding new transaction
  const addTransactionMutation = useMutation({
    mutationFn: async (newTransaction) => {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add transaction')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setSnackbar({
        open: true,
        message: 'Transaction added successfully!',
        severity: 'success'
      })
      handleCloseDialog()
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to add transaction',
        severity: 'error'
      })
    }
  })

  // Mutation for updating transaction
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update transaction')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setSnackbar({
        open: true,
        message: 'Transaction updated successfully!',
        severity: 'success'
      })
      handleCloseDialog()
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update transaction',
        severity: 'error'
      })
    }
  })

  // Mutation for deleting transaction
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete transaction')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setSnackbar({
        open: true,
        message: 'Transaction deleted successfully!',
        severity: 'success'
      })
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete transaction',
        severity: 'error'
      })
    }
  })

  const transactions = apiResponse?.data || []
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  
  // Use lazy initializer to avoid hydration mismatch
  const getDefaultFormData = () => ({
    stockSymbol: '',
    stockName: '',
    type: 'BUY',
    price: '',
    quantity: '',
    investedDate: ''
  })
  
  const [formData, setFormData] = useState(getDefaultFormData)

  // Get unique stock symbols and names for autocomplete
  const stockOptions = [...new Map(
    transactions.map(t => [t.stockSymbol, { symbol: t.stockSymbol, name: t.stockName }])
  ).values()].sort((a, b) => a.symbol.localeCompare(b.symbol))

  const handleOpenDialog = (stockSymbol = null) => {
    setSelectedStock(stockSymbol)
    setEditingTransaction(null)
    const stockInfo = stockSymbol ? transactions.find(t => t.stockSymbol === stockSymbol) : null
    setFormData({
      stockSymbol: stockSymbol || '',
      stockName: stockInfo?.stockName || '',
      type: 'BUY',
      price: '',
      quantity: '',
      investedDate: new Date().toISOString().split('T')[0]
    })
    setOpenDialog(true)
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setSelectedStock(transaction.stockSymbol)
    setFormData({
      stockSymbol: transaction.stockSymbol,
      stockName: transaction.stockName,
      type: transaction.type,
      price: transaction.price.toString(),
      quantity: transaction.quantity.toString(),
      investedDate: new Date(transaction.investedDate).toISOString().split('T')[0]
    })
    setOpenDialog(true)
  }

  const handleDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransactionMutation.mutate(transactionToDelete._id)
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setTransactionToDelete(null)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedStock(null)
    setEditingTransaction(null)
    setFormData(getDefaultFormData())
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    // Calculate total amount
    const totalAmount = parseFloat(formData.price) * parseFloat(formData.quantity)
    
    if (editingTransaction) {
      // Update existing transaction
      const updatedData = {
        stockSymbol: formData.stockSymbol.toUpperCase(),
        stockName: formData.stockName,
        type: formData.type,
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity),
        totalAmount: totalAmount,
        investedDate: formData.investedDate
      }
      updateTransactionMutation.mutate({ id: editingTransaction._id, updatedData })
    } else {
      // Add new transaction
      const newTransaction = {
        stockSymbol: formData.stockSymbol.toUpperCase(),
        stockName: formData.stockName,
        type: formData.type,
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity),
        totalAmount: totalAmount,
        investedDate: formData.investedDate
      }
      addTransactionMutation.mutate(newTransaction)
    }
  }

  // Group transactions by stock symbol
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const symbol = transaction.stockSymbol
    if (!acc[symbol]) {
      acc[symbol] = []
    }
    acc[symbol].push(transaction)
    return acc
  }, {})

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const calculateTotalInvestment = (transactionList) => {
    return transactionList.reduce((sum, t) => {
      return t.type === 'BUY' ? sum + t.totalAmount : sum
    }, 0)
  }

  const calculateTotalSold = (transactionList) => {
    return transactionList.reduce((sum, t) => {
      return t.type === 'SELL' ? sum + t.totalAmount : sum
    }, 0)
  }

  const calculateNetInvestment = (transactionList) => {
    const totalBought = calculateTotalInvestment(transactionList)
    const totalSold = calculateTotalSold(transactionList)
    return totalBought - totalSold
  }

  const calculateTotalQuantity = (transactionList) => {
    return transactionList.reduce((sum, t) => {
      return t.type === 'BUY' ? sum + t.quantity : sum - t.quantity
    }, 0)
  }

  const calculateAveragePrice = (transactionList) => {
    const buyTransactions = transactionList.filter(t => t.type === 'BUY')
    if (buyTransactions.length === 0) return 0
    
    const totalCost = buyTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
    const totalQuantity = buyTransactions.reduce((sum, t) => sum + t.quantity, 0)
    
    return totalQuantity > 0 ? totalCost / totalQuantity : 0
  }

  const calculateProfitLoss = (transactionList) => {
    const totalSold = calculateTotalSold(transactionList)
    const soldTransactions = transactionList.filter(t => t.type === 'SELL')
    
    // Calculate cost basis for sold shares
    let costBasis = 0
    const avgPrice = calculateAveragePrice(transactionList)
    const totalSoldQuantity = soldTransactions.reduce((sum, t) => sum + t.quantity, 0)
    costBasis = avgPrice * totalSoldQuantity
    
    return totalSold - costBasis
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      p: 4,
      bgcolor: 'background.default'
    }}>
      {/* Loading State */}
      {isLoading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          gap: 2
        }}>
          <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 500 }}>
            Loading stock transactions...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            mt: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'error.main',
            bgcolor: 'rgba(239, 83, 80, 0.1)'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Failed to load transactions
          </Typography>
          <Typography variant="body2">
            {error?.message || 'An error occurred while fetching data. Please try again later.'}
          </Typography>
        </Alert>
      )}

      {/* Main Content */}
      {!isLoading && !isError && (
        <>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
        p: 3,
        borderRadius: 3,
        border: '1px solid #23272f',
        boxShadow: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShowChartIcon sx={{ fontSize: 36, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ 
              color: 'text.primary',
              letterSpacing: 0.5
            }}>
              Stock Portfolio
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
              Track your investments and performance
            </Typography>
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          bgcolor: 'background.paper',
          p: 2.5,
          borderRadius: 2,
          border: '1px solid #23272f'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
              TOTAL STOCKS
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#90caf9' }}>
              {Object.keys(groupedTransactions).length}
            </Typography>
          </Box>
          <Box sx={{ 
            width: '1px', 
            bgcolor: '#23272f',
            mx: 1
          }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
              TRANSACTIONS
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#f48fb1' }}>
              {transactions.length}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            px: 4,
            py: 1.5,
            borderRadius: '16px',
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(48, 207, 208, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #330867 0%, #30cfd0 100%)',
              boxShadow: '0 6px 20px rgba(48, 207, 208, 0.6)',
              transform: 'translateY(-2px)'
            },
            '&:active': {
              transform: 'translateY(0px)',
            }
          }}
        >
          Add Transaction
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Object.entries(groupedTransactions).map(([symbol, symbolTransactions]) => {
          const totalInvestment = calculateTotalInvestment(symbolTransactions)
          const totalSold = calculateTotalSold(symbolTransactions)
          const netInvestment = calculateNetInvestment(symbolTransactions)
          const totalQuantity = calculateTotalQuantity(symbolTransactions)
          const averagePrice = calculateAveragePrice(symbolTransactions)
          const profitLoss = calculateProfitLoss(symbolTransactions)
          const stockName = symbolTransactions[0]?.stockName || ''

          return (
            <Accordion 
              key={symbol} 
              sx={{ 
                borderRadius: 3,
                '&:before': { display: 'none' },
                '&:first-of-type': {
                  borderRadius: 3,
                },
                '&:last-of-type': {
                  borderRadius: 3,
                },
                boxShadow: 3,
                bgcolor: 'background.paper',
                border: '1px solid #23272f',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(48, 207, 208, 0.2)',
                  transform: 'translateY(-2px)',
                  borderColor: 'rgba(48, 207, 208, 0.3)'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#90caf9' }} />}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  minHeight: '80px',
                  '&:hover': { 
                    bgcolor: 'rgba(144, 202, 249, 0.08)',
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '16px 0'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(48, 207, 208, 0.3)'
                  }}>
                    <ShowChartIcon sx={{ color: '#fff', fontSize: 32 }} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: '180px' }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ 
                      color: 'text.primary',
                      mb: 0.5 
                    }}>
                      {symbol}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#90caf9',
                      fontWeight: 500
                    }}>
                      {stockName}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary',
                      fontWeight: 400,
                      display: 'block',
                      mt: 0.5
                    }}>
                      {symbolTransactions.length} transactions • {totalQuantity} shares
                    </Typography>
                  </Box>
                  
                  {/* Metrics Grid */}
                  <Box sx={{ 
                    display: 'flex',
                    gap: 1.5,
                    flexWrap: 'nowrap',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ 
                      textAlign: 'center',
                      bgcolor: 'background.default',
                      p: 1.5,
                      borderRadius: 2,
                      width: '140px',
                      flex: '0 0 140px',
                      border: '1px solid #23272f'
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, display: 'block' }}>
                        AVG PRICE
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#90caf9', mt: 0.5 }}>
                        {formatCurrency(averagePrice)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      textAlign: 'center',
                      bgcolor: 'background.default',
                      p: 1.5,
                      borderRadius: 2,
                      width: '140px',
                      flex: '0 0 140px',
                      border: '1px solid rgba(102, 187, 106, 0.5)'
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, display: 'block' }}>
                        INVESTED
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#66bb6a', mt: 0.5 }}>
                        {formatCurrency(totalInvestment)}
                      </Typography>
                    </Box>
                    
                    {totalSold > 0 && (
                      <Box sx={{ 
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        p: 1.5,
                        borderRadius: 2,
                        width: '140px',
                        flex: '0 0 140px',
                        border: '1px solid rgba(239, 83, 80, 0.5)'
                      }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, display: 'block' }}>
                          SOLD
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" sx={{ color: '#ef5350', mt: 0.5 }}>
                          {formatCurrency(totalSold)}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ 
                      textAlign: 'center',
                      bgcolor: 'background.default',
                      p: 1.5,
                      borderRadius: 2,
                      width: '140px',
                      flex: '0 0 140px',
                      border: '1px solid #23272f'
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, display: 'block' }}>
                        NET
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#f5f6fa', mt: 0.5 }}>
                        {formatCurrency(netInvestment)}
                      </Typography>
                    </Box>
                    
                    {totalSold > 0 && (
                      <Box sx={{ 
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        p: 1.5,
                        borderRadius: 2,
                        width: '140px',
                        flex: '0 0 140px',
                        border: '1px solid',
                        borderColor: profitLoss >= 0 ? 'rgba(102, 187, 106, 0.5)' : 'rgba(239, 83, 80, 0.5)'
                      }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, display: 'block' }}>
                          P/L
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="bold" 
                          sx={{ color: profitLoss >= 0 ? '#66bb6a' : '#ef5350', mt: 0.5 }}
                        >
                          {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Add Transaction Button */}
                  <Box
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDialog(symbol)
                    }}
                    sx={{
                      background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                      color: '#fff',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(48, 207, 208, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #330867 0%, #30cfd0 100%)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 6px 16px rgba(48, 207, 208, 0.6)'
                      },
                      transition: 'all 0.3s ease',
                      ml: 1
                    }}
                  >
                    <AddIcon />
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ p: 0, bgcolor: 'background.default' }}>
                <TableContainer sx={{ maxHeight: 450 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.85rem', 
                          bgcolor: '#1e1e1e',
                          color: '#f5f6fa',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #90caf9'
                        }}>
                          Type
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.85rem', 
                          bgcolor: '#1e1e1e',
                          color: '#f5f6fa',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #90caf9'
                        }}>
                          Price
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.85rem', 
                          bgcolor: '#1e1e1e',
                          color: '#f5f6fa',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #90caf9'
                        }}>
                          Quantity
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.85rem', 
                          bgcolor: '#1e1e1e',
                          color: '#f5f6fa',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #90caf9'
                        }}>
                          Total Amount
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.85rem', 
                          bgcolor: '#1e1e1e',
                          color: '#f5f6fa',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #90caf9'
                        }}>
                          Date
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '0.85rem', 
                          bgcolor: '#1e1e1e',
                          color: '#f5f6fa',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #90caf9'
                        }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {symbolTransactions.map((transaction) => (
                        <TableRow
                          key={transaction._id}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'rgba(144, 202, 249, 0.08)',
                              transform: 'scale(1.002)'
                            },
                            transition: 'all 0.2s ease',
                            '&:nth-of-type(odd)': {
                              bgcolor: 'background.paper'
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: 'background.default'
                            }
                          }}
                        >
                          <TableCell align="center">
                            <Chip
                              label={transaction.type}
                              icon={transaction.type === 'BUY' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              color={transaction.type === 'BUY' ? 'success' : 'error'}
                              size="small"
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                height: '28px'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="500" sx={{ color: 'text.primary' }}>
                              {formatCurrency(transaction.price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="600" sx={{ color: '#90caf9' }}>
                              {transaction.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body1" fontWeight="700" sx={{ color: 'text.primary' }}>
                              {formatCurrency(transaction.totalAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {formatDate(transaction.investedDate)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditTransaction(transaction)}
                                sx={{
                                  color: '#90caf9',
                                  '&:hover': {
                                    bgcolor: 'rgba(144, 202, 249, 0.2)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteTransaction(transaction)}
                                disabled={deleteTransactionMutation.isPending}
                                sx={{
                                  color: '#ef5350',
                                  '&:hover': {
                                    bgcolor: 'rgba(239, 83, 80, 0.2)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Box>

      {/* Add Transaction Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid #23272f',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingTransaction ? <EditIcon /> : <AddIcon />}
            <Typography variant="h6" fontWeight="bold">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Stock Symbol Field */}
            <Autocomplete
              freeSolo
              disabled={!!editingTransaction}
              options={stockOptions}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option
                return option.symbol
              }}
              value={stockOptions.find(opt => opt.symbol === formData.stockSymbol) || formData.stockSymbol}
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  handleFormChange('stockSymbol', newValue)
                  handleFormChange('stockName', '')
                } else if (newValue) {
                  handleFormChange('stockSymbol', newValue.symbol)
                  handleFormChange('stockName', newValue.name)
                } else {
                  handleFormChange('stockSymbol', '')
                  handleFormChange('stockName', '')
                }
              }}
              onInputChange={(event, newValue) => {
                if (event && event.type === 'change') {
                  handleFormChange('stockSymbol', newValue)
                }
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1" fontWeight="600">
                      {option.symbol}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.name}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Stock Symbol"
                  required
                  fullWidth
                  placeholder="Enter or select stock symbol"
                  helperText={
                    editingTransaction 
                      ? 'Stock symbol cannot be changed' 
                      : selectedStock 
                        ? `Adding transaction for ${selectedStock}` 
                        : 'Select existing or enter new stock symbol'
                  }
                />
              )}
            />

            {/* Stock Name Field */}
            <TextField
              label="Stock Name"
              value={formData.stockName}
              onChange={(e) => handleFormChange('stockName', e.target.value)}
              required
              fullWidth
              disabled={!!editingTransaction}
              placeholder="Enter the full company name"
              helperText={editingTransaction ? 'Stock name cannot be changed' : 'Full name of the company'}
            />

            {/* Transaction Type */}
            <TextField
              select
              label="Transaction Type"
              value={formData.type}
              onChange={(e) => handleFormChange('type', e.target.value)}
              required
              fullWidth
            >
              <MenuItem value="BUY">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="success" />
                  <Typography>BUY</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="SELL">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDownIcon color="error" />
                  <Typography>SELL</Typography>
                </Box>
              </MenuItem>
            </TextField>

            {/* Price */}
            <TextField
              label="Price per Share"
              type="number"
              value={formData.price}
              onChange={(e) => handleFormChange('price', e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Enter the price per share"
            />

            {/* Quantity */}
            <TextField
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleFormChange('quantity', e.target.value)}
              required
              fullWidth
              inputProps={{ min: 1, step: 1 }}
              helperText="Enter the number of shares"
            />

            {/* Date */}
            <TextField
              label="Transaction Date"
              type="date"
              value={formData.investedDate}
              onChange={(e) => handleFormChange('investedDate', e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {/* Total Amount Display */}
            {formData.price && formData.quantity && (
              <Box sx={{ 
                p: 2.5, 
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '2px solid #90caf9'
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}>
                  TOTAL AMOUNT
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#90caf9', mt: 0.5 }}>
                  {formatCurrency(parseFloat(formData.price) * parseFloat(formData.quantity))}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(48, 207, 208, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.stockSymbol || 
              !formData.stockName || 
              !formData.price || 
              !formData.quantity || 
              !formData.investedDate || 
              addTransactionMutation.isPending ||
              updateTransactionMutation.isPending
            }
            sx={{
              background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
              color: '#fff',
              fontWeight: 600,
              px: 3,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(48, 207, 208, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #330867 0%, #30cfd0 100%)',
                boxShadow: '0 6px 20px rgba(48, 207, 208, 0.6)'
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            {(addTransactionMutation.isPending || updateTransactionMutation.isPending) ? (
              <>
                <CircularProgress size={20} sx={{ color: '#fff', mr: 1 }} />
                {editingTransaction ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              editingTransaction ? 'Update Transaction' : 'Add Transaction'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid #23272f',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'rgba(239, 83, 80, 0.1)',
          borderBottom: '1px solid rgba(239, 83, 80, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: '#ef5350'
        }}>
          <DeleteIcon />
          <Typography variant="h6" fontWeight="bold">
            Delete Transaction
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'rgba(239, 83, 80, 0.1)',
                border: '2px solid #ef5350',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <DeleteIcon sx={{ fontSize: 32, color: '#ef5350' }} />
            </Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
              Are you sure?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Do you really want to delete this transaction? This action cannot be undone.
            </Typography>
            
            {transactionToDelete && (
              <Box
                sx={{
                  bgcolor: 'background.default',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #23272f',
                  mt: 2
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Transaction Details:
                </Typography>
                <Typography variant="body1" fontWeight="bold" sx={{ color: 'text.primary', mt: 1 }}>
                  {transactionToDelete.stockSymbol} - {transactionToDelete.type}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {transactionToDelete.quantity} shares @ {formatCurrency(transactionToDelete.price)}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#90caf9', mt: 0.5 }}>
                  Total: {formatCurrency(transactionToDelete.totalAmount)}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={cancelDelete}
            variant="outlined"
            fullWidth
            sx={{
              color: 'text.primary',
              borderColor: '#23272f',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(144, 202, 249, 0.1)',
                borderColor: '#90caf9'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            fullWidth
            disabled={deleteTransactionMutation.isPending}
            sx={{
              bgcolor: '#ef5350',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#d32f2f'
              },
              '&:disabled': {
                bgcolor: 'rgba(239, 83, 80, 0.3)',
                color: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            {deleteTransactionMutation.isPending ? (
              <>
                <CircularProgress size={20} sx={{ color: '#fff', mr: 1 }} />
                Deleting...
              </>
            ) : (
              'Delete Transaction'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
        </>
      )}
    </Box>
  )
}

export default StocksPage
