<script lang="ts">
	import ArtistGridCard from '$lib/components/artists/artist-grid-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import GridPattern from '@tabler/icons-svelte/icons/grid-pattern';
	import type { PageData } from './$types';
	import ListDetails from '@tabler/icons-svelte/icons/list-details';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import ArtistListCard from '$lib/components/artists/artist-list-card.svelte';
	import RotateClockwise from '@tabler/icons-svelte/icons/rotate-clockwise';
	import { scan } from '$lib/api/scan';
	let { data }: { data: PageData } = $props();
	const artists = $derived(data.artists);

    let gridState = $state('grid');
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
		{#if artists.length === 0}
		<div class='flex h-[50vh] items-center justify-center gap-4 flex-col'>
			<span>No artists found</span>
			<Button variant="ghost" onclick={()=>scan()}><RotateClockwise class="h-4 w-4"/><span>Rescan</span></Button>
		</div>
		{/if}
        {#if gridState === 'grid'}
		<div class="grid grid-cols-5 gap-4">
			{#each artists as artist}
				<ArtistGridCard {artist} />
			{/each}
		</div>
        {:else}
        <div class="flex flex-col gap-4 pr-4">
            {#each artists as artist}
                <ArtistListCard {artist} />
            {/each}
        </div>
        {/if}
	</ScrollArea>
</div>
