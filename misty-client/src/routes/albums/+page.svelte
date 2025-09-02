<script lang="ts">
	// import ArtistGridCard from "$lib/components/artists/artist-grid-card.svelte";
	import { Button } from "$lib/components/ui/button";
	import Input from "$lib/components/ui/input/input.svelte";
	import * as  ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import GridPattern from "@tabler/icons-svelte/icons/grid-pattern";
	import type { PageData } from "./$types";
	import ListDetails from "@tabler/icons-svelte/icons/list-details";
	import AlbumGridCard from "$lib/components/albums/album-grid-card.svelte";
	import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    let { data }: { data: PageData } = $props();
    const albums = $derived(data.albums);
    const artists = $derived(data.artists);

    const getArtistforAlbum = (artistId:number) => {
        return artists.find((artist:any) => artist.id === artistId);
    }

</script>
<div class="flex flex-col items-start justify-start w-full h-[90.5vh] p-4 bg-muted dark:bg-background gap-4">
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
    <ScrollArea class="h-[85%] w-full">
        <div class="grid grid-cols-5 gap-4 ">
            {#each albums as album}
                <AlbumGridCard {album} artist={getArtistforAlbum(album.artistId)} />
            {/each}
        </div>
    </ScrollArea>
</div>

