import express from "express";
import { Storage } from "@google-cloud/storage";

const PORT = process.env.PORT || 3000;
const {
  GOOGLE_CREDENTIALS_EMAIL,
  GOOGLE_CREDENTIALS_PRIVATE_KEY,
  GOOGLE_PROJECT_ID,
} = process.env;

const app = express();

app.get("/video", async (req, res) => {
  const videoPath = req.query.path;

  if (!videoPath) {
    return res.sendStatus(400);
  }

  const storage = new Storage({
    projectId: GOOGLE_PROJECT_ID,
    credentials: {
      client_email: GOOGLE_CREDENTIALS_EMAIL,
      private_key: GOOGLE_CREDENTIALS_PRIVATE_KEY.replace(
        new RegExp("\\\\n", "g"),
        "\n"
      ),
    },
  });
  const bucketName = "video-storage-5a8cc1b99370";

  const file = storage.bucket(bucketName).file(videoPath);

  const [fileExists] = await file.exists();

  if (!fileExists) {
    return res.sendStatus(404);
  }

  res.writeHead(200, {
    "Content-Length": file.metadata.size,
    "Content-Type": "video/mp4",
  });

  file
    .createReadStream()
    .on("error", () => res.sendStatus(500))
    .pipe(res);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
