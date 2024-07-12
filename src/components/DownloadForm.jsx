import React, { useState } from "react";
import axios from "axios";

const DownloadForm = () => {
  const [url, setUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/downloads/video",
        { url }
      );
      setVideoData(response.data);
      setError("");
    } catch (error) {
      setError(error.response.data);
      setVideoData(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL"
        />
        <button type="submit">Download</button>
      </form>
      {error && <p>{error}</p>}
      {videoData && (
        <div>
          <h3>{videoData.title}</h3>
          <img src={videoData.thumbnail} alt={videoData.title} />
          <a href={`http://localhost:3000${videoData.download}`} download>
            Download Video
          </a>
        </div>
      )}
    </div>
  );
};

export default DownloadForm;
