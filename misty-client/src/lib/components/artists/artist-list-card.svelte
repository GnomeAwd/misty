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

<Button href={`/artists/${artist.id}`} variant="ghost" class="h-15 w-full flex items-center justify-between hover:bg-primary/20 hover:text-foreground py-2 px-2 gap-4">
    <img src={artist.avatarUrl} alt={artist.name} class="object-cover w-12 h-12 rounded-md" />
    <div class="flex flex-col items-start justify-start gap-1 w-full">
        <span class="w-full truncate text-left text-sm font-medium">{artist.name}</span>
    </div>  
</Button>