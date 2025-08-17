import { MusicBrainzApi } from "musicbrainz-api";
import { db } from "../db";

const { readdir } = await import("fs/promises");

const MUSICBRAINZ_APP_NAME = process.env.MUSICBRAINZ_APP_NAME || "Misty";
const MUSICBRAINZ_APP_VERSION = process.env.MUSICBRAINZ_APP_VERSION || "0.1";
const MUSICBRAINZ_CONTACT_EMAIL = process.env.MUSICBRAINZ_CONTACT_EMAIL || "";

const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY || "";
const FAN_ART_TV_API_KEY = process.env.FAN_ART_TV_API_KEY || "";

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

  const mb = new MusicBrainzApi({
    appName: MUSICBRAINZ_APP_NAME,
    appVersion: MUSICBRAINZ_APP_VERSION,
    appContactInfo: MUSICBRAINZ_CONTACT_EMAIL,
  });


  console.log(`Scanning music folder: ${musicFolder}`);
  const folders = await readdir(musicFolder, { withFileTypes: true });
  const artists = folders
    .filter((folder) => folder.isDirectory())
    .map((folder) => folder.name);

  for (const artist of artists) {
    db.execute("select * from artists where name = ?", [artist]).then((doc: any) => {
      if (doc && doc.exists) {
        // TODO: Tag artist to folder
        // TODO: Get artist metadata from API
      } else {
        // TODO: Handle artist not found
      }
    });
  }

    // TODO: Tag albums of corresponding artists
    // TODO: Get album metadata from API
    // TODO: Tag songs of corresponding albums
    // TODO: Get song metadata from API
  }

  return { directories: artists };
};

const getArtistMetadata = async (artist: string) => {
  // TODO: Implement API call to get artist metadata

};

const getAlbumMetadata = async (album: string) => {
  // TODO: Implement API call to get album metadata
};

const getSongMetadata = async (song: string) => {
  // TODO: Implement API call to get song metadata
};
