import { CoverArtArchiveApi, MusicBrainzApi } from "musicbrainz-api";
import { db } from "../db";
import { albums, artists } from "../db/schema";
import { sql, eq } from "drizzle-orm";
import { type ResultSet } from "@libsql/client/sqlite3";
import pino from "pino";
import { sleep } from "bun";
const { readdir } = await import("fs/promises");

const logger = pino();
const MUSICBRAINZ_APP_NAME = process.env.MUSICBRAINZ_APP_NAME || "Misty";
const MUSICBRAINZ_APP_VERSION = process.env.MUSICBRAINZ_APP_VERSION || "0.1";
const MUSICBRAINZ_CONTACT_EMAIL = process.env.MUSICBRAINZ_CONTACT_EMAIL || "";

const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY || "";
const FAN_ART_TV_API_KEY = process.env.FAN_ART_TV_API_KEY || "";

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
  }
  // TODO: Tag songs of corresponding albums
  // TODO: Get song metadata from API

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

    // Match releases to folders
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

    // 🔹 Filter out already existing folderPaths
    matchedReleases = matchedReleases.filter(
      (release) => !existingPaths.has(release.folderPath)
    );

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

const getAlbumMetadata = async (album: string) => {
  // TODO: Implement API call to get album metadata
};

const getSongMetadata = async (song: string) => {
  // TODO: Implement API call to get song metadata
};

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
