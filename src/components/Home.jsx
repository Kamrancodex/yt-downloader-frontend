import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/header-img.png";

function Home() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-8">
        Download YouTube Videos with Ease
      </h1>
      <img
        src={heroImage}
        alt="YtClip Hero"
        className="w-full max-w-2xl mb-12"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link
          to="/downloader"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h2 className="text-2xl font-semibold mb-4">Download Single Video</h2>
          <p className="text-gray-600">
            Quick and easy download for individual YouTube videos
          </p>
        </Link>
        <Link
          to="/downloader"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h2 className="text-2xl font-semibold mb-4">Download Playlist</h2>
          <p className="text-gray-600">
            Efficiently download entire YouTube playlists
          </p>
        </Link>
      </div>
    </div>
  );
}

export default Home;
