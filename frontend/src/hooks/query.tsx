import { client } from "@/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { useQueryClient } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await client.api.v1.me.$get()
      if (!response.ok) {
        throw new Error("Not authenticated");
      }
      return await response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60
  })
}

export function useRequireUser() {
  const { data: user } = useUser();
  if (!user) throw new Error("useRequiredUser called without a user");
  return { user }
}

type LoginData = InferResponseType<typeof client.api.v1.login.$post, 200>
export function useLogin(
  onSuccess?: (data: LoginData) => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ username, password }: { username: string, password: string }) => {
      let response;
      try {
        response = await client.api.v1.login.$post({
          json: {
            username: username,
            password: password,
          },
        })
      }
      catch {
        throw new Error("Cannot connect to server");
      }

      if (!response.ok) {
        const body = await response.json();
        if ('message' in body) {
          throw new Error(body.message);
        }
        throw new Error("Unknown error");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data)
      }
      queryClient.setQueryData(['user'], data);
    },
    onError: onError
  })
}
