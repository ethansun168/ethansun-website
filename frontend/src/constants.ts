import type { AppType, MinecraftApp } from 'ethansun-website-backend';
import { hc } from 'hono/client';

// export const BACKEND_URL = "https://api.ethansun.org";
export const BACKEND_URL = "http://localhost:3000";
export const minecraftClient = hc<MinecraftApp>(BACKEND_URL,
  {
    init: {
      credentials: 'include',
    },
  }
);
export const client = hc<AppType>(BACKEND_URL,
  {
    init: {
      credentials: 'include',
    },
  }
);
