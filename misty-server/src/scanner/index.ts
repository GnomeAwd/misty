import { CoverArtArchiveApi, MusicBrainzApi } from "musicbrainz-api";
import { db } from "../db";
import { albums, artists, songs } from "../db/schema";
import { sql, eq } from "drizzle-orm";
import { type ResultSet } from "@libsql/client/sqlite3";
import pino from "pino";
import path, { extname } from "path";
import { stat } from "fs/promises";
const { readdir } = await import("fs/promises");
import { parseFile, type IAudioMetadata } from "music-metadata";

const logger = pino();
const MUSICBRAINZ_APP_NAME = process.env.MUSICBRAINZ_APP_NAME || "Misty";
const MUSICBRAINZ_APP_VERSION = process.env.MUSICBRAINZ_APP_VERSION || "0.1";
const MUSICBRAINZ_CONTACT_EMAIL = process.env.MUSICBRAINZ_CONTACT_EMAIL || "";

const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY || "";
const FAN_ART_TV_API_KEY = process.env.FAN_ART_TV_API_KEY || "";

const AUDIO_EXT = new Set([".mp3", ".flac", ".m4a", ".ogg", ".wav", ".wma"]);

const mb = new MusicBrainzApi({
  appName: MUSICBRAINZ_APP_NAME,
  appVersion: MUSICBRAINZ_APP_VERSION,
  appContactInfo: MUSICBRAINZ_CONTACT_EMAIL,
});

const caApi = new CoverArtArchiveApi();

type FanartItem = { url?: string; likes?: number };
type FanartArtistAssets = {
  artistthumb: string[];
  artistbackground: string[];
  hdmusiclogo: string[];
  musicbanner: string[];
};

export const scan = async (musicFolder: string) => {
  if (musicFolder === "" || !musicFolder) {
    return { error: "MUSIC_FOLDER environment variable is empty" };
  }

  if (
    !MUSICBRAINZ_APP_NAME ||
    !MUSICBRAINZ_APP_VERSION ||
    !MUSICBRAINZ_CONTACT_EMAIL
  ) {
    return { error: "Missing MusicBrainz application metadata" };
  }

  if (!LAST_FM_API_KEY) {
    return { error: "Missing Last.fm key" };
  }

  if (!FAN_ART_TV_API_KEY) {
    return { error: "Missing Fan Art TV key" };
  }

  logger.info(`Scanning music folder: ${musicFolder}`);
  const folders = await readdir(musicFolder, { withFileTypes: true });
  const artistsFolders = folders
    .filter((folder) => folder.isDirectory())
    .map((folder) => folder.name);

  for (const artistFolder of artistsFolders) {
    let artistId: number | undefined;
    const artistDb = await db
      .select({
        artistId: artists.id,
        artistName: artists.name,
        artistFolderPath: artists.folderPath,
      })
      .from(artists)
      .where(sql`${artists.folderPath} = ${musicFolder + "/" + artistFolder}`);
    if (artistDb.length !== 0) {
      artistId = artistDb[0].artistId;
      logger.info(
        `Artist ${artistFolder} already exists in the database. with id: ${artistId}`
      );
    } else {
      let artistEntry = await getArtistMetadata(
        artistFolder,
        musicFolder + "/" + artistFolder
      );
      if (!artistEntry) {
        logger.error(`Failed to retrieve metadata for artist: ${artistFolder}`);
        break;
      }
      const result: void | ResultSet = await db
        .insert(artists)
        .values(artistEntry)
        .catch((err) => {
          logger.error(
            `Failed to insert artist ${artistFolder} into database:`,
            err
          );
        });
      artistId = result?.toJSON().lastInsertRowid;
      logger.info(`Inserted artist ${artistFolder} into database`);
    }

    if (!artistId) {
      logger.error(`Failed to retrieve or insert artist: ${artistFolder}`);
      continue;
    }

    const artist = await db
      .select()
      .from(artists)
      .where(sql`${artists.id} = ${artistId}`);

    logger.info(`Processing artist: ${artist[0].name} with ID: ${artistId}`);

    if (artist[0].musicbrainzId && artist[0].folderPath) {
      await saveAlbumData(
        artist[0].musicbrainzId,
        artist[0].folderPath,
        artistId
      );
    }

    const allArtistAlbums = await db
      .select()
      .from(albums)
      .where(eq(albums.artistId, artistId));

    if (allArtistAlbums.length === 0) {
      logger.warn(`No albums found for artist ID: ${artistId}`);
      continue;
    }

    saveSongData(allArtistAlbums);
  }

  return { directories: artistsFolders };
};

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseDateString(dateString: string): Date {
  if (!dateString) return new Date(NaN);

  const parts = dateString.split("-");
  const year = parseInt(parts[0], 10);
  const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
  const day = parts[2] ? parseInt(parts[2], 10) : 1;
  const date = new Date(year, month, day);

  return date;
}

