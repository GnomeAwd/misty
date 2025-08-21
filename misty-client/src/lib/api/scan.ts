const baseUrl = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

export const scan = async () => {
  const response = await fetch(baseUrl+"/api/scan");
  return response.json();
};