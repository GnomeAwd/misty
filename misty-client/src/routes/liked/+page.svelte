<script lang="ts">
    let {data} = $props();
    let {songs} = data;
</script>


<div
	class="bg-muted dark:bg-background flex h-[90.5vh] w-full flex-col items-start justify-start gap-4 p-4"
>
	{#each songs as song}
		<div class="flex items-center justify-between p-2 border-b border-muted">
			<span>{song.title}</span>
			<button class="btn btn-primary">Play</button>
		</div>
	{/each}
</div>