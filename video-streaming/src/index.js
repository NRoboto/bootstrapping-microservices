import express from "express";
import fs from "fs";
import http from "http";

const app = express();
const PORT = process.env.PORT || 3000;
const { VIDEO_STORAGE_HOST, VIDEO_STORAGE_PORT } = process.env;

app.get("*", (req, _res, next) => {
  console.log(`Request from ${req.ip} for route ${req.path}`);

  next();
});

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.get("/video", (req, res) => {
  const forwardReq = http.request(
    {
      host: VIDEO_STORAGE_HOST,
      port: VIDEO_STORAGE_PORT,
      path: "/video?path=SampleVideo_1280x720_1mb.mp4",
      method: "GET",
      headers: req.headers,
    },
    (forwardRes) => {
      res.writeHead(forwardRes.statusCode, forwardRes.headers);
      forwardRes.pipe(res);
    }
  );

  req.pipe(forwardReq);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
