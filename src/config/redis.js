import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => console.log("Redis Client Error", err));

// لما Redis ينجح في الاتصال
redisClient.on("connect", () => console.log("Redis Client connected"));

await redisClient.connect();

export default redisClient;