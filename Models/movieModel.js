const fs = require("fs");
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required field!"],
      unique: true,
      maxLength: [100, "Movie name must not has more than 100 characters."],
      minLength: [4, "Movie name must has at least 4 characters."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required field!"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "duration is required field!"],
    },
    ratings: {
      type: Number,
      // min: [1, "Rating must be 1.0 or above!"],
      // max: [10, "Rating must be 10.0 or below!"],
      validate: {
        validator: function (value) {
          return value >= 1 && value <= 10;
        },
        message: "Ratings should be above 1.0 and below 10.0.",
      },
    },
    totalRating: {
      type: Number,
    },
    releaseYear: {
      type: Number,
      required: [true, "releaseYear is required field!"],
    },
    releaseDate: {
      type: Date,
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    genres: {
      type: [String],
      required: [true, "genres is required field!"],
      // enum: {
      //   values: [
      //     "Action",
      //     "Adventure",
      //     "Sci-Fi",
      //     "Thriller",
      //     "Crime",
      //     "Drama",
      //     "Comedy",
      //     "Romance",
      //     "Biography",
      //   ],
      //   message: "This genre does not exist",
      // },
    },
    directors: {
      type: [String],
      required: [true, "directors is required field!"],
    },
    coverImage: {
      type: String,
      required: [true, "coverImage is required field!"],
    },
    actors: {
      type: [String],
      required: [true, "actors is required field!"],
    },
    price: {
      type: Number,
      required: [true, "price is required field!"],
    },
    createdBy: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});

movieSchema.pre("save", function (next) {
  this.createdBy = "Dung Tran";
  next();
});

movieSchema.post("save", function (doc, next) {
  const content = `\n----------------------\nName movie: ${
    doc.name
  }\nCreated by: ${
    doc.createdBy
  }\n${new Date().toDateString()}\n----------------------\n`;
  fs.writeFileSync("./log/history.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

movieSchema.pre(/^find/, function (next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  next();
});

movieSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } });
  next();
});

const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
