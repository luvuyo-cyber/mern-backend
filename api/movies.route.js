import express from "express";
import MoviesController from "./movies.controller.js";
import ReviewsController from "./reviews.controller.js";

const router = express.Router();

// router.route("/").get((req, res) => res.send("Hello World"));

router.route("/").get(MoviesController.apiGetMovies);
router.route("/id/:id").get(MoviesController.apiGetMovieById); //for specific movie and all reviews associated
router.route("/ratings").get(MoviesController.apiGetRatings); //to list movie ratings in dropdown menu
router
  .route("/review")
  .post(ReviewsController.apiPostReview)
  .put(ReviewsController.apiUpdateReview)
  .delete(ReviewsController.apiDeleteReview);

export default router;
