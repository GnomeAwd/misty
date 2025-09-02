import type { PageLoad } from "./$types";

const baseUrl = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";


export const load: PageLoad = async ({fetch}) => {
    const response = await fetch(baseUrl+"/api/get-all-liked-songs");
    const songs = await response.json();
    return { songs };
};