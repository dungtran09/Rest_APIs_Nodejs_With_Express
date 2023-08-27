const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env",
});

process.on("uncaughtException", (err) => {
  console.log(err.name, ": " + err.message);
  console.log("Uncaught Exeption occured!. Shutting down.");

  process.exit(1);
});

const app = require("./app");

// Create connect to remote db
mongoose
  .connect(process.env.REMOTE_DB_CONN_STR, { useNewUrlParser: true })
  .then((conn) => {
    console.log("Database connect successful!");
  });

const port = process.env.PORT || 8081;

const server = app.listen(port, () => {
  console.log("Sever starting on post: " + port);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, ": " + err.message);
  console.log("Unhandled Rejection occured!. Shutting down.");

  // close server when connect fail
  server.close(() => {
    process.exit(1);
  });
});
