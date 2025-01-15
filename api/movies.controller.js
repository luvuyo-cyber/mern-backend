/*create movies controller that the route file will use to access the dao file.*/

import MoviesDAO from "../dao/moviesDAO.js";

export default class MoviesController {
  //when apiGetMovies is called, there is a query string in response object(req.query)
  static async apiGetMovies(req, res, next) {
    //check if moviesPerPage/page exists, then parse it into integer
    const moviesPerPage = req.query.moviesPerPage
      ? parseInt(req.query.moviesPerPage)
      : 20;
    const page = req.query.page ? parseInt(req.query.page) : 0;

    let filters = {}; //start with empty filter
    //check if rated/title query exists, then add to the filter object
    if (req.query.rated) {
      filters.rated = req.query.rated;
    } else if (req.query.title) {
      filters.title = req.query.title;
    }

    //call getMovies in MoviesDAO, returns moviesList and totalNumMovies
    const { moviesList, totalNumMovies } = await MoviesDAO.getMovies({
      filters,
      page,
      moviesPerPage,
    });

    //send JSON response with below response object to client
    let response = {
      movies: moviesList,
      page: page,
      filters: filters,
      entries_per_page: moviesPerPage,
      total_results: totalNumMovies,
    };
    res.json(response);
  }

  static async apiGetMovieById(req, res, next) {
    try {
      let id = req.params.id || {}; //we look for id parameter
      let movie = await MoviesDAO.getMovieById(id); //call getMovieById which returns a specific movie in JSON response
      if (!movie) {
        res.status(404).json({ error: "not found" }); //if there is no movie, return error
        return;
      }
      res.json(movie);
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetRatings(req, res, next) {
    try {
      let propertyTypes = await MoviesDAO.getRatings();
      res.json(propertyTypes);
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }
}
