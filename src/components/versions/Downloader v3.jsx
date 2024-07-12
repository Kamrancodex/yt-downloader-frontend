import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "../index.css"; // Ensure Tailwind CSS is included
import "../App.css"; // Ensure custom CSS is included
import hero_img from "../assets/header-img.png";
import single from "../assets/single.png";
import playlist from "../assets/playlist.png";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const Downloader = () => {
  const [url, setUrl] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [videoData, setVideoData] = useState(null);
  const [playlistData, setPlaylistData] = useState(null);
  const [selectedVideoItags, setSelectedVideoItags] = useState({});
  const [selectedAudioItags, setSelectedAudioItags] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [downloadMethod, setDownloadMethod] = useState(null);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://46.101.127.179:3001/");
    socketRef.current.on("progress", (data) => {
      setOverallProgress(data.progress);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const fetchDetails = async () => {
    setLoading(true);
    setError("");
    setVideoData(null);
    setPlaylistData(null);

    try {
      const response =
        downloadMethod === "playlist"
          ? await axios.post(
              "http://46.101.127.179:3001/api/v1/downloads/playlist",
              { url: playlistUrl }
            )
          : await axios.post("http://46.101.127.179:3001/api/v1/downloads/video", {
              url,
            });
      downloadMethod === "playlist"
        ? setPlaylistData(response.data)
        : setVideoData(response.data);
      if (response.data.duration) {
        setEndTime(response.data.duration); // Set the end time to the video duration
      }
    } catch (error) {
      setError(error.response?.data || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url || playlistUrl) {
      fetchDetails();
    }
  }, [url, playlistUrl]);

  const handleDownload = async (video, type) => {
    const itag =
      type === "video"
        ? selectedVideoItags[video.url]
        : selectedAudioItags[video.url];
    const base =
      type === "video" ? video.downloadVideoBase : video.downloadAudioBase;

    if (!itag) {
      setError("Please select a valid format.");
      return;
    }

    const format = video.formats.find((f) => f.itag.toString() === itag);
    if (!format) {
      setError("Invalid itag selected.");
      return;
    }

    const downloadUrl = `http://46.101.127.179:3001${base}${itag}&startTime=${startTime}&duration=${
      endTime - startTime
    }`;
    setOverallProgress(0); // Reset progress for this download
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

  const handlePlaylistDownload = async () => {
    if (!playlistData) return;
    const itag = selectedVideoItags.playlist;
    if (!itag) {
      setError("Please select a valid format for the playlist.");
      return;
    }

    for (const video of playlistData.videos) {
      await handleDownload(video, "video");
    }
  };

  const renderProgress = () => {
    return (
      <div className="progress-container mb-4">
        <div className="progress-bar h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="progress-bar-inner h-full bg-blue-600 text-center text-white"
            style={{ width: `${Math.round(overallProgress || 0)}%` }}
          >
            {Math.round(overallProgress || 0)}%
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderVideoControls = () => {
    if (!videoData) return null;
    const duration = videoData.duration;
    return (
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Select Video Quality:</h4>
        <select
          onChange={(e) =>
            setSelectedVideoItags({
              ...selectedVideoItags,
              [videoData.url]: e.target.value,
            })
          }
          value={selectedVideoItags[videoData.url] || ""}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="">Select Quality</option>
          {videoData.formats.map((format, index) => (
            <option key={`${format.itag}-${index}`} value={format.itag}>
              {format.qualityLabel} - {format.container}
            </option>
          ))}
        </select>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Select Video Segment:</h4>
          <Slider
            range
            min={0}
            max={duration}
            defaultValue={[0, duration]}
            onChange={([start, end]) => {
              setStartTime(start);
              setEndTime(end);
            }}
            marks={{
              0: formatTime(0),
              [duration]: formatTime(duration),
            }}
            step={1}
          />
          <div className="flex justify-between mt-2">
            <span>{formatTime(startTime)}</span>
            <span>{formatTime(endTime)}</span>
          </div>
        </div>
        <button
          onClick={() => handleDownload(videoData, "video")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 mt-2"
        >
          Download Video
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        {downloadMethod === null ? (
          <div className="flex flex-col items-center">
            <img
              src={hero_img}
              alt="Illustration"
              className="w-1/2 max-w-md mb-8"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <div
                onClick={() => setDownloadMethod("playlist")}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                <img
                  src={playlist}
                  alt="Download Playlist"
                  className="w-16 h-16 mb-4 mx-auto"
                />
                <span className="text-2xl font-semibold">
                  Download Playlist
                </span>
              </div>
              <div
                onClick={() => setDownloadMethod("single")}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                <img
                  src={single}
                  alt="Single Download"
                  className="w-16 h-16 mb-4 mx-auto"
                />
                <span className="text-2xl font-semibold">Single Download</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={(e) => e.preventDefault()} className="mb-8">
              <div className="flex">
                <input
                  type="text"
                  value={downloadMethod === "playlist" ? playlistUrl : url}
                  onChange={(e) =>
                    downloadMethod === "playlist"
                      ? setPlaylistUrl(e.target.value)
                      : setUrl(e.target.value)
                  }
                  placeholder={
                    downloadMethod === "playlist"
                      ? "Enter YouTube playlist URL"
                      : "Enter YouTube URL"
                  }
                  className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                  onClick={fetchDetails}
                  disabled={loading}
                >
                  {loading ? "Fetching..." : "Download"}
                </button>
              </div>
            </form>
            {loading && (
              <div className="flex justify-center">
                <div className="loading-dots">
                  <span className="w-3 h-3 bg-purple-600 rounded-full inline-block animate-bounce"></span>
                  <span className="w-3 h-3 bg-purple-600 rounded-full inline-block animate-bounce delay-200"></span>
                  <span className="w-3 h-3 bg-purple-600 rounded-full inline-block animate-bounce delay-400"></span>
                </div>
              </div>
            )}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {videoData && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  {videoData.title}
                </h3>
                <img
                  src={videoData.thumbnail}
                  alt={videoData.title}
                  className="w-full mb-4 rounded"
                />
                {renderVideoControls()}
                <div>
                  <h4 className="font-semibold mb-2">Select Audio Quality:</h4>
                  <select
                    onChange={(e) =>
                      setSelectedAudioItags({
                        ...selectedAudioItags,
                        [videoData.url]: e.target.value,
                      })
                    }
                    value={selectedAudioItags[videoData.url] || ""}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="">Select Quality</option>
                    {videoData.audioFormats.map((format, index) => (
                      <option
                        key={`${format.itag}-${index}`}
                        value={format.itag}
                      >
                        {format.bitrate}kbps - {format.container}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDownload(videoData, "audio")}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 mt-2"
                  >
                    Download Audio
                  </button>
                </div>
              </div>
            )}
            {playlistData && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  {playlistData.title}
                </h3>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">
                    Select Quality for Playlist:
                  </h4>
                  <select
                    onChange={(e) =>
                      setSelectedVideoItags({
                        ...selectedVideoItags,
                        playlist: e.target.value,
                      })
                    }
                    value={selectedVideoItags.playlist || ""}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="">Select Quality</option>
                    {playlistData.formats.map((format, index) => (
                      <option
                        key={`${format.itag}-${index}`}
                        value={format.itag}
                      >
                        {format.qualityLabel} - {format.container}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handlePlaylistDownload}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 mt-2"
                  >
                    Download Playlist
                  </button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Videos:</h4>
                  {playlistData.videos.map((video, index) => (
                    <div
                      key={video.url}
                      className="mb-4 p-4 border border-gray-200 rounded"
                    >
                      <img
                        src={video.thumbnails[0].url}
                        alt={video.title}
                        className="w-32 h-auto mb-2"
                      />
                      <p className="font-semibold">{video.title}</p>
                      <select
                        onChange={(e) =>
                          setSelectedVideoItags({
                            ...selectedVideoItags,
                            [video.url]: e.target.value,
                          })
                        }
                        value={selectedVideoItags[video.url] || ""}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="">Select Quality</option>
                        {video.formats.map((format, index) => (
                          <option
                            key={`${format.itag}-${index}`}
                            value={format.itag}
                          >
                            {format.qualityLabel} - {format.container}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDownload(video, "video")}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {downloading && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Download Queue</h3>
                {renderProgress()}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Downloader;
