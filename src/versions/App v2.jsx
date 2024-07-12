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
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [progress, setProgress] = useState(0);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    socketRef.current.on("progress", (data) => {
      setProgress(data.progress);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (downloadQueue.length > 0 && !downloading) {
      handleDownloadFromQueue();
    }
  }, [downloadQueue, downloading]);

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
    addToQueue(downloadUrl, type === "video" ? "video.mp4" : "audio.mp3", type);
  };

  const handlePlaylistDownload = async (video) => {
    const downloadUrl = `http://localhost:3001${video.downloadVideoBase}${selectedVideoItag}`;
    addToQueue(downloadUrl, "video.mp4", "video");
  };

  const addToQueue = (downloadUrl, filename, type) => {
    setDownloadQueue((prevQueue) => [
      ...prevQueue,
      { downloadUrl, filename, type },
    ]);
  };

  const handleDownloadFromQueue = async () => {
    if (downloadQueue.length === 0) return;
    setDownloading(true);
    const { downloadUrl, filename, type } = downloadQueue[0];
    try {
      const response = await axios.get(downloadUrl, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setDownloadQueue((prevQueue) => prevQueue.slice(1));
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleNewSearch = () => {
    setUrl("");
    setPlaylistUrl("");
    setVideoData(null);
    setPlaylistData(null);
    setSelectedVideoItag("");
    setSelectedAudioItag("");
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
        <button onClick={handleNewSearch} className="new-search-button">
          New Search
        </button>
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
                  <option key={index} value={format.itag}>
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
                  <option key={index} value={format.itag}>
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
                  <option key={index} value={format.itag}>
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
                <div key={index}>
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
        <div className="download-queue">
          <h3>Download Queue</h3>
          {downloadQueue.map((item, index) => (
            <div key={index}>
              <p>{item.filename}</p>
            </div>
          ))}
        </div>
        {downloading && (
          <div className="progress-bar">
            <div
              className="progress-bar-inner"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
