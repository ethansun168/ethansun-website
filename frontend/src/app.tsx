import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from './components/dashboard';
import { Login } from './components/login';
import Navbar from './components/navbar';
import { useUsername } from './hooks/query';

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
  const [username, setUsername] = useState("");
  const {data, isLoading} = useUsername();
  useEffect(() => {
    if(data) {
      setUsername(data);
    }
  }, [data])

  return (
    <>
      <Navbar username={username} setUsername={setUsername} isLoading={isLoading}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login setUsername={setUsername}/>} />
        <Route path="/dashboard" element={<Dashboard username={username} setUsername={setUsername}/>} />
      </Routes>
    </>
  )
}

export default App
