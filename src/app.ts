import express from "express";
import morgan from "morgan";
// import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./services/error.controller.js";
import fs from "fs";
// import https from "https";
import http from "http";

import AppError from "./utils/appError.js";
import getEnv from "./utils/env.js";
import userRouter from "./routes/user.router.js";
import boxRouter from "./routes/box.router.js";
import bookRouter from "./routes/book.router.js";
import { Server as WebSocketServer } from "ws";
import { audioName as globalAudioName } from "./state.js";
import path from "path";
// Serve static files

const app = express();
// Set security HTTP headers
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));

// Development logging
if (getEnv("NODE_ENV") === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour!",
// });

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
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

// const formatAudioPath = (path: string) => {
//   if (path.endsWith("dist")) {
//     return path;
//   }

//   if (path.endsWith("dist/")) {
//     return path;
//   }

//   if (path.endsWith("/")) {
//     return path + "dist/";
//   }

//   return path + "/dist/";
// };

app.get("/request-audio/:audioName", (req, res) => {
  console.log("heyooooo");
  const audioName = req.params.audioName;
  console.log({ audioName });
  console.log({ audioDirectory });
  const audioFilePath = path.join(audioDirectory, audioName);
  console.log({ audioFilePath });

  if (!fs.existsSync(audioFilePath)) {
    return res.status(404).send("Audio file not found");
  }

  const audioStream = fs.createReadStream(audioFilePath);

  res.setHeader("Content-Type", `audio/${audioName.split(".").pop()}`);

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
    const file = fs.createReadStream(audioFilePath, {
      start,
      end,
      highWaterMark: 8 * 1024,
    });
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

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

app.get("/uploadAudio", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "upload-audio.html"));
});

// Add success route
app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "success.html"));
});

// 3) ROUTES
app.use("/books", bookRouter);
app.use("/users", userRouter);
app.use("/box", boxRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const server = http.createServer(
  // {
  //   key: fs.readFileSync(path.resolve(__dirname, "ssl/key.pem")),
  //   cert: fs.readFileSync(path.resolve(__dirname, "ssl/cert.pem")),
  // },
  app
);

// getBogAccessToken().then((token) => console.log(token));
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws: any) => {
  const streamAudioToWebSocket = (audioName: string) => {
    const audioFilePath = path.join(__dirname, "audio", audioName);
    if (!fs.existsSync(audioFilePath)) {
      console.log("Audio file not found");
      ws.send("Audio file not found");
      return;
    }

    const audioStream = fs.createReadStream(audioFilePath, {
      highWaterMark: 8 * 1024,
    });
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
