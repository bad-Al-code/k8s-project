import express from "express";
import fs from "node:fs";

if (!process.env.PORT) {
  throw new Error(`PORT is not defined`);
}

const PORT = process.env.PORT;
const app = express();

app.get("/video", async (req, res) => {
  const videoPath = "./videos/demo.mp4";
  const stats = await fs.promises.stat(videoPath);
  res.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": "video/mp4",
  });
  fs.createReadStream(videoPath).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Listening at ${PORT}`);
});
