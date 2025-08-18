// import { useState } from 'react'
// import { Button } from '@/components/ui/button';
import { Login } from './login';
import Navbar from './navbar';
import { Route, Routes } from 'react-router-dom';

// <Button onClick={ async () => {
//     const response = await fetch(`${BACKEND_URL}/api`,
//         {
//             headers: {
//                 "Content-Type": "application/json", 
//                 "ngrok-skip-browser-warning": "true",
//             }
//         }
//     );
//     const data = await response.json();
//     console.log(data);
// }}
// > click me</Button>

// const BACKEND_URL = "https://famous-wealthy-seal.ngrok-free.app";

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
            <div className="pt-20">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </>
    )
}

export default App
