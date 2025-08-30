import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { About } from './components/about';
import { Dashboard } from './components/dashboard';
import { Game } from './components/game/game';
import { Shop } from './components/game/shop';
import { Home } from './components/home';
import { Login } from './components/login';
import { Minecraft } from './components/minecraft';
import Navbar from './components/navbar';
import { NotFound } from './components/not-found';
import { ThemeProvider } from './components/theme-provider';
import { Contact } from './components/contact';

export type UserItem = {
  id: number,
  count: number
};

function App() {

  // Game points
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem("points");
    return saved ? parseInt(saved, 10) : 0;
  });


  const [items, setItems] = useState<UserItem[]>(() => {
    const saved = localStorage.getItem("items");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("points", points.toString());
  }, [points]);

  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/minecraft" element={<Minecraft />} />
        <Route path="/game" element={<Game points={points} setPoints={setPoints} items={items} setItems={setItems} />} />
        <Route path="/shop" element={<Shop points={points} setPoints={setPoints} items={items} setItems={setItems} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
