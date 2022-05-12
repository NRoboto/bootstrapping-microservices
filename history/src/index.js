import express from "express";
import mongodb from "mongodb";
import amqp from "amqplib";

const VIEWED_EXCHANGE = "viewed";

const app = express();
const PORT = process.env.PORT || 3000;
const { DBHOST, DBNAME, RABBIT } = process.env;

const connectRabbit = async () => {
  const connection = await amqp.connect(RABBIT);

  return connection.createChannel();
};

/**
 * @param {amqp.Channel} messageChannel
 */
const bindViewedQueue = async (messageChannel) => {
  // Create the exchange if it doesn't exist
  await messageChannel.assertExchange(VIEWED_EXCHANGE, "fanout");
  // Create a queue (unnammed means Rabbit will generate a name)
  const { queue: queueName } = await messageChannel.assertQueue("", {
    exclusive: true,
  });
  // Bind the created queue to the exchange, this queue will act as a conduit between the exchange and this microservice (and no others)
  messageChannel.bindQueue(queueName, VIEWED_EXCHANGE, "");
  return queueName;
};

(async () => {
  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db(DBNAME);
  const videosCollection = db.collection("videos");
  const messageChannel = await connectRabbit();
  const viewedQueue = await bindViewedQueue(messageChannel);

  messageChannel.consume(viewedQueue, async (msg) => {
    const parsedMessage = JSON.parse(msg.content.toString());

    await videosCollection.insertOne({ videoPath: parsedMessage.videoPath });
    messageChannel.ack(msg);
  });

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
