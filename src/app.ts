import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./services/error.controller.js";
import fs from "fs";
import http from "http";

import AppError from "./utils/appError.js";
import getEnv from "./utils/env.js";
import bookModule from "./modules/book.module.js";
import userRouter from "./routes/user.router.js";
import boxRouter from "./routes/box.router.js";
import { Server as WebSocketServer } from "ws";
import { audioName as globalAudioName } from "./state.js";
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

app.get("/audio/:audioName", (req, res) => {
  const audioName = req.params.audioName;
  res.sendFile(path.join(__dirname, "audio", audioName));
});

app.use("/audio", express.static(path.join(__dirname, "audio")));

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

app.get("/radio-audio/:audioName", (req, res) => {
  const audioName = req.params.audioName;
  const audioFilePath = path.join(audioDirectory, audioName);
  const stat = fs.statSync(audioFilePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(audioFilePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio/mpeg",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    };
    res.writeHead(200, head);
    fs.createReadStream(audioFilePath).pipe(res);
  }
});

// 3) ROUTES
app.use("/books", bookModule.getRouter());
app.use("/users", userRouter);
app.use("/box", boxRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws: any) => {
  const streamAudioToWebSocket = (audioName: string) => {
    console.log({ audioName });
    const audioFilePath = path.join(__dirname, "audio", audioName);
    if (!fs.existsSync(audioFilePath)) {
      console.log("Audio file not found");
      ws.send("Audio file not found");
      return;
    }

    const audioStream = fs.createReadStream(audioFilePath);
    audioStream.on("data", (chunk) => {
      ws.send(chunk, { binary: true });
    });

    audioStream.on("end", () => {
      console.log("Finished streaming audio");
    });

    audioStream.on("error", (err) => {
      console.error("Error streaming audio:", err);
      ws.send("Internal Server Error");
    });
  };

  streamAudioToWebSocket(globalAudioName);

  ws.on("message", (message: string) => {
    console.log(`Received message: ${message}`);
  });
});

export default server;
