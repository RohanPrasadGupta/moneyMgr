import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type { Category } from "../types";

export const useCategoryOptions = {
  queryKey: ["getCategories"],
  queryFn: (): Promise<Category[]> =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json()),
};

export const useCategoryQuery = (): UseQueryResult<Category[], Error> => {
  return useQuery(useCategoryOptions);
};
