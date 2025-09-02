import type { PageLoad } from "./$types";

const baseUrl = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";


export const load: PageLoad = async ({fetch}) => {
    const response = await fetch(baseUrl+"/api/get-all-albums");
    const albums = await response.json();
    const response2 = await fetch(baseUrl+"/api/get-all-artists");
    const artists = await response2.json();
    return { albums, artists };
};