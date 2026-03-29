import type { AppType } from 'ethansun-website-backend';
import { hc } from 'hono/client';

export const autoLoginPage = '/messages'
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";
export const client = hc<AppType>(BACKEND_URL,
  {
    init: {
      credentials: 'include',
    },
  }
);
