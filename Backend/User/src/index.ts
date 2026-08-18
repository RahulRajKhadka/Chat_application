import dotenv from "dotenv";
import express from "express";
import connectDb from "./config/db.js";
import dns from "node:dns";
import { createClient } from "redis";

import userRoutes from "./routes/user.js"

const PORT = process.env.PORT || 5000;
const REDIS_URL = process.env.REDIS_URL;

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();

app.use("api/v1",userRoutes)


if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}

export const redisClient = createClient({
  url: REDIS_URL,
});



try {
  await connectDb();
  await redisClient.connect();
  console.log("connected to redis");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (err) {
  console.error("Startup failed:", err);
  process.exit(1);
}