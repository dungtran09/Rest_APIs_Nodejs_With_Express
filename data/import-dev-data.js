const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Movie = require("../Models/movieModel");

dotenv.config({ path: "../config.env" });

// Connect to mongodb
mongoose
  .connect(process.env.REMOTE_CONN_STR, { useNewUrlParser: true })
  .then((conn) => {
    console.log("DB connect successful!");
  })
  .catch((error) => {
    console.log("Some error has occured!");
  });

const movies = JSON.parse(fs.readFileSync("./movies.json", "utf-8"));

// to del collections data if exists in db
const delMoviesData = async () => {
  try {
    await Movie.deleteMany();
    console.log("Del data successful!");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

// to import new data to db
const importMoviesData = async () => {
  try {
    await Movie.create(movies);
    console.log("Import data successful!");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

// to execute file using comandline with each of two flags (--import or --del)
if (process.argv[2] === "--import") {
  importMoviesData();
} else if (process.argv[2] === "--del") {
  delMoviesData();
}
