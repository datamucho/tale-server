import app from "./app";
import getEnv from "./utils/env";
import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const DB = getEnv("DB")
  .replace("<password>", getEnv("DB_PASSWORD"))
  .replace("<name>", getEnv("DB_NAME"));

mongoose.connect(DB).then(() => console.log("DB connection successful!"));

const port = getEnv("PORT") || 8080;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err: { name: string; message: string }) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
