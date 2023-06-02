const express = require("express");
const a = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
let db = null;
a.use(express.json());
const dbpath = path.join(__dirname, "moviesData.db");
const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    a.listen(3000, () => {
      console.log("Server Is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base Error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const movie = (z) => {
  return {
    movieName: z.movie_name,
  };
};

a.get("/movies/", async (request, response) => {
  const p = `select movie_name from movie;`;
  const q = await db.all(p);
  response.send(q.map((e) => movie(e)));
});
a.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const p = `insert into movie(director_id,movie_name,lead_actor) 
  values(${directorId},'${movieName}','${leadActor}');`;
  const createMovieQueryResponse = await db.run(p);
  response.send(`Movie Successfully Added`);
});

const movies = (z) => {
  return {
    movieId: z.movie_id,
    directorId: z.director_id,
    movieName: z.movie_name,
    leadActor: z.lead_actor,
  };
};
a.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const a = `select * from movie where movie_id=${movieId}`;
  const q = await db.get(a);
  response.send(movies(q));
});

a.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const q = `update movie set director_id=${directorId},movie_name='${movieName}',lead_actor=${leadActor} where movie_id=${movieId}  `;
  const p = await db.run(q);
  response.send("Movie Details Updated");
});

a.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const p = `delete from movie where movie_id=${movieId}`;
  const q = await db.run(p);
  response.send("Movie Removed");
});
const directors = (a) => {
  return {
    directorId: a.director_id,
    directorName: a.director_name,
  };
};

a.get("/directors/", async (request, response) => {
  const p = `select * from director`;
  const q = await db.all(p);
  response.send(q.map((e) => directors(e)));
});

const directorid = (a) => {
  return {
    movieName: a.movie_name,
  };
};
a.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const q = `select movie_name from director where director_id=${directorId}`;
  const p = await db.all(q);
  response.send(p.map((e) => directorid(e)));
});

module.exports = a;
