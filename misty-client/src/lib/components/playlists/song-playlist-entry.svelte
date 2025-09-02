<script lang="ts">
	import { playSong } from '$lib/hooks/music/music-player.svelte';
	import PlayerPlayFilled from '@tabler/icons-svelte/icons/player-play-filled';
	import { Button } from '../ui/button';
	import DotsVertical from '@tabler/icons-svelte/icons/dots-vertical';
	import Heart from '@tabler/icons-svelte/icons/heart';
	import ListTree from '@tabler/icons-svelte/icons/list-tree';

	let { song, songs, index, albums, artists, toggleLike } = $props<{
		song: any;
		songs: any[];
		index: number;
		albums: any[];
		artists: any[];
		toggleLike: (songId: number) => Promise<void>;
	}>();

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
	};

	const getAlbumArt = (albumId: number) => {
		const album = albums.find((a: any) => a.id === albumId);
		return album ? album.albumArtUrl : null;
	};

	const getArtistName = (artistId: number) => {
		const artist = artists.find((a: any) => a.id === artistId);
		return artist ? artist.name : null;
	};

	let albumArtUrl = $derived(getAlbumArt(song.albumId));
	let artistName = $derived(getArtistName(song.artistId));
</script>

<div
	class="hover:bg-card group flex w-full items-center justify-between gap-4 rounded-lg px-2 py-1"
>
	<div class="flex items-center justify-start gap-4">
		<div class="flex h-12 w-12 items-center justify-center">
			<img
				src={albumArtUrl || '/default-album-art.png'}
				alt="Album Art"
				class="h-10 w-10 rounded-md object-cover"
			/>
		</div>
		<div class="flex flex-col items-start justify-center gap-2">
			<span class="text-sm font-semibold">{song.title || 'Unknown Song'}</span>
			<span class="text-muted-foreground text-xs">{artistName || 'Unknown Artist'}</span>
		</div>
	</div>
	<div class="flex items-center justify-start gap-2">
		<span class="text-muted-foreground mr-4 text-xs font-semibold">{formatTime(song.duration)}</span
		>
		<Button
			variant="ghost"
			class="hover:bg-muted/50 p-2"
			onclick={() => playSong(song, songs, index)}
		>
			<PlayerPlayFilled class="h-4 w-4" />
		</Button>
		<Button variant="ghost" class="hover:bg-muted/50 p-2" onclick={() => toggleLike(song.id)}>
			<Heart class="h-4 w-4 {song.isLiked ? 'fill-foreground' : 'fill-transparent'}" />
		</Button>
		<Button variant="ghost" class="hover:bg-muted/50 p-2">
			<ListTree class="h-4 w-4" />
		</Button>
		<Button variant="ghost" class="hover:bg-muted/50 p-2">
			<DotsVertical class="h-4 w-4" />
		</Button>
	</div>
</div>
