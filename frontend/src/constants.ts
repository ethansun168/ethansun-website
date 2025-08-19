import { hc } from 'hono/client';
import type { AppType } from 'ethansun-website-backend';

export const BACKEND_URL = "https://famous-wealthy-seal.ngrok-free.app";
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
