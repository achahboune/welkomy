import { betterAuth } from "better-auth";
import { Hono } from "hono";

export interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  APP_ORIGIN: string;
}

const app = new Hono<{ Bindings: Env }>();

function createAuth(env: Env) {
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters.");
  }

  return betterAuth({
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.APP_ORIGIN],
    emailAndPassword: { enabled: true },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
  });
}

app.get("/api/health", (c) => c.json({
  status: "ok",
  service: "welkomy-api",
  environment: c.env.ENVIRONMENT ?? "development",
}));

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return createAuth(c.env).handler(c.req.raw);
});

app.use("/api/properties", async (c, next) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Authentication required" }, 401);
  c.set("userId", session.user.id);
  await next();
});

app.use("/api/properties/*", async (c, next) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Authentication required" }, 401);
  c.set("userId", session.user.id);
  await next();
});

type PropertyInput = { name: string; location: string; guests: number };

async function readPropertyInput(request: Request): Promise<PropertyInput | null> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return null;
  }
  if (!body || typeof body !== "object") return null;

  const value = body as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const location = typeof value.location === "string" ? value.location.trim() : "";
  const guests = value.guests;

  if (
    !name || name.length > 120 ||
    !location || location.length > 180 ||
    typeof guests !== "number" ||
    !Number.isInteger(guests) || guests < 1 || guests > 1000
  ) return null;

  return { name, location, guests };
}

app.get("/api/properties", async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT id, name, location, guests, status, accent, created_at, updated_at
     FROM properties WHERE user_id = ? ORDER BY created_at DESC`,
  ).bind(c.get("userId")).all();
  return c.json({ properties: result.results });
});

app.post("/api/properties", async (c) => {
  const input = await readPropertyInput(c.req.raw);
  if (!input) return c.json({ error: "Invalid property data" }, 400);

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO properties (id, user_id, name, location, guests)
     VALUES (?, ?, ?, ?, ?)`,
  ).bind(id, c.get("userId"), input.name, input.location, input.guests).run();

  return c.json({
    property: { id, ...input, status: "Draft", accent: "blue" },
  }, 201);
});

app.put("/api/properties/:id", async (c) => {
  const input = await readPropertyInput(c.req.raw);
  if (!input) return c.json({ error: "Invalid property data" }, 400);

  const result = await c.env.DB.prepare(
    `UPDATE properties
     SET name = ?, location = ?, guests = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ? AND user_id = ?`,
  ).bind(input.name, input.location, input.guests, c.req.param("id"), c.get("userId")).run();

  if (!result.meta.changes) return c.json({ error: "Property not found" }, 404);
  return c.json({ property: { id: c.req.param("id"), ...input } });
});

app.delete("/api/properties/:id", async (c) => {
  const result = await c.env.DB.prepare(
    "DELETE FROM properties WHERE id = ? AND user_id = ?",
  ).bind(c.req.param("id"), c.get("userId")).run();

  if (!result.meta.changes) return c.json({ error: "Property not found" }, 404);
  return c.json({ success: true });
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
