import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { scan } from "./scanner";

const app = new Hono();
const MUSIC_FOLDER = Bun.env.MUSIC_FOLDER;

app.use("/*", serveStatic({ root: "../misty-client/build" }));

app.get("/api/scan", async (c) => {

  if (!MUSIC_FOLDER) {
    return c.json(
      { error: "MUSIC_FOLDER environment variable is not set" },
      400
    );
  }

  const result = await scan(MUSIC_FOLDER);

  return c.json(result);
});

export default app;
