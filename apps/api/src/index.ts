import { betterAuth } from "better-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";

export interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  APP_ORIGIN: string;
}
type AppEnv = { Bindings: Env; Variables: { userId: string } };
const app = new Hono<AppEnv>();

function createAuth(env: Env) {
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters.");
  }
  return betterAuth({
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.APP_ORIGIN],
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    advanced: {
      defaultCookieAttributes: {
        sameSite: env.ENVIRONMENT === "production" ? "none" : "lax",
        secure: env.ENVIRONMENT === "production",
        httpOnly: true,
      },
    },
  });
}

app.use("/api/*", cors({
  origin: (origin, c) => origin === c.env.APP_ORIGIN ? origin : null,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  maxAge: 600,
}));

app.get("/api/health", (c) => c.json({
  status: "ok",
  service: "welkomy-api",
  environment: c.env.ENVIRONMENT ?? "development",
}));

app.on(["GET", "POST"], "/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw));

app.use("/api/properties", async (c, next) => {
  const session = await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Authentication required" }, 401);
  c.set("userId", session.user.id);
  await next();
});
app.use("/api/properties/*", async (c, next) => {
  const session = await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Authentication required" }, 401);
  c.set("userId", session.user.id);
  await next();
});

type PropertyInput = { name: string; location: string; guests: number };
async function readPropertyInput(request: Request): Promise<PropertyInput | null> {
  let body: unknown;
  try { body = await request.json(); } catch { return null; }
  if (!body || typeof body !== "object") return null;
  const value = body as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const location = typeof value.location === "string" ? value.location.trim() : "";
  const guests = value.guests;
  if (!name || name.length > 120 || !location || location.length > 180 ||
      typeof guests !== "number" || !Number.isInteger(guests) || guests < 1 || guests > 1000) return null;
  return { name, location, guests };
}
function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "stay";
}

app.get("/api/properties", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT id, name, location, guests, status, accent, slug, created_at, updated_at FROM properties WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(c.get("userId")).all();
  return c.json({ properties: result.results });
});
app.post("/api/properties", async (c) => {
  const input = await readPropertyInput(c.req.raw);
  if (!input) return c.json({ error: "Invalid property data" }, 400);
  const id = crypto.randomUUID();
  const slug = `${slugify(input.name)}-${id.slice(0, 8)}`;
  await c.env.DB.prepare(
    "INSERT INTO properties (id,user_id,name,location,guests,slug) VALUES (?,?,?,?,?,?)"
  ).bind(id, c.get("userId"), input.name, input.location, input.guests, slug).run();
  return c.json({ property: { id, ...input, status: "Draft", accent: "blue", slug } }, 201);
});
app.put("/api/properties/:id", async (c) => {
  const input = await readPropertyInput(c.req.raw);
  if (!input) return c.json({ error: "Invalid property data" }, 400);
  const result = await c.env.DB.prepare(
    "UPDATE properties SET name=?, location=?, guests=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?"
  ).bind(input.name, input.location, input.guests, c.req.param("id"), c.get("userId")).run();
  if (!result.meta.changes) return c.json({ error: "Property not found" }, 404);
  return c.json({ property: { id: c.req.param("id"), ...input } });
});
app.delete("/api/properties/:id", async (c) => {
  const result = await c.env.DB.prepare("DELETE FROM properties WHERE id=? AND user_id=?")
    .bind(c.req.param("id"), c.get("userId")).run();
  if (!result.meta.changes) return c.json({ error: "Property not found" }, 404);
  return c.json({ success: true });
});

app.get("/api/properties/:id/guide", async (c) => {
  const property = await c.env.DB.prepare(
    "SELECT id, name, location, guests, status, slug, guide_content FROM properties WHERE id=? AND user_id=?"
  ).bind(c.req.param("id"), c.get("userId")).first();
  if (!property) return c.json({ error: "Property not found" }, 404);
  return c.json({ property });
});
app.put("/api/properties/:id/guide", async (c) => {
  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON" }, 400); }
  if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).guide_content !== "string") {
    return c.json({ error: "guide_content must be a JSON string" }, 400);
  }
  const content = (body as { guide_content: string }).guide_content;
  if (content.length > 50000) return c.json({ error: "Guide is too large" }, 413);
  try { JSON.parse(content); } catch { return c.json({ error: "Guide content must be valid JSON" }, 400); }
  const result = await c.env.DB.prepare(
    "UPDATE properties SET guide_content=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?"
  ).bind(content, c.req.param("id"), c.get("userId")).run();
  if (!result.meta.changes) return c.json({ error: "Property not found" }, 404);
  return c.json({ success: true });
});
app.post("/api/properties/:id/publish", async (c) => {
  const result = await c.env.DB.prepare(
    "UPDATE properties SET status='Published', updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?"
  ).bind(c.req.param("id"), c.get("userId")).run();
  if (!result.meta.changes) return c.json({ error: "Property not found" }, 404);
  return c.json({ success: true });
});
app.post("/api/properties/:id/unpublish", async (c) => {
  const result = await c.env.DB.prepare(
    "UPDATE properties SET status='Draft', updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?"
  ).bind(c.req.param("id"), c.get("userId")).run();
  if (!result.meta.changes) return c.json({ error: "Property not found" }, 404);
  return c.json({ success: true });
});
app.get("/api/public/guides/:slug", async (c) => {
  const property = await c.env.DB.prepare(
    "SELECT name, location, guests, guide_content FROM properties WHERE slug=? AND status='Published'"
  ).bind(c.req.param("slug")).first();
  if (!property) return c.json({ error: "Guide not found" }, 404);
  let guide: unknown = {};
  try { guide = JSON.parse(String(property.guide_content || "{}")); } catch { guide = {}; }
  return c.json({ property: { name: property.name, location: property.location, guests: property.guests }, guide });
});
app.notFound((c) => c.json({ error: "Not found" }, 404));
export default app;
