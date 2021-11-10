import express from "express";
import mongodb from "mongodb";

const app = express();
const PORT = process.env.PORT || 3000;
const { DBHOST, DBNAME } = process.env;

(async () => {
  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db(DBNAME);
  const videosCollection = db.collection("videos");

  app.use(express.json());

  app.post("/viewed", (req, res) => {
    const { videoPath } = req.body;

    if (!videoPath) {
      res.sendStatus(400);
      return;
    }

    videosCollection
      .insertOne({ videoPath })
      .then(() => {
        console.log(`Added video ${videoPath} to history`);
        res.sendStatus(200);
      })
      .catch((err) => {
        console.error(
          `Error adding video ${videoPath} to history`,
          (err && err.stack) || err
        );
        res.sendStatus(500);
      });
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
