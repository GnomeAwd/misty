<script lang="ts">
	import PlayerSkipBack from '@tabler/icons-svelte/icons/player-skip-back';
	import { Button } from '../ui/button';
	import PlayerPlay from '@tabler/icons-svelte/icons/player-play';
	import PlayerSkipForward from '@tabler/icons-svelte/icons/player-skip-forward';
	import ArrowsShuffle from '@tabler/icons-svelte/icons/arrows-shuffle';
	import Repeat from '@tabler/icons-svelte/icons/repeat';
	import List from '@tabler/icons-svelte/icons/list';
	import Volume from '@tabler/icons-svelte/icons/volume';
	import VolumeOff from '@tabler/icons-svelte/icons/volume-off';
	import { Progress } from '../ui/progress';
	import PlayerPause from '@tabler/icons-svelte/icons/player-pause';
	import { 
		musicPlayerState,
		setAudioElement,
		togglePlayPause,
		nextSong,
		previousSong,
		toggleShuffle,
		toggleRepeat,
		toggleMute,
		handleTimeUpdate,
		handleLoadedMetadata,
		handlePlay,
		handlePause,
		handleEnded,
		formatTime,
		seekTo,
	} from '$lib/hooks/music/music-player.svelte';


	let {artists,albums} = $props();
	let audioElement: HTMLAudioElement;

	// Derived values from the global state
	const currentSong = $derived(musicPlayerState.currentSong);
	const isPlaying = $derived(musicPlayerState.isPlaying);
	const currentTime = $derived(musicPlayerState.currentTime);
	const duration = $derived(musicPlayerState.duration);
	const isShuffled = $derived(musicPlayerState.isShuffled);
	const repeatMode = $derived(musicPlayerState.repeatMode);
	const isMuted = $derived(musicPlayerState.isMuted);
	const isLoading = $derived(musicPlayerState.isLoading);

	// Progress percentage for the progress bar
	const progressPercentage = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	// Set the audio element reference when the component mounts
	$effect(() => {
		if (audioElement) {
			setAudioElement(audioElement);
		}
	});

	function handleProgressClick(event: MouseEvent) {
		if (!audioElement || duration <= 0) return;
		
		const progressBar = event.currentTarget as HTMLElement;
		const rect = progressBar.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const percentage = clickX / rect.width;
		const newTime = percentage * duration;
		
		seekTo(newTime);
	}

	function handleProgressKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			// For keyboard navigation, seek to 50% by default
			if (duration > 0) {
				seekTo(duration * 0.5);
			}
		}
	}

	function getRepeatIcon() {
		switch (repeatMode) {
			case 'one':
				return 'repeat-once';
			case 'all':
				return 'repeat';
			default:
				return 'repeat';
		}
	}

	function getArtistName() {
		const artist = artists.find((artist:any) => artist.id === currentSong?.artistId);
		return artist ? artist.name : 'Unknown Artist';
	}

	function getAlbumName() {
		const album = albums.find((album:any) => album.id === currentSong?.albumId);
		return album ? album.title : 'Unknown Album';
	}

	function getAlbumArt() {
		const album = albums.find((album:any) => album.id === currentSong?.albumId);
		return album ? album.albumArtUrl : 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmFuZHxlbnwwfHwwfHx8MA%3D%3D';
	}

	let artistName = $derived(getArtistName());
	let albumName = $derived(getAlbumName());
	let albumArt = $derived(getAlbumArt());

	$inspect(musicPlayerState.playlist )
</script>

<div class="fixed bottom-0 left-0 z-[999] w-full p-2 ">
	<div class="bg-muted dark:bg-background  h-full w-full rounded-lg">
		<div class="flex h-[8.5vh] w-full items-center justify-between gap-4 px-4 pl-2">
			<div class="flex w-[300px] items-center justify-start gap-2 hover:bg-muted/20 rounded-md p-2">
				<img
					src={albumArt}
					alt="album_art"
					class="aspect-square h-13 object-cover object-center rounded-md"
				/>
				<div class="flex flex-col items-start justify-between gap-1">
					<span class="text-base font-bold w-[150px] truncate">{currentSong?.title || 'No song selected'}</span>
					<span class="text-muted-foreground text-sm font-bold">
						{artistName} - 
						<span class="text-muted-foreground text-sm font-light">{albumName || 'Unknown Album'}</span>
					</span>
				</div>
			</div>
			<div class="flex items-center justify-center gap-2">
				<audio 
					bind:this={audioElement} 
					style="display: none;"
					ontimeupdate={handleTimeUpdate}
					onloadedmetadata={handleLoadedMetadata}
					onplay={handlePlay}
					onpause={handlePause}
					onended={handleEnded}
				></audio>
				
				<Button 
					variant="ghost" 
					size="icon" 
					onclick={toggleShuffle}
					class={isShuffled ? 'text-primary' : 'text-muted-foreground'}
				>
					<ArrowsShuffle class="h-5 w-5" />
				</Button>
				
				<Button variant="ghost" size="icon" onclick={previousSong}>
					<PlayerSkipBack class="h-5 w-5 fill-foreground" />
				</Button>
				
				<Button 
					variant="ghost" 
					size="icon" 
					class="h-12 w-12" 
					onclick={togglePlayPause}
					disabled={isLoading || !currentSong}
				>
					{#if isLoading}
						<div class="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
					{:else if isPlaying}
						<PlayerPause class="h-5 w-5 scale-150 fill-foreground" />
					{:else}
						<PlayerPlay class="h-5 w-5 scale-150 fill-foreground" />
					{/if}
				</Button>
				
				<Button variant="ghost" size="icon" onclick={nextSong}>
					<PlayerSkipForward class="h-5 w-5 fill-foreground" />
				</Button>
				
				<Button 
					variant="ghost" 
					size="icon" 
					onclick={toggleRepeat}
					class={repeatMode !== 'none' ? 'text-primary relative' : 'text-muted-foreground'}
				>
					<Repeat class="h-5 w-5" />
					{#if repeatMode === 'one'}
						<span class="absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">1</span>
					{/if}
				</Button>
			</div>
			<div class="flex flex-1 items-center justify-center gap-4">
				<span class="text-muted-foreground text-xs font-semibold w-[50px] text-center">{formatTime(currentTime)}</span>
				<button 
					class="flex-1 cursor-pointer bg-transparent border-none p-0 m-0"
					onclick={handleProgressClick}
					onkeydown={handleProgressKeydown}
					role="slider"
					aria-label="Seek audio position"
					aria-valuemin="0"
					aria-valuemax={duration}
					aria-valuenow={currentTime}
				>
					<Progress value={progressPercentage} />
				</button>
				<span class="text-muted-foreground text-xs font-semibold w-[50px] text-center">{formatTime(duration)}</span>
			</div>
			<div class="flex items-center justify-center gap-2">
				<Button variant="ghost" size="icon">
					<List class="h-5 w-5" />
				</Button>
				<Button variant="ghost" size="icon" onclick={toggleMute}>
					{#if isMuted}
						<VolumeOff class="h-5 w-5" />
					{:else}
						<Volume class="h-5 w-5" />
					{/if}
				</Button>
			</div>
		</div>
	</div>
</div>
