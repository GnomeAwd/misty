<script lang="ts">
	import PlayerSkipBack from '@tabler/icons-svelte/icons/player-skip-back';
	import { Button } from '../ui/button';
	import PlayerPlay from '@tabler/icons-svelte/icons/player-play';
	import PlayerSkipForward from '@tabler/icons-svelte/icons/player-skip-forward';
	import ArrowsShuffle from '@tabler/icons-svelte/icons/arrows-shuffle';
	import Repeat from '@tabler/icons-svelte/icons/repeat';
	import List from '@tabler/icons-svelte/icons/list';
	import Volume from '@tabler/icons-svelte/icons/volume';
	import { Progress } from '../ui/progress';
	import { playSongWithId } from '$lib/api/player';
	import PlayerPause from '@tabler/icons-svelte/icons/player-pause';

	let audioElement: HTMLAudioElement;

	let audioState = $state({
		isPlaying: false,
		currentTime: 0,
		duration: 0,
		repeat: false,
		repeatType: 'none',
		shuffle: false
	});

	let songId = 1;

	async function playSong() {
		const audioUrl = await playSongWithId(songId);
		if (audioUrl) {
			audioElement.src = audioUrl;
			audioElement.play();
			audioState.isPlaying = true;
		}
	}

	async function pauseSong() {
		audioElement.pause();
		audioState.isPlaying = false;
	}

	function onTimeUpdate() {
		audioState.currentTime = audioElement.currentTime;
		audioState.duration = audioElement.duration || 0;
	}

	function onPlay() {
		audioState.isPlaying = true;
	}

	function onPause() {
		audioState.isPlaying = false;
	}

	function formatTime(seconds: number): string {
		if (isNaN(seconds)) return '00:00';
		const m = Math.floor(seconds / 60)
			.toString()
			.padStart(2, '0');
		const s = Math.floor(seconds % 60)
			.toString()
			.padStart(2, '0');
		return `${m}:${s}`;
	}

	function onLoadedMetadata() {
    audioState.duration = audioElement.duration || 0;
  }
</script>

<div class="bg-background border-t-1 border-primary fixed bottom-0 left-0 z-[999] h-24 w-full">
	<div class="flex h-full w-full items-center justify-between gap-4 px-4">
		<div class="flex w-[300px] items-center justify-start gap-2">
			<img
				src="https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmFuZHxlbnwwfHwwfHx8MA%3D%3D"
				alt="album_art"
				class="w-18 h-18 object-cover object-center"
			/>
			<div class="flex flex-col items-start justify-between gap-1">
				<span class="text-base font-bold">Stinkfist</span>
				<span class="text-muted-foreground text-sm font-bold"
					>Tool - <span class="text-muted-foreground text-sm font-light">Ænima</span></span
				>
			</div>
		</div>
		<div class="flex items-center justify-center gap-2">
			<audio bind:this={audioElement} controls onpause={onPause} onplay={onPlay} ontimeupdate={onTimeUpdate} onloadedmetadata={onLoadedMetadata}></audio>
			<Button variant="outline" size="icon">
				<ArrowsShuffle class="h-5 w-5" />
			</Button>
			<Button variant="outline" size="icon">
				<PlayerSkipBack class="h-5 w-5" />
			</Button>
			{#if audioState.isPlaying}
				<Button variant="outline" size="icon" class="h-12 w-12" onclick={pauseSong}>
					<PlayerPause class="h-5 w-5" />
				</Button>
			{:else}
				<Button variant="outline" size="icon" class="h-12 w-12" onclick={playSong}>
					<PlayerPlay class="h-5 w-5" />
				</Button>
			{/if}
			<Button variant="outline" size="icon">
				<PlayerSkipForward class="h-5 w-5" />
			</Button>
			<Button variant="outline" size="icon">
				<Repeat class="h-5 w-5" />
			</Button>
		</div>
		<div class="flex flex-1 items-center justify-center gap-4">
			<span class="text-muted-foreground text-sm">{formatTime(audioState.currentTime)}</span>
			<Progress value={audioState.currentTime / audioState.duration * 100} />
			<span class="text-muted-foreground text-sm">{formatTime(audioState.duration)}</span>
		</div>
		<div class="flex items-center justify-center gap-2">
			<Button variant="outline" size="icon">
				<List class="h-5 w-5" />
			</Button>
			<Button variant="outline" size="icon">
				<Volume class="h-5 w-5" />
			</Button>
		</div>
	</div>
</div>
