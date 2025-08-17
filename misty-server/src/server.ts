import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { scan } from "./scanner";

const app = new Hono();

app.use("/*", serveStatic({ root: "../misty-client/build" }));

app.get("/api/scan", async (c) => {
  const result = await scan();
  return c.json(result);
});

export default app;