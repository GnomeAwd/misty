<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import List from '@tabler/icons-svelte/icons/list';
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte';
	import Button from '../ui/button/button.svelte';
	import PlayerSkipForwardFilled from '@tabler/icons-svelte/icons/player-skip-forward-filled';
	import Separator from '../ui/separator/separator.svelte';
	import GripVertical from '@tabler/icons-svelte/icons/grip-vertical';
	import TrashFilled from '@tabler/icons-svelte/icons/trash-filled';
	import PlayerPlay from '@tabler/icons-svelte/icons/player-play';
	import PlayerPlayFilled from '@tabler/icons-svelte/icons/player-play-filled';
	import { playSong, setPlaylist } from '$lib/hooks/music/music-player.svelte';

	let { playlist, currentSong, currentSongAlbumArt, currentSongArtistName } = $props();

	let draggedIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	let getPlaylistAfterCurrent = () => {
		return playlist.slice(playlist.findIndex((song: any) => song.id === currentSong.id) + 1);
	};

	let playlistAfterCurrent = $derived(getPlaylistAfterCurrent());

	function handleDragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		dragOverIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDragLeave() {
		dragOverIndex = null;
	}

	function handleDrop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		
		if (draggedIndex === null || draggedIndex === dropIndex) {
			draggedIndex = null;
			dragOverIndex = null;
			return;
		}

		const currentSongIndex = playlist.findIndex((song: any) => song.id === currentSong.id);
		const afterCurrentList = [...playlistAfterCurrent];

		const draggedItem = afterCurrentList.splice(draggedIndex, 1)[0];

		afterCurrentList.splice(dropIndex, 0, draggedItem);

		const newPlaylist = [
			...playlist.slice(0, currentSongIndex + 1),
			...afterCurrentList
		];

		setPlaylist(newPlaylist, currentSongIndex);

		draggedIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
		dragOverIndex = null;
	}
</script>



<Popover.Root>
	<Popover.Trigger class={buttonVariants({ variant: 'ghost' })}>
		<List class="h-5 w-5" />
	</Popover.Trigger>
	<Popover.Content
		class="bg-muted dark:bg-background z-[999] flex w-[500px] flex-col gap-2"
		sideOffset={20}
		align="end"
	>
		<span class="text-muted-foreground mb-4 text-sm font-semibold">Queue</span>
		<div>
			<span class="text-muted-foreground text-xs font-semibold">Now Playing</span>
		</div>
		<div class="hover:bg-card flex items-center justify-between gap-2 rounded-lg p-2 mr-3">
			<div class="flex items-start justify-center gap-2">
				<img src={currentSongAlbumArt} alt={currentSong.title} class="h-12 w-12 rounded-md" />
				<div class="flex h-full flex-col items-start justify-center gap-1">
					<span class="w-[260px] truncate text-sm font-medium">{currentSong.title}</span>
					<span class="text-muted-foreground text-xs font-semibold">
						{currentSongArtistName}
					</span>
				</div>
			</div>
            
			<div class="flex items-center justify-center p-2">
				<div class="flex items-end gap-0.5 h-4 w-4">
					<div class="bg-primary w-1 h-full rounded-md origin-bottom music-bar-1"></div>
					<div class="bg-primary w-1 h-full rounded-md origin-bottom music-bar-2"></div>
					<div class="bg-primary w-1 h-full rounded-md origin-bottom music-bar-3"></div>
				</div>
			</div>
		</div>
		<div>
			<span class="text-muted-foreground text-xs font-semibold">Up Next</span>
		</div>
		<ScrollArea class="h-[400px] pr-3">
			<div class="flex flex-col gap-2" role="list" aria-label="Playlist queue">
				{#each playlistAfterCurrent as song,i}
					<div 
						class="hover:bg-card flex items-center justify-between gap-2 rounded-lg p-2 transition-colors {dragOverIndex === i ? 'border-2 border-primary border-dashed' : ''} {draggedIndex === i ? 'opacity-50' : ''}"
						draggable="true"
						role="listitem"
						ondragstart={(e) => handleDragStart(e, i)}
						ondragover={(e) => handleDragOver(e, i)}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, i)}
						ondragend={handleDragEnd}
					>
						<div class="flex items-start justify-center gap-2 ">
                            <button class="h-12 w-12 focus:outline-0 relative group rounded-md" onclick={() => playSong(song,playlistAfterCurrent,i)}>
                                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                                    <PlayerPlayFilled class="text-primary"/>
                                </div>
                                <img src={song.albumArtUrl} alt={song.title} class="h-12 w-12 rounded-md" />
                            </button>
							<div class="flex h-full flex-col items-start justify-center gap-1">
								<span class="w-[260px] truncate text-sm font-medium">{song.title}</span>
								<span class="text-muted-foreground text-xs font-semibold">
									{song.artistName}
								</span>
							</div>
						</div>
                        	<div class="flex items-start justify-center gap-2 ">
                                <Button variant="ghost" size="icon">
                                    <TrashFilled class="h-5 w-5" />
                                </Button>
                            </div>
					</div>
				{/each}
			</div>
		</ScrollArea>
	</Popover.Content>
</Popover.Root>


<style>
	@keyframes music-bar {
		0%, 100% { transform: scaleY(0.3); }
		50% { transform: scaleY(1); }
	}
	
	.music-bar-1 {
		animation: music-bar 600ms ease-in-out infinite;
		animation-delay: 0ms;
	}
	
	.music-bar-2 {
		animation: music-bar 800ms ease-in-out infinite;
		animation-delay: 150ms;
	}
	
	.music-bar-3 {
		animation: music-bar 700ms ease-in-out infinite;
		animation-delay: 300ms;
	}
</style>