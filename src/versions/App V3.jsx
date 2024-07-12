import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./App.css";

const App = () => {
  const [url, setUrl] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [playlistData, setPlaylistData] = useState(null);
  const [selectedVideoItag, setSelectedVideoItag] = useState("");
  const [selectedAudioItag, setSelectedAudioItag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({});
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    socketRef.current.on("progress", (data) => {
      setProgress((prevProgress) => ({
        ...prevProgress,
        [data.url]: data.progress,
      }));

      // Remove progress bar after reaching 100%
      if (data.progress === 100) {
        setTimeout(() => {
          setProgress((prevProgress) => {
            const newProgress = { ...prevProgress };
            delete newProgress[data.url];
            return newProgress;
          });
        }, 5000); // 5 seconds delay
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVideoData(null);
    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/downloads/video",
        { url }
      );
      setVideoData(response.data);
    } catch (error) {
      setError(error.response?.data || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlaylistData(null);
    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/downloads/playlist",
        { url: playlistUrl }
      );
      setPlaylistData(response.data);
    } catch (error) {
      setError(error.response?.data || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    const itag = type === "video" ? selectedVideoItag : selectedAudioItag;
    const base =
      type === "video"
        ? videoData.downloadVideoBase
        : videoData.downloadAudioBase;
    const downloadUrl = `http://localhost:3001${base}${itag}`;
    setDownloading(true);
    try {
      const response = await axios.get(downloadUrl, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        type === "video" ? "video.mp4" : "audio.mp3"
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handlePlaylistDownload = async (video) => {
    const downloadUrl = `http://localhost:3001${video.downloadVideoBase}${selectedVideoItag}`;
    setDownloading(true);
    try {
      const response = await axios.get(downloadUrl, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "video.mp4");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setDownloading(false);
    }
  };

  const renderProgress = (url) => {
    return (
      <div key={url}>
        <div className="progress-bar">
          <div
            className="progress-bar-inner"
            style={{ width: `${Math.round(progress[url] || 0)}%` }}
          >
            {Math.round(progress[url] || 0)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Video Downloader</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="url-input"
          />
          <button type="submit" className="download-button" disabled={loading}>
            {loading ? "Fetching Formats..." : "Fetch Formats"}
          </button>
          {loading && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => setLoading(false)}
            >
              Cancel
            </button>
          )}
        </form>
        <form onSubmit={handlePlaylistSubmit}>
          <input
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="Enter Playlist URL"
            className="url-input"
          />
          <button type="submit" className="download-button" disabled={loading}>
            {loading ? "Fetching Playlist..." : "Fetch Playlist"}
          </button>
          {loading && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => setLoading(false)}
            >
              Cancel
            </button>
          )}
        </form>
        {error && <p className="error-message">{error}</p>}
        {videoData && (
          <div className="video-details">
            <h3>{videoData.title}</h3>
            <img src={videoData.thumbnail} alt={videoData.title} />
            <div>
              <h4>Select Video Quality:</h4>
              <select
                onChange={(e) => setSelectedVideoItag(e.target.value)}
                value={selectedVideoItag}
              >
                <option value="">Select Quality</option>
                {videoData.formats.map((format, index) => (
                  <option key={`${format.itag}-${index}`} value={format.itag}>
                    {format.qualityLabel} - {format.container}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleDownload("video")}
                className="download-button"
              >
                Download Video
              </button>
            </div>
            <div>
              <h4>Select Audio Quality:</h4>
              <select
                onChange={(e) => setSelectedAudioItag(e.target.value)}
                value={selectedAudioItag}
              >
                <option value="">Select Quality</option>
                {videoData.audioFormats.map((format, index) => (
                  <option key={`${format.itag}-${index}`} value={format.itag}>
                    {format.bitrate}kbps - {format.container}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleDownload("audio")}
                className="download-button"
              >
                Download Audio
              </button>
            </div>
          </div>
        )}
        {playlistData && (
          <div className="video-details">
            <h3>{playlistData.title}</h3>
            <div>
              <h4>Select Quality for Playlist:</h4>
              <select
                onChange={(e) => setSelectedVideoItag(e.target.value)}
                value={selectedVideoItag}
              >
                <option value="">Select Quality</option>
                {playlistData.formats.map((format, index) => (
                  <option key={`${format.itag}-${index}`} value={format.itag}>
                    {format.qualityLabel} - {format.container}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  playlistData.videos.forEach((video) =>
                    handlePlaylistDownload(video)
                  )
                }
                className="download-button"
              >
                Download Playlist
              </button>
            </div>
            <div>
              <h4>Videos:</h4>
              {playlistData.videos.map((video, index) => (
                <div key={video.url}>
                  <img src={video.thumbnails[0].url} alt={video.title} />
                  <p>{video.title}</p>
                  <button
                    onClick={() => handlePlaylistDownload(video)}
                    className="download-button"
                  >
                    Select Video
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {Object.keys(progress).length > 0 && (
          <div>
            <h3>Download Queue</h3>
            {Object.keys(progress).map((url) => renderProgress(url))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
