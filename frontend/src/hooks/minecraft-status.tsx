import { minecraftClient } from "@/constants";
import { queryOptions } from "@tanstack/react-query";

export function createMinecraftStatusOptions() {
  return queryOptions({
    queryKey: ['minecraft-status'],
    queryFn: async () => {
      const resp = await minecraftClient.api.v1.minecraft.status.$get();
      const body = await resp.json();
      return body.status;
    },
    refetchInterval: 5000,
  })
}
