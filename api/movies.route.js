import express from "express";
import MoviesController from "./movies.controller.js";
import ReviewsController from "./reviews.controller";

const router = express.Router();

// router.route("/").get((req, res) => res.send("Hello World"));

router.route("/").get(MoviesController.apiGetMovies);

router
  .route("/review")
  .post(ReviewsController.apiPostReview)
  .put(ReviewsController.apiUpdateReview)
  .delete(ReviewsController.apiDeleteReview);

export default router;
