# YouTube Video Downloader Frontend

This project provides a frontend interface for downloading YouTube videos and audio using the backend service. The frontend is built with React and allows users to input YouTube URLs, select formats, and download the desired video or audio.

## Features

- Input YouTube URL to fetch video details
- Display available video and audio formats
- Download video and audio
- Progress indication during download

## Prerequisites

- Node.js (>= v14)
- Backend service running

## Installation

1. Clone the repository:
  ```
   git clone https://github.com/your-username/yt-video-downloader-frontend.git
   cd yt-video-downloader-frontend
```
Install dependencies:
```
npm install
```
Configuration
Create a .env file in the root directory and add the following configuration variables:
```
REACT_APP_BACKEND_URL=http://localhost:3000
```
Replace http://localhost:3000 with the URL of your backend service if it's different.

Usage
Start the development server:

```
npm run dev
```
The application will start listening on the port specified by Create React App, usually http://localhost:5173.

Available Scripts
In the project directory, you can run:
```
npm run dev
```
Runs the app in the development mode.
Open http://localhost:5173 to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.
```
npm run build
```
Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about deployment for more information.

API Endpoints
The frontend interacts with the backend service through the following endpoints:
```
Fetch Video Details
URL: /api/v1/downloads/video
Method: POST
Body:
json
Copy code
{
  "url": "https://www.youtube.com/watch?v=example"
}
Response:
json
Copy code
{
  "title": "Video Title",
  "thumbnail": "https://img.youtube.com/vi/example/maxresdefault.jpg",
  "formats": [
    {
      "qualityLabel": "1080p",
      "itag": 137,
      "container": "mp4"
    },
    ...
  ],
  "audioFormats": [
    {
      "bitrate": 128,
      "itag": 140,
      "container": "mp4"
    },
    ...
  ],
  "downloadVideoBase": "/api/v1/downloads/video/download?url=https://www.youtube.com/watch?v=example&itag=",
  "downloadAudioBase": "/api/v1/downloads/audio/download?url=https://www.youtube.com/watch?v=example&itag="
}
Download Video
URL: /api/v1/downloads/video/download
Method: GET
Query Params:
url: The encoded URL of the YouTube video.
itag: The itag of the video format to download.
Response: The video file.
Download Audio
URL: /api/v1/downloads/audio/download
Method: GET
Query Params:
url: The encoded URL of the YouTube video.
itag: The itag of the audio format to download.
Response: The audio file.
```
Contributing
Feel free to fork this repository and submit pull requests. Any contributions are welcome!

**Hosted the frontend on digital ocean droplet **
```
ytclip.live
```
**I HOSTED THE BACKEND ON DIGITAL OCEAN AND AWS AS WELL**
```
https://ytclipbackend.online/
```
Note:Im first time deploying to vps ssh etc so i did *** the code in process so im now going to learn about hosting
