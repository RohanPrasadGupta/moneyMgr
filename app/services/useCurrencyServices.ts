import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type { Currency } from "../types";

export const useCurrencyOptions = {
  queryKey: ["getCurrencies"],
  queryFn: (): Promise<Currency[]> =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/currency`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json()),
};

export const useCurrencyQuery = (): UseQueryResult<Currency[], Error> => {
  return useQuery(useCurrencyOptions);
};

/**
 * Currency dropdown options, guaranteed to include the record's current
 * value even if it's since been removed from the shared currency list.
 */
export const getCurrencyMenuOptions = (
  currencies: Currency[] | undefined,
  currentCode?: string
): Currency[] => {
  const list = currencies || [];
  if (currentCode && !list.some((c) => c.code === currentCode)) {
    return [
      ...list,
      { _id: currentCode, code: currentCode, name: currentCode, symbol: "", isDefault: false },
    ];
  }
  return list;
};
