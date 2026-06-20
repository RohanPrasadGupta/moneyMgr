export interface Transaction {
  _id: string;
  date: string;
  account: "Cash" | "Online";
  category: string;
  note: string;
  currency: string;
  type: "Income" | "Expense";
  amount: number;
}

export interface Category {
  _id: string;
  name: string;
  categoryType: "Income" | "Expense";
}

export interface SipInvestment {
  _id: string;
  name: string;
  date: string;
  amount: number;
}

export interface StockInvestment {
  _id: string;
  date: string;
  amount: number;
}

export interface CoinInvestment {
  _id: string;
  date: string;
  amount: number;
  transactionCharge: number;
  totalAmount: number;
}

export interface Currency {
  code: string;
  symbol: string;
  locale: string;
  label: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export interface SipCalculatorResult {
  totalInvested: number;
  estimatedReturns: number;
  maturityValue: number;
  yearlyBreakdown: Array<{
    year: number;
    invested: number;
    returns: number;
    total: number;
  }>;
}
