<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/main-sidebar/app-sidebar.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
  import { ModeWatcher } from 'mode-watcher';
	import MusicWidget from '$lib/components/player/music-widget.svelte';


	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher/>
<Sidebar.Provider style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);" >
  <AppSidebar variant="sidebar" />
  <Sidebar.Inset class="flex flex-col items-start justify-start">
    <div class="flex h-full  max-h-screen flex-col items-start justify-between overflow-hidden">
      <ScrollArea class="h-[80vh] w-full rounded-2xl overflow-hidden relative">
        {@render children?.()}
      </ScrollArea>
		</div>
	</Sidebar.Inset>
  <MusicWidget />
</Sidebar.Provider>
