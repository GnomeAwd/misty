import type { PageLoad } from './$types';

const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

export const load: PageLoad = async ({ params, fetch }) => {
    const { slug } = params;
    const res = await fetch(`${baseUrl}/api/get-album/${slug}`);
    const album = await res.json();
    const res2 = await fetch(`${baseUrl}/api/get-songs-in-album/${slug}`);
    const songs = await res2.json();
    const res3 = await fetch(`${baseUrl}/api/get-artist/${album.artistId}`);
    const artist = await res3.json();
    return { album, songs, artist };
};
