const baseUrl = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";


export const likeSong = async (songId:number) => {
  return await fetch(`${baseUrl}/api/like-song/${songId}`, {
    method: "GET",
  });
};

export const unlikeSong = async (songId:number) => {
  return await fetch(`${baseUrl}/api/unlike-song/${songId}`, {
    method: "GET",
  });
};