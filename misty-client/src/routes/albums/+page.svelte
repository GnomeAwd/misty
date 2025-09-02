<script lang="ts">
	// import ArtistGridCard from "$lib/components/artists/artist-grid-card.svelte";
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import GridPattern from '@tabler/icons-svelte/icons/grid-pattern';
	import type { PageData } from './$types';
	import ListDetails from '@tabler/icons-svelte/icons/list-details';
	import AlbumGridCard from '$lib/components/albums/album-grid-card.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import AlbumListCard from '$lib/components/albums/album-list-card.svelte';
	import { scan } from '$lib/api/scan';
	import RotateClockwise from '@tabler/icons-svelte/icons/rotate-clockwise';
	let { data }: { data: PageData } = $props();
	const albums = $derived(data.albums);
	const artists = $derived(data.artists);

	let gridState = $state('grid');

	const getArtistforAlbum = (artistId: number) => {
		return artists.find((artist: any) => artist.id === artistId);
	};
</script>

<div
	class="bg-muted dark:bg-background flex h-[90.5vh] w-full flex-col items-start justify-start gap-4 p-4"
>
	<div class="flex w-full items-center justify-between gap-2">
		<Button
			variant="outline"
			class="bg-background hover:bg-muted/20 dark:bg-background dark:hover:bg-muted/20"
			>Filters</Button
		>
		<ToggleGroup.Root variant="outline" type="single" bind:value={gridState}>
			<ToggleGroup.Item value="grid" class="p-2">
				<GridPattern class="h-4 w-4" />
			</ToggleGroup.Item>
			<ToggleGroup.Item value="list" class="p-2">
				<ListDetails class="h-4 w-4" />
			</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>
	<ScrollArea class="h-[85%] w-full">
		{#if albums.length === 0}
			<div class="flex h-[50vh] flex-col items-center justify-center gap-4">
				<span>No albums found</span>
				<Button variant="ghost" onclick={() => scan()}
					><RotateClockwise class="h-4 w-4" /><span>Rescan</span></Button
				>
			</div>
		{/if}
		{#if gridState === 'grid'}
			<div class="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
				{#each albums as album}
					<AlbumGridCard {album} artist={getArtistforAlbum(album.artistId)} />
				{/each}
			</div>
		{:else}
			<div class="flex flex-col gap-4 pr-4">
				{#each albums as album}
					<AlbumListCard {album} artist={getArtistforAlbum(album.artistId)} />
				{/each}
			</div>
		{/if}
	</ScrollArea>
</div>
