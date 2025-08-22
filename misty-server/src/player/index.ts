import pino from "pino";
import { db } from "../db";
import { songs } from "../db/schema";
import { sql, eq } from "drizzle-orm";

const logger = pino();

const mimeTypes: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  flac: "audio/flac",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  webm: "audio/webm",
  // Add other formats as needed
};

// Helper function to get Content-Type from extension
function getMimeType(filePath: string): string {
  const extMatch = filePath.match(/\.([^.]+)$/);
  if (extMatch) {
    const ext = extMatch[1].toLowerCase();
    return mimeTypes[ext] || "application/octet-stream";
  }
  return "application/octet-stream";
}

export const enum PlayerState {
  Stopped = "stopped",
  Playing = "playing",
  Paused = "paused",
}

export const enum RepeatMode {
  None = "none",
  One = "one",
  All = "all",
}

export interface PlayerStatus {
  state: PlayerState;
  currentSongId: number | null;
  position: number; // in seconds
  duration: number; // in seconds
  volume: number; // 0 to 100
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffling: boolean;
}

export const playSong = async (songId: number) => {
  const songData = await db
    .select()
    .from(songs)
    .where(eq(songs.id, songId))
    .get();
    
  const songFilePath = songData?.filePath;
  if (!songFilePath) {
    logger.error(`Song with ID ${songId} not found`);
    return null;
  }
  const file = Bun.file(songFilePath);
  if (!(await file.exists())) {
    return new Response("File not found", { status: 404 });
  }
  const contentType = getMimeType(songFilePath);

  return new Response(file.stream(), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        songData.title || "song"
      )}"`,
    },
  });
  
};
