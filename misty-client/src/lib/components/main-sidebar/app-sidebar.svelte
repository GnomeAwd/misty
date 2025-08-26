<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import MusicIcon from '@tabler/icons-svelte/icons/music';
	import AlbumIcon from '@tabler/icons-svelte/icons/album';
	import MicrophoneIcon from '@tabler/icons-svelte/icons/microphone';
	import PlaylistIcon from '@tabler/icons-svelte/icons/playlist';
	import HeartIcon from '@tabler/icons-svelte/icons/heart';
	import ClockIcon from '@tabler/icons-svelte/icons/clock';
	import type { ComponentProps } from 'svelte';
  import {Badge} from '$lib/components/ui/badge';
  import MistyLogo from '$lib/components/icons/misty-logo.svelte';
  import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';

  let {...restProps}: ComponentProps<typeof Sidebar.Root> = $props();

  const data = {
    navMain: [
		  {
			  title: 'Home',
			  url: '/',
			  icon: MusicIcon
		  },
		  {
			  title: 'Albums',
			  url: '/albums',
			  icon: AlbumIcon
		  },
		  {
			  title: 'Artists',
			  url: '/artists',
			  icon: MicrophoneIcon
		  },
		  {
			  title: 'Playlists',
			  url: '/playlists',
        icon: PlaylistIcon
		  }
	  ],
    navSecondary: [
			{
				title: 'Recently Played',
				url: '/recent',
				icon: ClockIcon
			},
			{
				title: 'Favorites',
				url: '/favorites',
				icon: HeartIcon
			}
		]
  }
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps} class="max-h-[91vh]" >
  <Sidebar.Header>
    <div class="px-4 flex items-start justify-start gap-4 py-4">
			<MistyLogo />
			<div class="flex w-full gap-2 items-center justify-between text-left text-sm leading-tight">
			  <span class="truncate font-semibold text-sm tracking-widest">
				  misty
				</span>
				<Badge variant="outline" class="truncate font-semibold text-xs tracking-widest ">v0.1.2</Badge>
			</div>
    </div>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={data.navMain}/>
  </Sidebar.Content>
  <Sidebar.Footer >
    <NavSecondary/>
  </Sidebar.Footer>
</Sidebar.Root>
