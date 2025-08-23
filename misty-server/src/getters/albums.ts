import { db } from "../db";
import { albums } from "../db/schema";
import { eq } from "drizzle-orm";


export const getAllAlbums = async () => {
    let albumsFromDb = await db.select().from(albums);
    return albumsFromDb; 
};

export const getAlbumById = async (id: number) => {
    let albumFromDb = await db.select().from(albums).where(eq(albums.id, id)).limit(1);
    return albumFromDb[0];
};

export const getAllAlbumsByArtistId = async (artistId: number) => {
    let albumsFromDb = await db.select().from(albums).where(eq(albums.artistId, artistId));
    return albumsFromDb;
};