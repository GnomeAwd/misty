const { readdir } = await import('fs/promises');

export const scan = async (musicFolder:string) => {

  if (musicFolder === "" || !musicFolder) {
    return { error: "MUSIC_FOLDER environment variable is empty" };
  }

  // TODO: Tag artist to folder
  // TODO: Get artist metadata from API
  console.log(`Scanning music folder: ${musicFolder}`);
  const folders = await readdir(musicFolder, { withFileTypes: true });
  const artists = folders
    .filter((folder) => folder.isDirectory())
    .map((folder) => folder.name);

  
  

  // TODO: Tag albums of corresponding artists
  // TODO: Get album metadata from API
  // TODO: Tag songs of corresponding albums
  // TODO: Get song metadata from API

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
