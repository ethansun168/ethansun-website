import { client } from "@/constants";
import { useQuery } from "@tanstack/react-query";

export function useUsername() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await client.api.v1.me.$get()
      if (!response.ok) {
        throw new Error("Not authenticated");
      }
      const body = await response.json();
      return body.username;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60
  })
}
