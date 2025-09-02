<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { playSong } from '$lib/hooks/music/music-player.svelte';
	import PlayerPlay from '@tabler/icons-svelte/icons/player-play';
	import type { PageData } from './$types';
	import PlayerPlayFilled from '@tabler/icons-svelte/icons/player-play-filled';
	import Heart from '@tabler/icons-svelte/icons/heart';
	import ListTree from '@tabler/icons-svelte/icons/list-tree';
	import DotsVertical from '@tabler/icons-svelte/icons/dots-vertical';
	import Circle from '@tabler/icons-svelte/icons/circle';
	import ArrowsShuffle from '@tabler/icons-svelte/icons/arrows-shuffle';

	let { data }: { data: PageData } = $props();

	const { artist, album, songs } = data;

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const sortedFilteredSongs = songs
		.filter((song: any) => song.title)
		.sort((a: any, b: any) => a.trackNumber - b.trackNumber);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
	};

	const formatTimeHourMinute = (seconds: number) => {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hrs > 0 ? hrs + 'hrs ' : ''}${mins}mins`;
	};

	const totalDuration = songs.reduce((acc: number, song: any) => acc + song.duration, 0);
</script>

<div class="bg-muted dark:bg-background grid h-[90.5vh] w-full grid-cols-5 gap-4 p-12">
	<div class="col-span-1 flex flex-col items-center justify-start gap-2">
		<img src={album.albumArtUrl} alt={album.title} class="h-64 w-64 rounded-xl" />
	
        <div class="flex items-center justify-start gap-2 my-4">
            <Button class="rounded-full h-10 w-10" onclick={() => playSong(sortedFilteredSongs[0], sortedFilteredSongs,0)}>
                <PlayerPlay class="fill-background" />
            </Button>
            <Button variant="ghost" class="rounded-full h-10 w-10">
                <Heart/>
            </Button>
            <Button variant="ghost" class="rounded-full h-10 w-10">
                <ArrowsShuffle/>
            </Button>
            <Button variant="ghost" class="rounded-full h-10 w-10">
                <DotsVertical/>
            </Button>
        </div>
        	<h2 class="text-lg font-semibold">{artist.name || 'Unknown Artist'}</h2>
		<p class="text-muted-foreground text-sm">
			{formatDate(album.releaseDate) || 'Unknown Release Date'}
		</p>
	</div>
	<div class="col-span-4 flex flex-col items-start justify-start gap-2">
		<h1 class="text-2xl font-bold">{album.title || 'Unknown Album'}</h1>
		<div class="flex items-center justify-start gap-2">
			<span class="text-muted-foreground text-sm font-semibold">{songs.length} songs</span>
            <Circle class="h-2 w-2 fill-muted-foreground stroke-muted-foreground" />
			<span class="text-muted-foreground text-sm font-semibold"
				>{formatTimeHourMinute(totalDuration)}</span
			>
		</div>

		<ScrollArea class="mt-4 h-[68vh] w-full pr-4">
			<div class="flex flex-col gap-2">
				{#each sortedFilteredSongs as song}
					<div
						class="hover:bg-card group flex items-center justify-between gap-4 rounded-lg px-4 py-1"
					>
						<div class="flex items-center justify-start gap-4">
							<div class="flex h-12 w-12 items-center justify-center">
								<span class="text-muted-foreground text-sm group-hover:hidden transition-all duration-300 ease-in-out"
									>{song.trackNumber || 0}</span
								>
								<button
									class="hidden p-2 group-hover:flex transition-all duration-300 ease-in-out cursor-pointer"
									onclick={() => playSong(song, sortedFilteredSongs, song.trackNumber - 1)}
								>
									<PlayerPlayFilled class="fill-primary h-4 w-4" />
								</button>
							</div>
							<span class="text-sm font-semibold">{song.title || 'Unknown Song'}</span>
						</div>
						<div class="flex items-center justify-start gap-2">
							<span class="text-muted-foreground mr-4 text-xs font-semibold"
								>{formatTime(song.duration)}</span
							>
							<Button variant="ghost" class="hover:bg-muted/50 p-2">
								<Heart class="h-4 w-4" />
							</Button>
							<Button variant="ghost" class="hover:bg-muted/50 p-2">
								<ListTree class="h-4 w-4" />
							</Button>
							<Button variant="ghost" class="hover:bg-muted/50 p-2">
								<DotsVertical class="h-4 w-4" />
							</Button>
						</div>
					</div>
				{/each}
			</div>
		</ScrollArea>
	</div>
</div>
