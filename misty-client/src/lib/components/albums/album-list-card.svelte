<script lang='ts'>
	import { Button } from "../ui/button";

    let {album, artist} = $props();

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

</script>

<div class="flex items-start justify-start gap-4 w-full h-12">
    <Button href={`/albums/${album.id}`} variant="ghost" class="h-15 w-full flex items-center justify-between hover:bg-primary/20 hover:text-foreground py-2 px-2">
        <img src={album.albumArtUrl} alt={album.title} class="object-cover w-12 h-12 rounded-md" />
        <!-- <div class="absolute w-full flex items-center justify-center bottom-0 left-0 bg-gradient-to-t from-foreground via-foreground/50 dark:from-background dark:via-background/50 to-transparent p-4">
        </div> -->
        <div class="flex flex-col items-start justify-start gap-1 w-full">
            <span class="w-full truncate text-left text-sm font-medium">{album.title}</span>
            <span class="text-muted-foreground text-xs">{artist?.name}</span>
        </div>
    </Button>
</div>