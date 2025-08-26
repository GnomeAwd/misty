import type { PageLoad } from './$types';

const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

export const load: PageLoad = async ({ params, fetch }) => {
	const { slug } = params;
	const res = await fetch(`${baseUrl}/api/get-artist/${slug}`);
	const artist = await res.json();
    const albumRes = await fetch(`${baseUrl}/api/get-artist-albums/${slug}`);
    const albums = await albumRes.json();
	const songsRes = await fetch(`${baseUrl}/api/get-all-artists-songs/${slug}`);
	const songs = await songsRes.json();
	return { artist, albums, songs };
};
