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
  currency: string;
}

export interface SipInvestment {
  _id: string;
  name: string;
  date: string;
  amount: number;
  currency: string;
}

export interface StockInvestment {
  _id: string;
  date: string;
  amount: number;
  currency: string;
}

export interface CoinInvestment {
  _id: string;
  date: string;
  amount: number;
  transactionCharge: number;
  totalAmount: number;
  currency: string;
}

export interface Currency {
  _id: string;
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
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
