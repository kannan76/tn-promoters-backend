import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { registerRoutes } from "./routes";

const app = express();
app.use(cors());
app.use(bodyParser.json());

registerRoutes(app).then((server) => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log("Backend running on port", PORT);
  });
});
