import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

app.get("/stream", (req, res) => {
  const filePath = path.join(__dirname, "./assets/audios/redhat.mp3");

  res.setHeader("Content-Type", "audio/mp3");

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
