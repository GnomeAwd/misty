<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import PlayerPlay from '@tabler/icons-svelte/icons/player-play';
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte';
	import { Button } from '../ui/button';

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
			return {
				...album,
				songs: songs.filter((song: any) => song.albumId === album.id),
				totalTracks: songs.filter((song: any) => song.albumId === album.id).length,
				totalDuration: songs
					.filter((song: any) => song.albumId === album.id)
					.reduce((acc: any, song: any) => acc + song.duration, 0)
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

	$effect(() => {
		console.log(albumsWithSongs);
	});
</script>

<ScrollArea class="h-[50vh] w-full pr-4">
	<Accordion.Root type="single" class="w-full" value="item-{albumsWithSongs[0].id}">
		{#each albumsWithSongs as album}
			<Accordion.Item value={`item-${album.id}`}>
				<Accordion.Trigger class="hover:no-underline">
					<div class="grid w-full grid-cols-3 gap-6">
						<span class="truncate text-xl">{album.title}</span>
						<span class="text-muted-foreground text-sm font-light text-right"
							>{formatSecondCount(album.totalDuration)}</span
						>
						<span class="text-muted-foreground text-sm font-light text-right">
							{formatDateString(album.releaseDate)}
						</span>
					</div>
				</Accordion.Trigger>
				<Accordion.Content class="grid w-full grid-cols-3">
					<div class="col-span-2 flex flex-col gap-2 pr-4">
						{#each album.songs as song}
							<Button variant="ghost" class="flex items-center justify-start w-full bg-muted dark:bg-background hover:bg-card px-4 py-2 rounded-lg group hover:text-foreground">
                                <div class="w-12 relative">
                                    <span class="group-hover:opacity-0 ">{song.trackNumber}</span>
                                    <PlayerPlay class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 fill-primary stroke-primary" />
                                </div>
								<span class="truncate w-[200px] text-left">{song.title}</span>
                                <span class='text-muted-foreground w-full text-right'>{formatSecondCount(song.duration)}</span>
							</Button>
						{/each}
					</div>
					<div class="col-span-1">
						<div class="w-full overflow-hidden rounded-lg border-2">
							<img src={album.albumArtUrl} alt="{album.title} cover" class='object-cover' />
						</div>
					</div>
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</ScrollArea>
