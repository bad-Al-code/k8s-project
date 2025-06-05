import express from "express";
import http from "node:http";
import mongodb from "mongodb";

if (!process.env.PORT) {
  throw new Error(`PORT is not defined`);
}

if (!process.env.VIDEO_STORAGE_HOST) {
  throw new Error(`VIDEO_STORAGE_HOST is not defined`);
}

if (!process.env.VIDEO_STORAGE_PORT) {
  throw new Error(`VIDEO_STORAGE_PORT is not defined`);
}
if (!process.env.DBNAME) {
  throw new Error(`DBNAME is not defined`);
}
if (!process.env.DBHOST) {
  throw new Error(`DBHOST is not defined`);
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = parseInt(process.env.DBHOST);
const DBNAME = parseInt(process.env.DBNAME);

async function main() {
  const mongoClient = await mongodb.MongoClient.connect(DBHOST);
  const db = mongoClient.db(DBNAME);
  const videosCollection = db.collection("videos");

  const app = express();

  app.get("/video", (req, res) => {
    const videoId = new mongodb.ObjectId(req.query.id);
    const videoRecord = new videosCollection.findOne({ _id: videoId });

    if (!videoRecord) {
      res.sendStatus(404);
      return;
    }

    const options = {
      host: VIDEO_STORAGE_HOST,
      port: VIDEO_STORAGE_PORT,
      path: `/video?path=${videoRecord.videoPath}`,
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
}

main().catch((err) => {
  console.error("Microservice failed to start");
  console.error((err && err.stack) || err);
});
