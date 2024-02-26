import express from "express";
import fs from "fs";
import path from "path";
import stream from "stream";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/stream", (req, res) => {
  const filePath = path.join(__dirname, "./assets/audios/redhat.mp3");

  res.setHeader("Content-Type", "audio/mp3");

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

let currentAudioSource: string = "http://example.com/default-audio.mp3";

app.get("/stream-audio", async (req, res) => {
  try {
    const response = await fetch(currentAudioSource);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch the audio source: ${response.statusText}`
      );
    }

    // Set headers to handle audio stream, adjust as needed based on the audio content type
    res.setHeader("Content-Type", "audio/mpeg");

    // Convert the response body to a readable stream and pipe it to the response
    const buffer = Buffer.from(await response.arrayBuffer());
    const readableStream = stream.Readable.from(buffer);
    readableStream.pipe(res);
  } catch (error) {
    console.error("Error streaming audio:", error);
    res.status(500).send("Failed to stream audio");
  }
});

app.post("/change-audio", express.json(), (req, res) => {
  const { newSource } = req.body;
  if (newSource) {
    currentAudioSource = newSource; // Update the global audio source
    res.json({ success: true, message: "Audio source updated." });
  } else {
    res
      .status(400)
      .json({ success: false, message: "No new source provided." });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
