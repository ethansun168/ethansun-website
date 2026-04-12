import { About } from '@/components/about';
import { Admin } from '@/components/admin';
import { CommandLine } from '@/components/command-line';
import { Contact } from '@/components/contact';
import { Gallery } from '@/components/gallery';
import { Game } from '@/components/game/game';
import { Shop } from '@/components/game/shop';
import { Home } from '@/components/home';
import { Login } from '@/components/login';
import { Messages } from '@/components/messages';
import { NotFound } from '@/components/not-found';
import { Profile } from '@/components/profile';
import type { AppType } from 'ethansun-website-backend';
import type { RoleType } from 'ethansun-website-backend/dist/src/types';
import { hc } from 'hono/client';
import type React from 'react';
import Minesweeper from './components/minesweeper';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";
export const client = hc<AppType>(BACKEND_URL,
  {
    init: {
      credentials: 'include',
    },
  }
);

type RouteConfig = {
  path: string,
  to?: (...args: string[]) => string;
  element: React.ReactNode,
  nav?: string,
  dropdown?: string,
  protected?: boolean
}

export const ROUTES: RouteConfig[] = [
  { path: "/", element: <Home />, nav: "Home" },
  { path: "/game", element: <Game />, nav: "Game" },
  { path: "/shop", element: <Shop /> },
  { path: "/minesweeper", element: <Minesweeper />, nav: "Minesweeper" },
  { path: "/command", element: <CommandLine />, nav: "Command Line" },
  { path: "/about", element: <About />, nav: "About" },
  { path: "/contact", element: <Contact />, nav: "Contact" },
  { path: "/user/:username", element: <Profile />, dropdown: "Dashboard", protected: true, to: (username: string) => `/user/${username}` },
  { path: "/messages", element: <Messages />, dropdown: "Messages", protected: true },
  { path: "/gallery", element: <Gallery />, dropdown: "Gallery", protected: true },
  { path: "/admin", element: <Admin />, dropdown: "Admin", protected: true },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
]

export const ROLE_CONFIG: Record<RoleType, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  admin: {
    label: "Admin",
    variant: "default",
    className: "bg-rose-500/15 text-rose-600 border-rose-200 hover:bg-rose-500/20 dark:text-rose-400 dark:border-rose-800",
  },
  user: {
    label: "User",
    variant: "outline",
    className: "bg-sky-500/15 text-sky-600 border-sky-200 hover:bg-sky-500/20 dark:text-sky-400 dark:border-sky-800",
  },
  baby: {
    label: "Baby",
    variant: "default",
    className: "bg-pink-500/15 text-pink-600 border-pink-200 hover:bg-pink-500/20 dark:text-pink-300 dark:border-pink-700"
  }
};
