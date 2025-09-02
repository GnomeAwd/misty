import { db } from "../db";
import { songs } from "../db/schema";
import { eq } from "drizzle-orm";


export const getAllSongs = async () => {
  const songsData = await db.select().from(songs)
  return songsData
}

export const getSongById = async (id: number) => {
  const songData = await db.select().from(songs).where(eq(songs.id, id)).limit(1)
  return songData[0]
}

export const getAllSongsByArtistId = async (artistId: number) => {
  const songsData = await db.select().from(songs).where(eq(songs.artistId, artistId))
  return songsData
}

export const getAllSongsByAlbumId = async (albumId: number) => {
  const songsData = await db.select().from(songs).where(eq(songs.albumId, albumId))
  return songsData
}

export const getAllLikedSongs = async () => {
  const songsData = await db.select().from(songs).where(eq(songs.isLiked, true))
  return songsData
}

export const likeSong = async (id: number) => {
  await db.update(songs).set({ isLiked: true }).where(eq(songs.id, id))
}

export const unlikeSong = async (id: number) => {
  await db.update(songs).set({ isLiked: false }).where(eq(songs.id, id))
}