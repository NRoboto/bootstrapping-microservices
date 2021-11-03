import express from "express";
import fs from "fs";

const app = express();
const PORT = process.env.PORT;
const PATH = "videos/SampleVideo_1280x720_1mb.mp4";

if (!PORT) {
  throw new Error('Environment variable "PORT" must be set');
}

app.get("*", (req, _res, next) => {
  console.log(`Request from ${req.ip} for route ${req.path}`);

  next();
});

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.get("/video", (_req, res) => {
  const stats = fs.statSync(PATH);

  res.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": "video/mp4",
  });

  fs.createReadStream(PATH).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
