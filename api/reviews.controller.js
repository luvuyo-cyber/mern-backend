/*create the routes to post, put and delete reviews.*/
import ReviewsDAO from "../dao/reviewsDAO.js";

export default class ReviewsController {
  //data passed in as the request's body
  static async apiPostReview(req, res, next) {
    try {
      //we extract from the request's body
      const movieId = req.body.movie_id;
      const review = req.body.review;
      const userInfo = {
        name: req.body.name,
        _id: req.body.user_id,
      };

      const date = new Date();

      //we send information to addReview
      const ReviewResponse = await ReviewsDAO.addReview(
        movieId,
        userInfo,
        review,
        date
      );

      //return "success"/ error message
      res.json({ status: "success " });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiUpdateReview(req, res, next) {
    try {
      const reviewId = req.body.review_id;
      const review = req.body.review;

      const date = new Date();

      //call updateReview and pass in user_id to ensure that user updating review created it
      const ReviewResponse = await ReviewsDAO.updateReview(
        reviewId,
        req.body.user_id,
        review,
        date
      );

      var { error } = ReviewResponse;
      if (error) {
        res.status.json({ error });
      }

      //updateReview returns ReviewResponse with property modifiedCount
      //modifiedCount contains number of modified documents, if zero throws error, review not updated
      if (ReviewResponse.modifiedCount === 0) {
        throw new Error(
          "Unable to update review. User may not be original poster."
        );
      }
      res.json({ status: "success " });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiDeleteReview(req, res, next) {
    try {
      const reviewId = req.body.review_id;
      const userId = req.body.user_id;

      //ensure user deleting the view created the view
      const ReviewResponse = await ReviewsDAO.deleteReview(reviewId, userId);
      res.json({ status: "success " });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}
