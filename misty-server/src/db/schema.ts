import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  real,
} from "drizzle-orm/sqlite-core";

// Artists table
export const artists = sqliteTable("artists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// Genres table
export const genres = sqliteTable("genres", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Albums table
export const albums = sqliteTable("albums", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  artistId: integer("artist_id")
    .references(() => artists.id, { onDelete: "cascade" })
    .notNull(),
  genreId: integer("genre_id").references(() => genres.id, {
    onDelete: "set null",
  }),
  releaseDate: integer("release_date", { mode: "timestamp" }),
  coverImageUrl: text("cover_image_url"),
  totalTracks: integer("total_tracks"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// Songs table
export const songs = sqliteTable("songs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  duration: integer("duration"), // in seconds
  trackNumber: integer("track_number"),
  albumId: integer("album_id")
    .references(() => albums.id, { onDelete: "cascade" })
    .notNull(),
  artistId: integer("artist_id")
    .references(() => artists.id, { onDelete: "cascade" })
    .notNull(),
  genreId: integer("genre_id").references(() => genres.id, {
    onDelete: "set null",
  }),
  filePath: text("file_path"),
  fileSize: integer("file_size"), // in bytes
  bitrate: integer("bitrate"), // in kbps
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// Playlists table
export const playlists = sqliteTable("playlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const playlistSongs = sqliteTable("playlist_songs", {
  playlistId: integer("playlist_id")
    .references(() => playlists.id, { onDelete: "cascade" })
    .notNull(),
  songId: integer("song_id")
    .references(() => songs.id, { onDelete: "cascade" })
    .notNull(),
  position: integer("position").notNull(),
  addedAt: integer("added_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const tables = {
  artists,
  genres,
  albums,
  songs,
  playlists,
  playlistSongs,
};
