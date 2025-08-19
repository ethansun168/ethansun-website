import { Route, Routes } from 'react-router-dom';
import { Dashboard } from './components/dashboard';
import { Login } from './components/login';
import Navbar from './components/navbar';
import { ThemeProvider } from './components/theme-provider';

function Home() {
  return <h1>Home page </h1>
}

function About() {
  return <h1>About page </h1>
}

function Contact() {
  return <h1>Contact page </h1>
}

function App() {
  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
