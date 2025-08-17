export const scan = async () => {
  const response = await fetch("/api/scan");
  return response.json();
};