import type { AppType, MinecraftApp } from 'ethansun-website-backend';
import { hc } from 'hono/client';

export const BACKEND_URL = "https://famous-wealthy-seal.ngrok-free.app";
export const minecraftClient = hc<MinecraftApp>(BACKEND_URL,
  {
    init: {
      credentials: 'include',
    },
    headers: {
      "ngrok-skip-browser-warning": "true",
    }
  }
);
export const client = hc<AppType>(BACKEND_URL,
  {
    init: {
      credentials: 'include',
    },
    headers: {
      "ngrok-skip-browser-warning": "true",
    }
  }
);
