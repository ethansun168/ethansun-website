import type { AppType } from 'ethansun-website-backend';
import { hc } from 'hono/client';
import type React from 'react';
import { Home } from './components/home';
import { Game } from './components/game/game';
import { CommandLine } from './components/command-line';
import { About } from './components/about';
import { Contact } from './components/contact';
import { Messages } from './components/messages';
import { Gallery } from './components/gallery';
import { Login } from './components/login';
import { Shop } from './components/game/shop';
import { Admin } from './components/admin';
import { NotFound } from './components/not-found';

export const autoLoginPage = '/messages'
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";
export const client = hc<AppType>(BACKEND_URL,
  {
    init: {
      credentials: 'include',
    },
  }
);

type RouteConfig = {
  path: string,
  element: React.ReactNode,
  nav?: string,
  dropdown?: string
}
export const ROUTES: RouteConfig[] = [
  { path: "/", element: <Home />, nav: "Home" },
  { path: "/game", element: <Game />, nav: "Game" },
  { path: "/command", element: <CommandLine />, nav: "Command Line" },
  { path: "/about", element: <About />, nav: "About" },
  { path: "/contact", element: <Contact />, nav: "Contact" },
  { path: "/messages", element: <Messages />, dropdown: "Messages" },
  { path: "/gallery", element: <Gallery />, dropdown: "Gallery" },
  // { path: "/dashboard", element: <Dashboard />, dropdown: "Dashboard" },
  { path: "/login", element: <Login /> },
  { path: "/shop", element: <Shop /> },
  { path: "/admin", element: <Admin /> },
  { path: "*", element: <NotFound /> },
]
