import express from "express";
import MoviesController from "./movies.controller";

const router = express.Router();

// router.route("/").get((req, res) => res.send("Hello World"));

router.route("/").get(MoviesController.apiGetMovies);

export default router;
