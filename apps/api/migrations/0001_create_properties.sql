CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  location TEXT NOT NULL CHECK (length(location) BETWEEN 1 AND 180),
  guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 1000),
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
  accent TEXT NOT NULL DEFAULT 'blue' CHECK (accent IN ('terracotta', 'sage', 'blue')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_properties_user_created
ON properties(user_id, created_at DESC);
