import { db } from "../db";
import { songs } from "../db/schema";

export const getAllSongs = async () => {
  const songsData = await db.select().from(songs)
  return songsData
}