const saveAlbumData = async (
  artistMbId: string,
  artistFolderPath: string,
  artistId: number
) => {
  try {
    const artistReleaseData = await mb.lookup("artist", artistMbId, [
      "release-groups",
    ]);

    let releases = artistReleaseData["release-groups"] || [];

    releases = releases.filter((release: any) => {
      return release["primary-type"] === "Album";
    });

    const folders = await readdir(artistFolderPath, {
      withFileTypes: true,
    }).then((files) =>
      files.filter((file) => file.isDirectory()).map((file) => file.name)
    );

    let matchedReleases = releases.flatMap((release) => {
      const matchedFolder = folders.find((folder) => {
        const f = normalize(folder);
        const t = normalize(release.title);
        return f.includes(t) || t.includes(f);
      });

      if (matchedFolder) {
        return {
          ...release,
          folderPath: `${artistFolderPath}/${matchedFolder}`,
        };
      }
      return [];
    });

    if (matchedReleases.length === 0) {
      logger.warn(`No matching releases found for artist ID: ${artistId}`);
      return;
    }

    const existingAlbums = await db
      .select()
      .from(albums)
      .where(eq(albums.artistId, artistId));

    const existingPaths = new Set(existingAlbums.map((a) => a.folderPath));
    const usedFolderPaths = new Set<string>();
    matchedReleases = matchedReleases.filter(release => {
      if (existingPaths.has(release.folderPath)) {
        return false;
      }
      
      if (usedFolderPaths.has(release.folderPath)) {
        logger.warn(`Duplicate folder path detected: ${release.folderPath}. Skipping release: ${release.title}`);
        return false;
      }
      usedFolderPaths.add(release.folderPath);
      return true;
    });

    if (matchedReleases.length === 0) {
      logger.info(
        `All matched albums already exist for artist ID: ${artistId}`
      );
      return;
    }

    const coverArtUrls = await Promise.all(
      matchedReleases.map((release) => getCoverArtForReleaseGroup(release.id))
    );

    const rows = matchedReleases.map((release, index) => ({
      title: release.title,
      artistId: artistId,
      musicbrainzId: release.id,
      folderPath: release.folderPath,
      albumArtUrl: coverArtUrls[index] || "",
      releaseDate: parseDateString(release["first-release-date"]) || null,
    }));

    const res: void | ResultSet = await db
      .insert(albums)
      .values(rows)
      .catch((err) => {
        logger.error(`Failed to insert albums for artist ID: ${artistId}`, err);
      });

    logger.info(
      `Inserted ${
        res?.toJSON().rowsAffected
      } new albums for artist ID: ${artistId}`
    );
  } catch (error: any) {
    logger.error(`Failed to save album data for ${artistMbId}:`, error);
  }
};

