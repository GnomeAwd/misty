const baseUrl = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";


export const playSongWithId = async (songId:number) => {
  const response = await fetch(baseUrl+"/api/play-song/"+songId);
  console.log("Response:", response);
  if(response.body) {
    const reader = response.body.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const audioBlob = new Blob(chunks, { type: response.headers.get("Content-Type") || "audio/mpeg" });
    return URL.createObjectURL(audioBlob);
  }
};