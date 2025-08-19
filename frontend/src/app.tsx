import { Route, Routes } from 'react-router-dom';
import { Dashboard } from './components/dashboard';
import { Login } from './components/login';
import Navbar from './components/navbar';

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
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
