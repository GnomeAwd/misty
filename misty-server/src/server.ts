import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { scan } from "./scanner";
import { timeout } from "hono/timeout";
import { getAllSongs, getAllSongsByAlbumId, getAllSongsByArtistId } from "./getters/songs";
import { playSong } from "./player";
import pino from "pino";
import { getAllArtists, getArtistById } from "./getters/artists";
import { getAlbumById, getAllAlbums, getAllAlbumsByArtistId } from "./getters/albums";

const logger = pino();

const app = new Hono();
const MUSIC_FOLDER = Bun.env.MUSIC_FOLDER;

// Enable permissive CORS for the Vite dev server (5173) only in development
const isDev = (Bun.env.NODE_ENV ?? "development") !== "production";
if (isDev) {
  const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
  app.use(
    "/api/*",
    cors({
  origin: (origin) => (origin && allowedOrigins.has(origin) ? origin : null),
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "User-Agent",
        "DNT",
        "Cache-Control",
        "X-Requested-With",
      ],
      exposeHeaders: ["Content-Length"],
      credentials: true,
      maxAge: 86400,
    })
  );
}

app.use("/*", serveStatic({ root: "../misty-client/build" }));

app.use("/api", timeout(25000));

app.get("/api/get-all-artists", async (c) => {
  try {
    const artists = await getAllArtists();
    return c.json(artists);
  } catch (err) {
    return c.json({ error: "Failed to fetch artists" }, 500);
  }
});

app.get("/api/get-all-albums", async (c) => {
  try {
    const albums = await getAllAlbums();
    return c.json(albums);
  } catch (err) {
    return c.json({ error: "Failed to fetch albums" }, 500);
  }
});

app.get("/api/get-album/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Album ID is required" }, 400);
  }
  try {
    const album = await getAlbumById(Number(id));
    return c.json(album);
  } catch (err) {
    return c.json({ error: "Failed to fetch album" }, 500);
  }
});

app.get("/api/get-songs-in-album/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Album ID is required" }, 400);
  }
  try {
    const songs = await getAllSongsByAlbumId(Number(id));
    return c.json(songs);
  } catch (err) {
    return c.json({ error: "Failed to fetch songs" }, 500);
  }
});


app.get("/api/get-artist/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Artist ID is required" }, 400);
  }
  try {
    const artist = await getArtistById(Number(id));
    return c.json(artist);
  } catch (err) {
    return c.json({ error: "Failed to fetch artist" }, 500);
  }
});

app.get("/api/get-artist-albums/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Artist ID is required" }, 400);
  }
  try {
    const albums = await getAllAlbumsByArtistId(Number(id));
    return c.json(albums);
  } catch (err) {
    return c.json({ error: "Failed to fetch albums" }, 500);
  }
});

app.get("/api/get-all-artists-songs/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Artist ID is required" }, 400);
  }
  try {
    const songs = await getAllSongsByArtistId(Number(id));
    return c.json(songs);
  } catch (err) {
    return c.json({ error: "Failed to fetch songs" }, 500);
  }
});

app.get("/api/get-all-songs", async (c) => {
  try {
    const songs = await getAllSongs();
    return c.json(songs);
  } catch (err) {
    return c.json({ error: "Failed to fetch songs" }, 500);
  }
});

app.get("/api/play-song/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Song ID is required" }, 400);
  }
  const songData = await playSong(Number(id));

  logger.info(songData);
  if (songData instanceof Response) {
    return songData;
  }
  if (!songData) {
    return c.json({ error: "Song not found" }, 404);
  }
});

app.get("/api/scan", async (c) => {
  if (!MUSIC_FOLDER) {
    return c.json(
      { error: "MUSIC_FOLDER environment variable is not set" },
      400
    );
  }
  const result = await scan(MUSIC_FOLDER);

  return c.json(result);
});

export default {
  fetch: app.fetch,
  idleTimeout: 60,
};
