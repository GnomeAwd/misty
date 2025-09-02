<script lang="ts">
	import { likeSong, unlikeSong } from '$lib/api/actions.js';
	import SongPlaylistEntry from '$lib/components/playlists/song-playlist-entry.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import ArrowsShuffle from '@tabler/icons-svelte/icons/arrows-shuffle';
	import DotsVertical from '@tabler/icons-svelte/icons/dots-vertical';
	import PlayerPlayFilled from '@tabler/icons-svelte/icons/player-play-filled';

	let { data } = $props();
	let { songs, albums, artists } = data;

	const toggleLike = async (songId: number) => {
		const song = songs.find((s: any) => s.id === songId);
		if (song) {
			if (song.isLiked) {
				await unlikeSong(songId);
				songs.find((s: any) => s.id === songId).isLiked = false;
			} else {
				await likeSong(songId);
				songs.find((s: any) => s.id === songId).isLiked = true;
			}
		}
	};

	const getAlbumArtsForCollage = () => {
		const validAlbums = songs.map((song: any) => {
			const album = albums.find((a: any) => a.id === song.albumId);
			return album ? album.albumArtUrl : null;
		});
		const albumArts = validAlbums.filter((art: any) => art !== null);

		let finalArray = Array.from(new Set(albumArts));
		finalArray = finalArray.sort(() => 0.5 - Math.random()).slice(0, 4);
		return finalArray;
	};

	const formatTimeHourMinute = (seconds: number) => {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hrs > 0 ? hrs + ' hrs ' : ''}${mins} mins`;
	};

	let totalDuration = $derived(
		formatTimeHourMinute(songs.reduce((acc: number, song: any) => acc + song.duration, 0))
	);

	let albumArts = $derived(getAlbumArtsForCollage());

	$inspect(albumArts);
</script>

<div
	class="bg-muted dark:bg-background flex h-[90.5vh] w-full flex-col items-start justify-start gap-4 p-4"
>
	<div class="flex w-full items-start justify-start gap-4">
		<div
			class="border-background dark:border-muted grid h-36 w-36 grid-cols-2 grid-rows-2 overflow-hidden rounded-lg border-4 bg-transparent"
		>
			{#each albumArts as art, index (index)}
				{#if typeof art === 'string'}
					<img src={art.toString()} alt="Album Art" class="h-full w-full object-cover" />
				{/if}
			{/each}
		</div>
		<div class="flex flex-col items-start justify-center h-36 gap-4 font-semibold">
			<span class="text-4xl font-bold">Liked Songs</span>
			<div class="flex items-center justify-center gap-4">
				<Button class="bg-primary rounded-full h-12 w-12">
					<PlayerPlayFilled class="h-4 w-4" />
				</Button>
				<Button variant="ghost" class="hover:bg-muted/50">
					<ArrowsShuffle class="h-4 w-4" />
				</Button>
				<Button variant="ghost" class="hover:bg-muted/50">
					<DotsVertical class="h-4 w-4" />
				</Button>
				<span class="text-muted-foreground text-sm ml-2">{songs.length} songs</span>
				<span class="text-muted-foreground text-sm font-normal ml-2">{totalDuration}</span>
			</div>
		</div>
	</div>
	<ScrollArea class="mt-4 h-[62vh] w-full pr-4">
		{#each songs as song, index}
			<SongPlaylistEntry {song} {songs} {index} {albums} {artists} {toggleLike} />
		{/each}
	</ScrollArea>
</div>
