<script lang="ts">
	import type { PageData } from "./$types";


    let { data }: { data: PageData } = $props();

    const { artist, albums } = data;

    $effect(() => {
        console.log(artist, albums);
    });

</script>
<span>

</span>