import express, { Router } from "express";

const PORT = process.env.PORT || 3000;

const app = express();

(async () => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
