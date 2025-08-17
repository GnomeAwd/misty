import { MusicBrainzApi } from "musicbrainz-api";
import { db } from "../db";
import { artists } from "../db/schema";
import { sql } from "drizzle-orm";
import {type ResultSet } from "@libsql/client/sqlite3";

const { readdir } = await import("fs/promises");

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

  console.log(`Scanning music folder: ${musicFolder}`);
  const folders = await readdir(musicFolder, { withFileTypes: true });
  const artistsFolders = folders
    .filter((folder) => folder.isDirectory())
    .map((folder) => folder.name);

  for (const artistFolder of artistsFolders) {
    const artistDb = await db
      .select({
        artistId: artists.id,
        artistName: artists.name,
        artistFolderPath: artists.folderPath,
      })
      .from(artists)
      .where(sql`${artists.folderPath} = ${musicFolder + "/" + artistFolder}`);
    if (artistDb.length !== 0) {
      let artistId = artistDb[0].artistId;
    } else {
      let artistEntry = await getArtistMetadata(artistFolder, musicFolder + "/" + artistFolder);
      if (!artistEntry) {
        console.log(`Failed to retrieve metadata for artist: ${artistFolder}`);
        break;
      }
      const result:void|ResultSet = await db.insert(artists).values(artistEntry).catch((err) => {
        console.error(`Failed to insert artist ${artistFolder} into database:`, err);
      });
      let artistId = result?.toJSON().lastInsertRowid;
    }
  }
  // TODO: Tag albums of corresponding artists
  // TODO: Get album metadata from API
  // TODO: Tag songs of corresponding albums
  // TODO: Get song metadata from API

  return { directories: artistsFolders };
};

const getArtistMetadata = async (artist: string, folderPath:string) => {
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
      artistEntry.bio = summary.replace(/ <a\s+href="(https:\/\/www\.last\.fm\/music\/[^"]+)">Read more on Last\.fm<\/a>/, "");
    }

    const fanartAssets = await fetchFanartArtistAssets(artistEntry.musicbrainzId);
    if (fanartAssets) {
      artistEntry.avatarUrl = fanartAssets.artistthumb[0];
      artistEntry.artistBannerUrl = fanartAssets.musicbanner[0];
      artistEntry.artistBackgroundUrl = fanartAssets.artistbackground[0];
      artistEntry.artistHdMusicLogoUrl = fanartAssets.hdmusiclogo[0];
    }

    artistEntry.folderPath = folderPath;

    return artistEntry;
  } catch (e) {
    console.error(`Error fetching artist metadata for ${artist}:`, e);
  }
};

const getAlbumMetadata = async (album: string) => {
  // TODO: Implement API call to get album metadata
};

const getSongMetadata = async (song: string) => {
  // TODO: Implement API call to get song metadata
};


async function fetchFanartArtistAssets(artistMBID: string): Promise<FanartArtistAssets | null> {
  if (!artistMBID || !FAN_ART_TV_API_KEY) return null;
  const url = `https://webservice.fanart.tv/v3/music/${encodeURIComponent(artistMBID)}?api_key=${encodeURIComponent(FAN_ART_TV_API_KEY)}`;
  const data = await fetch(url).then((res) => res.json()).catch(() => null);
  if (!data) return null;

  const extract = (arr: any): string[] =>
    Array.isArray(arr)
      ? [...arr]
          .map((x: any) => ({ url: x?.url as string | undefined, likes: Number(x?.likes || 0) }))
          .filter((x: FanartItem) => typeof x.url === 'string' && x.url!.length > 0)
          .sort((a: FanartItem, b: FanartItem) => (b.likes || 0) - (a.likes || 0))
          .map((x: FanartItem) => x.url!)
      : [];

  return {
    artistthumb: extract(data?.artistthumb),
    artistbackground: extract(data?.artistbackground),
    hdmusiclogo: extract(data?.hdmusiclogo),
    musicbanner: extract(data?.musicbanner)
  };
}