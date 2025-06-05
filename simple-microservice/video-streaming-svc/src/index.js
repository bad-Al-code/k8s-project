import express from "express";
import http from "node:http";
import fs from "node:fs";

if (!process.env.PORT) {
  throw new Error(`PORT is not defined`);
}

if (!process.env.VIDEO_STORAGE_HOST) {
  throw new Error(`VIDEO_STORAGE_HOST is not defined`);
}

if (!process.env.VIDEO_STORAGE_PORT) {
  throw new Error(`VIDEO_STORAGE_PORT is not defined`);
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);

const app = express();

app.get("/video", (req, res) => {
  // const videoPath = "./videos/demo.mp4";
  // const stats = await fs.promises.stat(videoPath);
  // res.writeHead(200, {
  //   "Content-Length": stats.size,
  //   "Content-Type": "video/mp4",
  // });
  // fs.createReadStream(videoPath).pipe(res);

  const options = {
    host: VIDEO_STORAGE_HOST,
    port: VIDEO_STORAGE_PORT,
    path: "/video?path=videos/demo.mp4",
    method: "GET",
    headers: req.headers,
  };

  const forwardRequest = http.request(options, (forwardResponse) => {
    console.log(
      `Got response from video-storage-svc: ${forwardResponse.statusCode}`
    );

    res.writeHead(forwardResponse.statusCode, forwardResponse.headers);
    forwardResponse.pipe(res);
  });

  forwardRequest.on("error", (err) => {
    console.error(`Error forwarding request to video-storage-svc:`, err);
    res.status(502).send("Bad Gateway");
  });

  forwardRequest.end();
});

app.listen(PORT, () => {
  console.log(`Listening at ${PORT}`);
  console.log(`Access this service at http://localhost:4001/video`);
});
