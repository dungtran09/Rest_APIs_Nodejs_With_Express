const express = require("express");
const morgan = require("morgan");
const moviesRouter = require("./Router/moviesRoutes");
const authRouter = require("./Router/authRouter");
const CustomError = require("./Utils/CustomError");
const globalErrorHandler = require("./Controller/errorController");

const app = express();

app.use(express.json());
app.use(express.static("./public/"));

// middleware of thirth path to log in console when has request to express
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  req.requestAt = new Date().toISOString();
  next();
});

// using router
app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/users", authRouter);

app.all("*", (req, res, next) => {
  const err = new CustomError(`Url ${req.originalUrl} not found!`, 404);
  next(err);
});
app.use(globalErrorHandler);

module.exports = app;
