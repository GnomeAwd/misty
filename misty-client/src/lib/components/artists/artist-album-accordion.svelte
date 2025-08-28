<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import PlayerPlay from '@tabler/icons-svelte/icons/player-play';
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte';
	import { Button } from '../ui/button';
	import ArrowsShuffle_2 from '@tabler/icons-svelte/icons/arrows-shuffle-2';
	import Heart from '@tabler/icons-svelte/icons/heart';
	import { playSong } from '$lib/hooks/music/music-player.svelte';
	import ExternalLink from '@tabler/icons-svelte/icons/external-link';

	let {
		albums,
		songs,
		totalDuration = $bindable(0)
	} = $props<{ albums: any[]; songs: any[]; totalDuration: number }>();

	const getTotalDurationForArtist = (albums: any[]) => {
		totalDuration = albums.reduce((acc: any, album: any) => acc + album.totalDuration, 0);
	};

	function getAlbumSongs() {
		const filteredAlbums = albums.map((album: any) => {
			let filteredSongs = songs.filter((song: any) => song.albumId === album.id);
			let sortedFilteredSongs = filteredSongs.sort((a: any, b: any) => a.trackNumber - b.trackNumber);
			return {
				...album,
				songs: sortedFilteredSongs,
				totalTracks: sortedFilteredSongs.length,
				totalDuration: sortedFilteredSongs.reduce((acc: any, song: any) => acc + song.duration, 0)
			};
		});

		const sortedAlbums = filteredAlbums.sort(
			(a: any, b: any) => new Date(b.releaseDate) > new Date(a.releaseDate)
		);

		getTotalDurationForArtist(sortedAlbums);
		return sortedAlbums;
	}

	const albumsWithSongs = getAlbumSongs();


	const formatSecondCount = (seconds: number) => {
		let hour = Math.floor(seconds / 3600);
		let minute = Math.floor((seconds % 3600) / 60);
		let second = seconds % 60;

		return `${hour === 0 ? '' : hour + 'hr '}${minute}min ${second}sec`;
	};

	const formatDateString = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		};
		return new Date(dateString).toLocaleString(undefined, options);
	};

</script>

<ScrollArea class="h-[58vh] w-full pr-4">
	<Accordion.Root type="single" class="w-full" >
		{#each albumsWithSongs as album}
			<Accordion.Item value={`item-${album.id}`}>
				<Accordion.Trigger class="hover:no-underline">
					<div class="grid w-full grid-cols-3 gap-6">
						<span class="truncate text-xl">{album.title}</span>
						<span class="text-muted-foreground text-right text-sm font-medium"
							>{formatSecondCount(album.totalDuration)}</span
						>
						<!-- <span class="text-muted-foreground text-center text-sm font-light">
							{album.songs.length}
							{album.songs.length === 1 ? 'song' : 'songs'}
						</span> -->
					</div>
				</Accordion.Trigger>
				<Accordion.Content class="grid w-full grid-cols-3">
					<div class="col-span-2 flex flex-col gap-2 pr-4">
						{#each album.songs as song,i}
							<Button
								variant="ghost"
								onclick={() => playSong(song,album.songs,i)}
								class="bg-muted dark:bg-background hover:bg-card hover:text-foreground group flex w-full items-center justify-start rounded-lg px-4 py-2"
							>
								<div class="relative w-12">
									<span class="group-hover:opacity-0">{song.trackNumber}</span>
									<PlayerPlay
										class="fill-primary stroke-primary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform opacity-0 group-hover:opacity-100"
									/>
								</div>
								<span class="w-[300px] truncate text-left">{song.title}</span>
								<span class="text-muted-foreground w-full text-right text-sm font-light"
									>{formatSecondCount(song.duration)}</span
								>
							</Button>
						{/each}
					</div>
					<div class="col-span-1 flex flex-col items-center justify-start gap-4">
						<div class="flex items-center justify-center gap-2">
							<Button
								variant="outline"
								size="icon"
								class="bg-background hover:bg-muted/20 dark:bg-background dark:hover:bg-muted/20"
								onclick={() => playSong(album.songs[0],album.songs,0)}
							>
								<PlayerPlay class="fill-primary stroke-primary  h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								class="bg-background hover:bg-muted/20 dark:bg-background dark:hover:bg-muted/20"
							>
								<ArrowsShuffle_2 class="fill-primary stroke-primary  h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								class="bg-background hover:bg-muted/20 dark:bg-background dark:hover:bg-muted/20"
							>
								<Heart class="fill-primary stroke-primary  h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								class="bg-background hover:bg-muted/20 dark:bg-background dark:hover:bg-muted/20"
							>
								<ExternalLink class="fill-primary stroke-primary  h-4 w-4" />
							</Button>

						</div>
						<div class="w-[200px] overflow-hidden rounded-lg border-2">
							<img src={album.albumArtUrl} alt="{album.title} cover" class="object-cover" />
						</div>
						<span class="text-muted-foreground text-center text-sm font-medium">
							{formatDateString(album.releaseDate)}
						</span>
					</div>
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</ScrollArea>
