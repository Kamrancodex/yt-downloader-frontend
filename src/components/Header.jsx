import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="YtClip" className="w-10 h-10 mr-2" />
            <span className="text-xl font-bold text-purple-600">YtClip</span>
          </Link>
          <nav className="hidden md:flex">
            <Link
              to="/downloader"
              className="mx-2 text-gray-600 hover:text-purple-600"
            >
              Downloader
            </Link>
            <Link
              to="/converter"
              className="mx-2 text-gray-600 hover:text-purple-600"
            >
              Converter
            </Link>
            <Link
              to="/mp3"
              className="mx-2 text-gray-600 hover:text-purple-600"
            >
              Mp3
            </Link>
            <Link
              to="/developer"
              className="mx-2 text-gray-600 hover:text-purple-600"
            >
              Developer
            </Link>
          </nav>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden bg-white py-2">
          <Link
            to="/downloader"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Downloader
          </Link>
          <Link
            to="/converter"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Converter
          </Link>
          <Link
            to="/mp3"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Mp3
          </Link>
          <Link
            to="/developer"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Developer
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;
