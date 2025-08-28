<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import PlayerPlay from "@tabler/icons-svelte/icons/player-play";
	import type { PageData } from "./$types";
	import ArrowsShuffle_2 from "@tabler/icons-svelte/icons/arrows-shuffle-2";
	import Heart from "@tabler/icons-svelte/icons/heart";
	import ArtistAlbumAccordion from "$lib/components/artists/artist-album-accordion.svelte";
	import Circle from "@tabler/icons-svelte/icons/circle";
	import Separator from "$lib/components/ui/separator/separator.svelte";
	import { playSong } from "$lib/hooks/music/music-player.svelte";


    let { data }: { data: PageData } = $props();

    const { artist, albums, songs } = data;

    let totalDuration = $state(0)


	const formatSecondCount = (seconds: number) => {
		let hour = Math.floor(seconds / 3600);
		let minute = Math.floor((seconds % 3600) / 60);
		let second = seconds % 60;

		return `${hour === 0 ? '' : hour + 'hr '}${minute}min ${second}sec`;
	};

    const playArtistShuffledPlaylist = () => {
        if (!artist || !songs) return;
        const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
        playSong(shuffledSongs[0], shuffledSongs);
    };

    const playAllArtistSongs = () => {
        if (!artist || !songs) return;
        playSong(songs[0], songs);
    };

</script>
<div class="flex flex-col items-start justify-start w-full h-[90.5vh] bg-muted dark:bg-background gap-4">
    <div class="w-full relative h-48 overflow-hidden">
        <div class="w-full h-full bg-gradient-to-b from-transparent via-muted/50 to-muted dark:to-background dark:via-background/50 absolute bottom-0 left-0"></div>
        <img src={artist.artistBannerUrl} alt="artist banner" class="w-full object-cover h-full" />
    </div>
        <div class="w-full relative p-12">
            <div class="flex w-full items-center justify-start gap-4 absolute -top-8 left-0 px-12">
                <Button class="rounded-full h-16 w-16" onclick={playAllArtistSongs}>
                    <PlayerPlay class="scale-150 fill-background" />
                </Button>
                <Button variant="outline" class="rounded-full h-12 w-12" onclick={playArtistShuffledPlaylist}>
                    <ArrowsShuffle_2/>
                </Button>
                <Button variant="outline" class="rounded-full h-12 w-12">
                    <Heart/>
                </Button>
            </div>
            <div class="w-full grid grid-cols-3 gap-12">
                <div class="col-span-1 flex flex-col items-start justify-start gap-2">
                    <span class="text-2xl font-bold">{artist.name}</span>
                    <div class="flex gap-2 items-center justify-start">
                        <span class="text-sm text-muted-foreground">{albums.length} Albums</span>
                        <Circle class="h-2 w-2 fill-muted dark:fill-background" />
                        <span class="text-sm text-muted-foreground">{formatSecondCount(totalDuration)}</span>
                    </div>
                    <Separator />
                    <span class="text-sm text-muted-foreground text-justify">{artist.bio}</span>

                </div>
                <div class="col-span-2 flex items-center justify-end gap-2">
                    <ArtistAlbumAccordion albums={albums} songs={songs} bind:totalDuration={totalDuration} />
                </div>
            </div>
        </div>  
</div>  