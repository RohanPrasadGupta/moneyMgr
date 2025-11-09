import { useQuery } from "@tanstack/react-query";

export const useCategoryOptions = {
  queryKey: ["getCategories"],
  queryFn: () =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json()),
};

export const useCategoryQuery = () => {
  return useQuery(useCategoryOptions);
};
