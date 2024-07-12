import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import Downloader from "./components/Downloader";
import Converter from "./components/Converter";
import Mp3 from "./components/Mp3";
import Developer from "./components/Developer";
import "./index.css"; // Make sure this import is present
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/downloader" element={<Downloader />} />
            <Route path="/converter" element={<Converter />} />
            <Route path="/mp3" element={<Mp3 />} />
            <Route path="/developer" element={<Developer />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white text-center py-4">
          <p>&copy; 2024 YtClip. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
