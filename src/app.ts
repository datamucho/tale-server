import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./services/error.controller.js";
import fs from "fs";

import AppError from "./utils/appError.js";
import getEnv from "./utils/env.js";
import bookModule from "./modules/book.module.js";
import userRouter from "./routes/user.router.js";
import boxRouter from "./routes/box.router.js";

import path from "path";

const app = express();

// Set security HTTP headers
app.use(helmet());

// Development logging
if (getEnv("NODE_ENV") === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [], // ad params here
  })
);

app.use("/audio", express.static(path.join(__dirname, "audio")));

app.get("/audio/:audioName", (req, res) => {
  const audioName = req.params.audioName;
  res.sendFile(path.join(__dirname, "audio", audioName));
});

const audioDirectory = path.join(__dirname, "audio");

app.get("/request-audio/:audioName", (req, res) => {
  const audioName = req.params.audioName;
  const audioFilePath = path.join(audioDirectory, audioName);

  if (!fs.existsSync(audioFilePath)) {
    return res.status(404).send("Audio file not found");
  }

  const audioStream = fs.createReadStream(audioFilePath);

  res.setHeader("Content-Type", "audio/mp3");

  audioStream.pipe(res);

  audioStream.on("error", (err) => {
    console.error("Error streaming audio:", err);
    res.status(500).send("Internal Server Error");
  });
});

// 3) ROUTES
app.use("/books", bookModule.getRouter());
app.use("/users", userRouter);
app.use("/box", boxRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
