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
  musicbrainzId: text("musicbrainz_id"),
  folderPath: text("folder_path"),
  avatarUrl: text("avatar_url"),
  artistBannerUrl: text("artist_banner_url"),
  artistBackgroundUrl: text("artist_background_url"),
  artistHdMusicLogoUrl: text("artist_hd_music_logo_url"),
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
  musicbrainzId: text("musicbrainz_id"),
  folderPath: text("folder_path").notNull(),
  albumArtUrl: text("album_art_url"),
  releaseDate: integer("release_date", { mode: "timestamp" }),
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
  duration: integer("duration"),
  trackNumber: integer("track_number"),
  fileSize: integer("file_size"),
  fileName: text("file_name"),
  filePath: text("file_path"),
  isLiked: integer("is_liked", { mode: "boolean" }).notNull().default(false),
  albumId: integer("album_id")
    .references(() => albums.id, { onDelete: "cascade" })
    .notNull(),
  artistId: integer("artist_id")
    .references(() => artists.id, { onDelete: "cascade" })
    .notNull(),
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

export const artistGenres = sqliteTable("artist_genres", {
  artistId: integer("artist_id")
    .references(() => artists.id, { onDelete: "cascade" })
    .notNull(),
  genreId: integer("genre_id")
    .references(() => genres.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const albumGenres = sqliteTable("album_genres", {
  albumId: integer("album_id")
    .references(() => albums.id, { onDelete: "cascade" })
    .notNull(),
  genreId: integer("genre_id")
    .references(() => genres.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
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
  artistGenres,
  albumGenres
};
