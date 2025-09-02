<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/main-sidebar/app-sidebar.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { ModeWatcher } from 'mode-watcher';
	import MusicWidget from '$lib/components/player/music-widget.svelte';

	let { children, data } = $props();

	let { artists, albums } = data;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
	class="bg-background dark:bg-muted"
>
	<AppSidebar variant="floating" />
	<Sidebar.Inset
		class="bg-background dark:bg-muted flex max-h-[91vh] flex-col items-start justify-start p-2 pl-0 peer-data-[state=collapsed]:pl-2 "
	>
		<div class="flex max-h-screen w-full flex-col items-start justify-between overflow-hidden">
			<ScrollArea class="relative w-full overflow-hidden rounded-lg">
				{@render children?.()}
			</ScrollArea>
		</div>
	</Sidebar.Inset>
	<MusicWidget {artists} {albums} />
</Sidebar.Provider>
