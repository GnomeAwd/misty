<script lang="ts">
	import ArtistGridCard from "$lib/components/artists/artist-grid-card.svelte";
	import { Button } from "$lib/components/ui/button";
	import Input from "$lib/components/ui/input/input.svelte";
	import * as  ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import GridPattern from "@tabler/icons-svelte/icons/grid-pattern";
	import type { PageData } from "./$types";
	import ListDetails from "@tabler/icons-svelte/icons/list-details";
    let { data }: { data: PageData } = $props();
    const artists = $derived(data.artists);

    $effect(() => {
        console.log(artists);
    });
</script>
<div class="flex flex-col items-start justify-start w-full h-[90.5vh] p-4 bg-background gap-4">
    <div class="w-full flex items-center justify-between gap-2">
        <Button variant="outline" class="bg-background hover:bg-muted/20 dark:bg-background dark:hover:bg-muted/20">Filters</Button>
        <ToggleGroup.Root variant="outline" type="single" value="grid">
            <ToggleGroup.Item value="grid" class="p-2">
                <GridPattern class="h-4 w-4" />
            </ToggleGroup.Item>
            <ToggleGroup.Item value="list" class="p-2">
                <ListDetails class="h-4 w-4" />
            </ToggleGroup.Item>
        </ToggleGroup.Root>
    </div>
    <div class="flex items-start justify-start flex-wrap gap-4 w-full">
        {#each artists as artist}
            <ArtistGridCard {artist} />
        {/each}
    </div>
</div>

