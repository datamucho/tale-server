import createApp from "./app";
import getEnv from "./utils/env";

const port = getEnv("PORT") || 8080;
const startServer = async () => {
  process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
  });

  const server = await createApp();

  server.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });

  process.on("unhandledRejection", (err: { name: string; message: string }) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
