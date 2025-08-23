import { db } from "../db";
import { artists,albums } from "../db/schema";
import { eq } from "drizzle-orm";

export const getAllArtists = async () => {
	let artistsFromDb = await db.select().from(artists);
	return artistsFromDb; 
};

export const getArtistById = async (id: number) => {
	let artistFromDb = await db.select().from(artists).where(eq(artists.id, id)).limit(1);
	return artistFromDb[0];
};

export const getArtistByAlbumId = async (albumId: number) => {
    let albumFromDb = await db.select().from(albums).where(eq(albums.id, albumId)).limit(1);
	let artistFromDb = await db.select().from(artists).where(eq(artists.id, albumFromDb[0]?.artistId)).limit(1);
	return artistFromDb[0];
};