import { Route, Routes } from 'react-router-dom';
import { Dashboard } from './components/dashboard';
import { Login } from './components/login';
import Navbar from './components/navbar';
import { ThemeProvider } from './components/theme-provider';
import { Minecraft } from './components/minecraft';
import { Home } from './components/home';
import { Game } from './components/game/game';
import { Shop } from './components/game/shop';
import { useEffect, useState } from 'react';

function About() {
  return <h1>About page </h1>
}

function Contact() {
  return <h1>Contact page </h1>
}

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
      </Routes>
    </ThemeProvider>
  )
}

export default App
