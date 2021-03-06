import express from "express";
import http from "http";
import mongodb from "mongodb";
import amqp from "amqplib";

const VIEWED_EXCHANGE = "viewed";

const app = express();
const PORT = process.env.PORT || 3000;
const { VIDEO_STORAGE_HOST, VIDEO_STORAGE_PORT, DBHOST, DBNAME, RABBIT } =
  process.env;

const sendViewedMessage = (messageChannel, videoPath) => {
  messageChannel.publish(
    VIEWED_EXCHANGE,
    "",
    Buffer.from(JSON.stringify({ videoPath }))
  );
};

const connectRabbit = async () => {
  const connection = await amqp.connect(RABBIT);

  return connection.createChannel();
};

(async () => {
  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db(DBNAME);
  const videosCollection = db.collection("videos");
  const messageChannel = await connectRabbit();
  messageChannel.assertExchange(VIEWED_EXCHANGE, "fanout");

  app.get("*", (req, _res, next) => {
    console.log(`Request from ${req.ip} for route ${req.path}`);

    next();
  });

  app.get("/video", async (req, res) => {
    const videoId = req.query.id;

    const videoRecord = await videosCollection
      .findOne({ _id: videoId })
      .catch((err) => {
        console.error("Database query failed", (err && err.stack) || err);
        res.sendStatus(500);
      });

    if (!videoRecord) {
      res.sendStatus(404);
      return;
    }

    const forwardReq = http.request(
      {
        host: VIDEO_STORAGE_HOST,
        port: VIDEO_STORAGE_PORT,
        path: `/video?path=${videoRecord.path}`,
        method: "GET",
        headers: req.headers,
      },
      (forwardRes) => {
        sendViewedMessage(messageChannel, videoRecord.path);
        res.writeHead(forwardRes.statusCode, forwardRes.headers);
        forwardRes.pipe(res);
      }
    );

    req.pipe(forwardReq);
  });

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
})().catch((err) => {
  console.error("Service failed to start", (err && err.stack) || err);
});
