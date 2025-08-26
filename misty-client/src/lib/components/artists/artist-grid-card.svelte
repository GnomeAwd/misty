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

<Button href={`/artists/${artist.id}`} variant="outline" class="h-80 w-64 flex flex-col items-center border-0 justify-between overflow-hidden gap-2 p-0 bg-muted hover:bg-muted/80 dark:bg-background dark:hover:bg-muted/30 relative">
    <img src={artist.avatarUrl} alt={artist.name} class="object-cover w-full h-full" />
    <div class="absolute w-full flex items-center justify-center bottom-0 left-0 bg-gradient-to-t from-foreground via-foreground/50 dark:from-background dark:via-background/50 to-transparent p-4">
      <img src={artist.artistHdMusicLogoUrl} alt={artist.name} class="object-contain h-12 rounded-xl"  />
    </div>
</Button>