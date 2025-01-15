/*movies data access object, allow our code to access movie(s) in our database.*/

import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let movies;

export default class MoviesDAO {
  /*called as soon as the server starts, provides database reference to movies.*/
  static async injectDB(conn) {
    if (movies) {
      return;
    }
    /*connect to database, movies collection.*/
    try {
      movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection("movies");
    } catch (e) {
      /*fail to get reference send error.*/
      console.error(`unable to connect in MoviesDAO: ${e}`);
    }
  }

  /*method to get all movies from the database:
  -getMovies method accepts filter object as it's argument
  -default filter has no filters, retrieves results at page 0, retrieves 20 movies
  */
  static async getMovies({
    filters = null,
    page = 0,
    moviesPerPage = 20,
  } = {}) {
    //query variable, empty unless a user specifies filters, which put together a query
    let query;
    if (filters) {
      if (filters.hasOwnProperty("title")) {
        //use $text and $search query operators: to search for movie titles with user specified terms
        //$text: allows us to query using multiple words with spaces
        query = { $text: { $search: filters["title"] } };
      } else if (filters.hasOwnProperty("rated")) {
        query = { rated: { $eq: filters["rated"] } };
      }
    }

    //find all movies that fit our query, assign to cursor
    //cursor fetches documents in batches to save memory, network bandwidth usage
    let cursor;
    try {
      cursor = await movies
        .find(query)
        .limit(moviesPerPage) //caps the number of documents returned
        .skip(moviesPerPage * page); //skip applies first(allows us to create pagination), limit: applies to the documents left over
      const moviesList = await cursor.toArray();
      //get total number of movies in query
      const totalNumMovies = await movies.countDocuments(query);
      //and return
      return { moviesList, totalNumMovies };
    } catch (e) {
      //if theres an error return empty: moviesList, and totalNumMovies to be 0
      console.error(`Unable to issue find command, ${e}`);
      return { moviesList: [], totalNumMovies: 0 };
    }
  }

  static async getRatings() {
    let ratings = [];
    try {
      ratings = await movies.distinct("rated"); //get all dinstict rated values from movies collection
      return ratings; //return result in array
    } catch (e) {
      console.error(`Unable to get ratings, ${e}`);
      return ratings;
    }
  }

  /*getMovieById method designed to retrieve a movie by its ID and include associated reviews
   by aggregating data from two collections, movies and reviews, in MongoDB.*/
  static async getMovieById(id) {
    try {
      return await movies
        .aggregate([
          {
            //look for movie document that matches specified id
            $match: {
              _id: new ObjectId(id),
            },
          },
          //Matches the _id field in the movies collection with the movie_id field in the reviews collection.
          {
            $lookup: {
              from: "reviews", //collection to join
              localField: "_id", //field from the input document
              foreignField: "movie_id", //field from document of the "from" collection
              as: "reviews", //output array field
            },
          },
        ]) //find all reviews with specific movie id and return together with the movie in an array
        .next();
    } catch (e) {
      console.error(`Something went wrong in getMovieById: ${e}`);
      throw e;
    }
  }
}
