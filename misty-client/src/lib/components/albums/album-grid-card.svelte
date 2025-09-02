<script lang='ts'>
	import { Button } from "../ui/button";

    let {album, artist} = $props();

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

</script>

<div class="col-span-1 flex flex-col items-start justify-start gap-4 w-64 h-80">
    <Button href={`/albums/${album.id}`} variant="outline" class="h-64 w-64 flex flex-col items-center border-0 justify-between overflow-hidden gap-2 p-0 bg-muted hover:bg-muted/80 dark:bg-background dark:hover:bg-muted/30 relative">
        <img src={album.albumArtUrl} alt={album.title} class="object-cover w-full h-full" />
        <!-- <div class="absolute w-full flex items-center justify-center bottom-0 left-0 bg-gradient-to-t from-foreground via-foreground/50 dark:from-background dark:via-background/50 to-transparent p-4">
        </div> -->
    </Button>
    <div class="flex flex-col items-start justify-start gap-1 w-full">
        <span class="w-full truncate text-left text-sm font-medium">{album.title}</span>
        <span class="text-muted-foreground text-xs">{artist?.name}</span>
    </div>
</div>