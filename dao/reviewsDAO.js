import mongodb from "mongodb";
//import to get access to ObjectId, need ObjectId to convert id string to a mongodb ObjectId
const ObjectId = mongodb.ObjectId;

let reviews;

export default class ReviewsDAO {
  static async injectDB(conn) {
    //if reviews not filled, we access the database reviews collection
    if (reviews) {
      return;
    }
    try {
      reviews = await conn
        .db(process.env.MOVIEREVIEWS_NS)
        .collection("reviews");
    } catch (e) {
      console.error(
        `Unable to establish connection handle in reviewsDAO: ${e}`
      );
    }
  }

  static async addReview(movieId, user, review, date) {
    try {
      const reviewDoc = {
        name: user.name,
        user_id: user._id,
        date: date,
        review: review,
        movie_id: ObjectId(movieId), //we convert movieId string to a mongodb object id
      };
      return await reviews.insertOne(reviewDoc); //insert reviewDoc into reviews collection
    } catch (e) {
      console.error(`Unable to post review: ${e}`);
      return { error: e };
    }
  }

  static async updateReview(reviewId, userId, review, date) {
    try {
      const updateResponse = await reviews.updateOne(
        { user_id: userId, _id: ObjectId(reviewId) }, //filter for an existing review created by userId and with reviewId
        { $set: { review: review, date: date } } //if review exists, update with this argument(new review text and date)
      );
      return updateResponse;
    } catch (e) {
      console.error(`Unable to update review: ${e}`);
      return { error: e };
    }
  }

  static async deleteReview(reviewId, userId) {
    try {
      const deleteResponse = await reviews.deleteOne({
        _id: ObjectId(reviewId), //specify ObjectId(reviewId) for an existing review created by userId
        user_id: userId,
      });
      return deleteResponse;
    } catch (e) {
      console.error(`Unable to delete review: ${e}`);
      return { error: e };
    }
  }
}
