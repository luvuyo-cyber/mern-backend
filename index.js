import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import MoviesDAO from "./dao/moviesDAO.js";
import ReviewsDAO from "./dao/reviewsDAO.js";

async function main() {
  dotenv.config(); //load .env variables
  const client = new mongodb.MongoClient(process.env.MOVIEREVIEWS_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const port = process.env.PORT || 8000; //retrieve port & alt
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    //right after connecting to database, before we start server, we get initial reference to our collection in database
    await MoviesDAO.injectDB(client);
    await ReviewsDAO.injectDB(client);
    app.listen(port, () => {
      console.log("server is running on port:" + port);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
main().catch(console.error);
