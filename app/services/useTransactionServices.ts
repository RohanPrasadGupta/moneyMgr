import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useMonthlyTransactions = (year: number, month: number) => {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", year, month],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/data/${year}/${month}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });
};
