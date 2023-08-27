const { param } = require("../Router/moviesRoutes");
const Movie = require("../Models/movieModel");
const ApiFeatures = require("../Utils/ApiFeatures");
const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const CustomError = require("../Utils/CustomError");

// to get top 5 highested movies
exports.getHighestRated = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratings";
  next();
};

// to create new movie
exports.createMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({
    status: "Success",
    data: {
      movie,
    },
  });
});

// to get all movies
exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {
  const features = new ApiFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const movies = await features.query;

  res.status(200).json({
    status: "Success",
    length: movies.length,
    data: {
      movies,
    },
  });
});

// to get a movie
exports.getMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    const err = new CustomError(`The id: ${req.params.id} is not found!`, 404);
    return next(err);
  }

  res.status(200).json({
    status: "Success",
    data: {
      movie,
    },
  });
});

// to update an movie
exports.updateMovie = asyncErrorHandler(async (req, res, next) => {
  const movieToUpdate = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!movieToUpdate) {
    const err = new CustomError(`The id: ${req.params.id} is not found!`, 404);
    return next(err);
  }

  res.status(200).json({
    status: "Success",
    data: {
      movie: movieToUpdate,
    },
  });
});

// to delete an movie
exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {
  const movieToDelete = await Movie.findByIdAndDelete(req.params.id);

  if (!movieToDelete) {
    const err = new CustomError(`The id: ${req.params.id} is not found!`, 404);
    return next(err);
  }

  res.status(204).json({
    status: "Success",
    data: movieToDelete,
  });
});

// to caculate satatitic of movies
exports.getMoviesStats = asyncErrorHandler(async (req, res, next) => {
  const stats = await Movie.aggregate([
    { $match: { ratings: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$releaseYear",
        avgRating: { $avg: "$ratings" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        totalPrice: { $sum: "$price" },
        movieCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    // { $match: { maxPrice: { $gte: 60 } } },
  ]);

  res.status(200).json({
    status: "Success",
    length: stats.length,
    data: {
      stats,
    },
  });
});

// to get genre movie
exports.getMoviesByGenre = asyncErrorHandler(async (req, res, next) => {
  const genre = req.params.genre;
  const movies = await Movie.aggregate([
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        movieCount: { $sum: 1 },
        movies: { $push: "$name" },
      },
    },
    { $addFields: { genre: "$_id" } },
    { $project: { _id: 0 } },
    { $sort: { movieCount: 1 } },
    // { $limit: 5 },
    { $match: { genre: genre } },
  ]);
  res.status(200).json({
    status: "Success",
    length: movies.length,
    data: {
      movies,
    },
  });
});
