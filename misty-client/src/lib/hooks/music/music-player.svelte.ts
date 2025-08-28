import { playSongWithId } from '$lib/api/player';

export interface Song {
	id: number;
	title: string;
	artistId: number;
	albumId: number;
	albumArt?: string;
	duration?: number;
	url?: string;
}

export interface MusicPlayerState {
	currentSong: Song | null;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isShuffled: boolean;
	repeatMode: 'none' | 'one' | 'all';
	playlist: Song[];
	currentIndex: number;
	isLoading: boolean;
}

const initialState: MusicPlayerState = {
	currentSong: null,
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	volume: 1,
	isMuted: false,
	isShuffled: false,
	repeatMode: 'none',
	playlist: [],
	currentIndex: -1,
	isLoading: false
};

export const musicPlayerState = $state(initialState);

let audioElement: HTMLAudioElement | null = null;

export function setAudioElement(element: HTMLAudioElement) {
	audioElement = element;
}

export async function playSong(song?: Song, playlist?: Song[], index?: number) {
	if (!audioElement) return;

	try {
		musicPlayerState.isLoading = true;

		if (song) {
			musicPlayerState.currentSong = song;
			if (playlist && index !== undefined) {
				musicPlayerState.playlist = playlist;
				musicPlayerState.currentIndex = index;
			}
		}

		if (!musicPlayerState.currentSong) return;

		const audioUrl = await playSongWithId(musicPlayerState.currentSong.id);
		if (audioUrl) {
			audioElement.src = audioUrl;
			await audioElement.play();
			musicPlayerState.isPlaying = true;
		}
	} catch (error) {
		console.error('Error playing song:', error);
	} finally {
		musicPlayerState.isLoading = false;
	}
}

export function pauseSong() {
	if (!audioElement) return;
	audioElement.pause();
	musicPlayerState.isPlaying = false;
}

export function resumeSong() {
	if (!audioElement) return;
	audioElement.play();
	musicPlayerState.isPlaying = true;
}

export function togglePlayPause() {
	if (musicPlayerState.isPlaying) {
		pauseSong();
	} else {
		resumeSong();
	}
}

export function nextSong() {
	if (musicPlayerState.playlist.length === 0) return;

	if (musicPlayerState.repeatMode === 'one') {
		if (musicPlayerState.currentSong) {
			playSong(musicPlayerState.currentSong);
		}
		return;
	}

	let nextIndex: number;

	if (musicPlayerState.isShuffled) {
		nextIndex = Math.floor(Math.random() * musicPlayerState.playlist.length);
	} else {
		nextIndex = musicPlayerState.currentIndex + 1;
		if (nextIndex >= musicPlayerState.playlist.length) {
			if (musicPlayerState.repeatMode === 'all') {
				nextIndex = 0;
			} else {
				return;
			}
		}
	}

	const nextSong = musicPlayerState.playlist[nextIndex];
	if (nextSong) {
		musicPlayerState.currentIndex = nextIndex;
		playSong(nextSong);
	}
}

export function previousSong() {
	if (musicPlayerState.playlist.length === 0) return;

	if (musicPlayerState.repeatMode === 'one') {
		if (musicPlayerState.currentSong) {
			playSong(musicPlayerState.currentSong);
		}
		return;
	}

	let prevIndex: number;

	if (musicPlayerState.isShuffled) {
		prevIndex = Math.floor(Math.random() * musicPlayerState.playlist.length);
	} else {
		prevIndex = musicPlayerState.currentIndex - 1;
		if (prevIndex < 0) {
			if (musicPlayerState.repeatMode === 'all') {
				prevIndex = musicPlayerState.playlist.length - 1;
			} else {
				return;
			}
		}
	}

	const prevSong = musicPlayerState.playlist[prevIndex];
	if (prevSong) {
		musicPlayerState.currentIndex = prevIndex;
		playSong(prevSong);
	}
}

export function seekTo(time: number) {
	if (!audioElement) return;
	audioElement.currentTime = time;
	musicPlayerState.currentTime = time;
}

export function setVolume(volume: number) {
	if (!audioElement) return;
	const clampedVolume = Math.max(0, Math.min(1, volume));
	audioElement.volume = clampedVolume;
	musicPlayerState.volume = clampedVolume;
	musicPlayerState.isMuted = clampedVolume === 0;
}

export function toggleMute() {
	if (!audioElement) return;
	
	if (musicPlayerState.isMuted) {
		audioElement.volume = musicPlayerState.volume;
		musicPlayerState.isMuted = false;
	} else {
		audioElement.volume = 0;
		musicPlayerState.isMuted = true;
	}
}

export function toggleShuffle() {
	musicPlayerState.isShuffled = !musicPlayerState.isShuffled;
}

export function toggleRepeat() {
	const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
	const currentIndex = modes.indexOf(musicPlayerState.repeatMode);
	const nextIndex = (currentIndex + 1) % modes.length;
	musicPlayerState.repeatMode = modes[nextIndex];
}

export function setPlaylist(songs: Song[], startIndex: number = 0) {
	musicPlayerState.playlist = songs;
	musicPlayerState.currentIndex = startIndex;
	if (songs[startIndex]) {
		musicPlayerState.currentSong = songs[startIndex];
	}
}

export function handleTimeUpdate() {
	if (!audioElement) return;
	musicPlayerState.currentTime = audioElement.currentTime;
}

export function handleLoadedMetadata() {
	if (!audioElement) return;
	musicPlayerState.duration = audioElement.duration || 0;
}

export function handlePlay() {
	musicPlayerState.isPlaying = true;
}

export function handlePause() {
	musicPlayerState.isPlaying = false;
}

export function handleEnded() {
	if (musicPlayerState.repeatMode === 'one') {
		if (audioElement) {
			audioElement.currentTime = 0;
			audioElement.play();
		}
	} else {
		nextSong();
	}
}

export function formatTime(seconds: number): string {
	if (isNaN(seconds)) return '00:00';
	const m = Math.floor(seconds / 60)
		.toString()
		.padStart(2, '0');
	const s = Math.floor(seconds % 60)
		.toString()
		.padStart(2, '0');
	return `${m}:${s}`;
}
