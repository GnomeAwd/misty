<script lang="ts">
	import Button from "../ui/button/button.svelte";


 interface Artist {
   artistBackgroundUrl: string
   artistBannerUrl: string
   artistHdMusicLogoUrl: string
   avatarUrl: string
   bio: string
   createdAt: string
   folderPath: string
   id: number
   musicbrainzId: string
   name: string
   updatedAt: string
 }

 let {artist}: {artist: Artist} = $props();

</script>

<Button href={`/artists/${artist.id}`} variant="outline" class="h-80 w-64 flex flex-col items-center justify-between border-0 overflow-hidden gap-2 p-4 bg-muted hover:bg-muted/80 dark:bg-background dark:hover:bg-muted/30">
    <img src={artist.avatarUrl} alt={artist.name} class="object-cover rounded-full w-full aspect-square" />
    <img src={artist.artistHdMusicLogoUrl} alt={artist.name} class="object-contain h-12 w-full" />
</Button>