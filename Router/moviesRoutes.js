const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");
const moviesController = require("../Controller/moviesController");

// router.param("id", moviesController.findID);
router
  .route("/highest-rated")
  .get(moviesController.getHighestRated, moviesController.getAllMovies);

router.route("/movies-stats").get(moviesController.getMoviesStats);

router.route("/movies-by-genre/:genre").get(moviesController.getMoviesByGenre);

router
  .route("/")
  .get(authController.protect, moviesController.getAllMovies)
  .post(moviesController.createMovie);

router
  .route("/:id")
  .get(authController.protect, moviesController.getMovie)
  .patch(moviesController.updateMovie)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    moviesController.deleteMovie,
  );

module.exports = router;
