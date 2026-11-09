import { Hono } from "hono";

export interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({
  status: "ok",
  service: "welkomy-api",
  environment: c.env.ENVIRONMENT ?? "development",
}));

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;