/*movies data access object, allow our code to access movie(s) in our database.*/

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
}