const getArtistMetadata = async (artist: string, folderPath: string) => {
  try {
    let artistEntry = {
      name: "",
      bio: "",
      musicbrainzId: "",
      folderPath: "",
      avatarUrl: "",
      artistBannerUrl: "",
      artistBackgroundUrl: "",
      artistHdMusicLogoUrl: "",
    };

    const artistMbData = await mb.search("artist", {
      query: `artist:"${artist}"`,
      limit: 1,
    });
    const selectiveArtistData = artistMbData.artists[0];

    artistEntry.musicbrainzId = selectiveArtistData.id;
    artistEntry.name = selectiveArtistData.name;

    const lastFmUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&mbid=${encodeURIComponent(
      artistEntry.musicbrainzId
    )}&api_key=${encodeURIComponent(LAST_FM_API_KEY)}&format=json`;

    const lastFmData = await fetch(lastFmUrl).then((res) => res.json());
    if (lastFmData) {
      let summary = lastFmData?.artist?.bio?.summary || "";
      artistEntry.bio = summary.replace(
        / <a\s+href="(https:\/\/www\.last\.fm\/music\/[^"]+)">Read more on Last\.fm<\/a>/,
        ""
      );
    }

    const fanartAssets = await fetchFanartArtistAssets(
      artistEntry.musicbrainzId
    );
    if (fanartAssets) {
      artistEntry.avatarUrl = fanartAssets.artistthumb[0];
      artistEntry.artistBannerUrl = fanartAssets.musicbanner[0];
      artistEntry.artistBackgroundUrl = fanartAssets.artistbackground[0];
      artistEntry.artistHdMusicLogoUrl = fanartAssets.hdmusiclogo[0];
    }

    artistEntry.folderPath = folderPath;

    return artistEntry;
  } catch (e: any) {
    logger.error(`Error fetching artist metadata for ${artist}:`, e);
  }
};

async function getCoverArtForReleaseGroup(rgId: string): Promise<string> {
  try {
    const info: any = await caApi.getReleaseGroupCovers(rgId);
    const images: any[] = info?.images || [];
    const front = images.find((img: any) => img.front && img.image);
    const url = front?.image || images[0]?.image || "";
    return url;
  } catch {
    return "";
  }
}

async function fetchFanartArtistAssets(
  artistMBID: string
): Promise<FanartArtistAssets | null> {
  if (!artistMBID || !FAN_ART_TV_API_KEY) return null;
  const url = `https://webservice.fanart.tv/v3/music/${encodeURIComponent(
    artistMBID
  )}?api_key=${encodeURIComponent(FAN_ART_TV_API_KEY)}`;
  const data = await fetch(url)
    .then((res) => res.json())
    .catch(() => null);
  if (!data) return null;

  const extract = (arr: any): string[] =>
    Array.isArray(arr)
      ? [...arr]
          .map((x: any) => ({
            url: x?.url as string | undefined,
            likes: Number(x?.likes || 0),
          }))
          .filter(
            (x: FanartItem) => typeof x.url === "string" && x.url!.length > 0
          )
          .sort(
            (a: FanartItem, b: FanartItem) => (b.likes || 0) - (a.likes || 0)
          )
          .map((x: FanartItem) => x.url!)
      : [];

  return {
    artistthumb: extract(data?.artistthumb),
    artistbackground: extract(data?.artistbackground),
    hdmusiclogo: extract(data?.hdmusiclogo),
    musicbanner: extract(data?.musicbanner),
  };
}

const saveSongData = async (albumEntries: any[]) => {
  const rows: any[] = [];

  for (const album of albumEntries) {
    if (!album.musicbrainzId) {
      logger.warn(
        `Album ID ${album.id} has no MusicBrainz ID, skipping song fetching`
      );
      continue;
    }

    const insertedSongs = await db
      .select()
      .from(songs)
      .where(eq(songs.albumId, album.id));

    const audioFiles = await listAudioFiles(album.folderPath);
    if (audioFiles.length === 0) {
      logger.warn(`No audio files found in album folder: ${album.folderPath}`);
      continue;
    }

    logger.info(
      `Fetching recordings for album ${album.title} (${album.musicbrainzId})`
    );
    const mbSongs = await getMusicBrainzRecordings(album.musicbrainzId);

    if (!mbSongs || mbSongs.length === 0) {
      logger.warn(
        `No MusicBrainz recordings found for album ${album.title}, using local metadata`
      );
      for (const filePath of audioFiles) {
        await processSongFile(filePath, album, insertedSongs, rows);
      }
      continue;
    }
    logger.info(
      `Matching ${audioFiles.length} files to ${mbSongs.length} MusicBrainz recordings`
    );

    for (const filePath of audioFiles) {
      const basicMetadata = await getBasicFileMetadata(filePath);
      if (!basicMetadata) {
        logger.error(`Failed to extract basic metadata from file: ${filePath}`);
        continue;
      }
      if (
        insertedSongs.some((song) => song.filePath === filePath) ||
        rows.some((row) => row.filePath === filePath)
      ) {
        logger.info(`Song already exists in database: ${filePath}`);
        continue;
      }

      const matchedRecording = findMatchingRecording(basicMetadata, mbSongs);

      if (matchedRecording) {
        logger.info(
          `Matched file ${path.basename(filePath)} to MusicBrainz recording "${
            matchedRecording.title
          }"`
        );

        rows.push({
          title: matchedRecording.title,
          duration: matchedRecording.duration,
          trackNumber: matchedRecording.position || basicMetadata.track_number,
          musicbrainzId: matchedRecording.id,
          fileSize: basicMetadata.file_size,
          fileName: path.basename(filePath),
          filePath,
          albumId: album.id,
          artistId: album.artistId,
        });
      } else {
        logger.warn(
          `No MusicBrainz match found for file: ${path.basename(
            filePath
          )}, using file metadata`
        );
        await processSongFile(filePath, album, insertedSongs, rows);
      }
    }
  }
  if (rows.length === 0) {
    logger.info("No new songs to insert.");
    return;
  }
  const res: void | ResultSet = await db
    .insert(songs)
    .values(rows)
    .catch((err) => {
      logger.error("Failed to insert songs into database:", err);
    });
  logger.info(`Inserted ${res?.toJSON().rowsAffected} new songs into database`);
  return res?.toJSON().rowsAffected || 0;
};


async function getMusicBrainzRecordings(albumMbid: string): Promise<
  Array<{
    id: string;
    title: string;
    position: number;
    duration: number;
  }>
