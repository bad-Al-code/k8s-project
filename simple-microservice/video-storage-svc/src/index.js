import "dotenv/config";
import express from "express";
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

if (!process.env.PORT) {
  throw new Error(`PORT is not defined`);
}

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error(`AWS_ACCESS_KEY_ID is not defined`);
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error(`AWS_SECRET_ACCESS_KEY is not defined`);
}

if (!process.env.S3_BUCKET_NAME) {
  throw new Error(`S3_BUCKET_NAME is not defined`);
}

if (!process.env.AWS_REGION) {
  throw new Error(`AWS_REGION is not defined`);
}

const PORT = process.env.PORT;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const app = express();

app.get("/video", async (req, res) => {
  const videoObjectKey = req.query.path;
  if (!videoObjectKey) {
    res
      .status(400)
      .send('Please specify a video path withe the "path" query parameter');

    return;
  }

  try {
    // Get video metadata
    const headObjectCommand = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: videoObjectKey,
    });

    const headData = await s3Client.send(headObjectCommand);
    const contentLength = headData.ContentLength;
    const contentType = headData.ContentType || "video/mp4";

    res.writeHead(200, {
      "Content-Length": contentLength,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    });

    // Get video object stream
    const getObjectCommand = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: videoObjectKey,
    });

    const { Body } = await s3Client.send(getObjectCommand);

    if (Body && typeof Body.pipe === "function") {
      Body.pipe(res);
    } else {
      console.error(
        `S3 Body is not a readable stream for object: ${videoObjectKey}`
      );
      res.status(500).send("Error streaming video.");
    }
  } catch (error) {
    console.error(`Error fetching video from S3: ${error}`);

    if (error.name === "NoSuchKey") {
      res.status(404).send("Video not found.");
    } else if (error.name === "AccessDenied") {
      res.status(403).send("Access denied to video.");
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Listening at ${PORT}`);
  console.log(
    `Access this service at http://localhost:${PORT}/video?path=videos/demo.mp4`
  );
});