> {
  try {
    const releaseData = await mb.lookup("release-group", albumMbid, [
      "releases",
    ]);

    if (!releaseData.releases || releaseData.releases.length === 0) {
      logger.warn(`No releases found for release group ${albumMbid}`);
      return [];
    }

    const releaseId = releaseData.releases[0].id;

    const release = await mb.lookup("release", releaseId, ["recordings"]);

    if (!release.media || release.media.length === 0) {
      logger.warn(`No media found in release ${releaseId}`);
      return [];
    }

    const recordings: Array<{
      id: string;
      title: string;
      position: number;
      duration: number;
    }> = [];

    for (const medium of release.media) {
      if (!medium.tracks) continue;

      for (const track of medium.tracks) {
        if (!track.recording) continue;

        recordings.push({
          id: track.recording.id,
          title: track.title || track.recording.title,
          position: track.position,
          duration: track.length ? Math.round(track.length / 1000) : 0,
        });
      }
    }

    return recordings;
  } catch (error) {
    logger.error(
      `Failed to fetch MusicBrainz recordings for ${albumMbid}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return [];
  }
}

async function listAudioFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter(
        (f) => f.isFile() && AUDIO_EXT.has(path.extname(f.name).toLowerCase())
      )
      .map((f) => path.join(dir, f.name));
  } catch {
    return [];
  }
}

async function getSongMetadata(filePath: string): Promise<{
  title: string;
  track_number: number;
  duration: number;
  file_size: number;
  raw?: any;
}> {
  try {
    const stats = await stat(filePath);
    const mm: IAudioMetadata = await parseFile(filePath);
    const common: any = mm.common || {};
    const format: any = mm.format || {};
    const title = (common.title ||
      path.basename(filePath, path.extname(filePath))) as string;
    const tn = common.track?.no || 0;
    // Use format.duration directly as fallback
    const duration = format.duration ? Math.floor(format.duration) : 0;
    return {
      title,
      track_number: typeof tn === "number" ? tn : 0,
      duration,
      file_size: stats.size,
      raw: { common, format },
    };
  } catch {
    const stats = await stat(filePath).catch(() => ({ size: 0 } as any));
    return {
      title: path.basename(filePath, path.extname(filePath)),
      track_number: 0,
      duration: 0,
      file_size: Number(stats?.size || 0),
    };
  }
}

async function getBasicFileMetadata(filePath: string): Promise<{
  title: string;
  track_number: number;
  file_size: number;
} | null> {
  try {
    const stats = await stat(filePath);
    const mm: IAudioMetadata = await parseFile(filePath);
    const common: any = mm.common || {};
    const title = (common.title ||
      path.basename(filePath, path.extname(filePath))) as string;
    const tn = common.track?.no || 0;
    return {
      title,
      track_number: typeof tn === "number" ? tn : 0,
      file_size: stats.size,
    };
  } catch (err) {
    logger.error(
      `Failed to extract basic metadata from ${filePath}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    return null;
  }
}

async function processSongFile(
  filePath: string,
  album: any,
  insertedSongs: any[],
  rows: any[]
): Promise<void> {
  const metadata = await getSongMetadata(filePath);
  if (!metadata) {
    logger.error(`Failed to retrieve metadata for file: ${filePath}`);
    return;
  }

  rows.push({
    title: metadata.title,
    duration: metadata.duration,
    trackNumber: metadata.track_number,
    fileSize: metadata.file_size,
    fileName: path.basename(filePath),
    filePath,
    albumId: album.id,
    artistId: album.artistId,
  });
}

function findMatchingRecording(
  fileMetadata: { title: string; track_number: number },
  mbRecordings: Array<{
    id: string;
    title: string;
    position: number;
    duration: number;
  }>
) {
  if (fileMetadata.track_number > 0) {
    const trackMatch = mbRecordings.find(
      (rec) => rec.position === fileMetadata.track_number
    );
    if (trackMatch) return trackMatch;
  }

  const normalizedFileTitle = normalize(fileMetadata.title);

  let bestMatch = null;
  let bestScore = 0;

  for (const recording of mbRecordings) {
    const normalizedMbTitle = normalize(recording.title);

    let score = 0;
    if (normalizedFileTitle === normalizedMbTitle) {
      score = 100; 
    } else if (
      normalizedFileTitle.includes(normalizedMbTitle) ||
      normalizedMbTitle.includes(normalizedFileTitle)
    ) {
      score = 80;
    } else {
      const fileTitleWords = normalizedFileTitle.split(/[\s\-_]+/);
      const mbTitleWords = normalizedMbTitle.split(/[\s\-_]+/);

      const commonWords = fileTitleWords.filter((word) =>
        mbTitleWords.some(
          (mbWord) => mbWord.includes(word) || word.includes(mbWord)
        )
      );

      score =
        (commonWords.length /
          Math.max(fileTitleWords.length, mbTitleWords.length)) *
        70;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = recording;
    }
  }

  return bestScore >= 50 ? bestMatch : null;
}
