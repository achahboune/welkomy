PRAGMA foreign_keys = ON;

CREATE TABLE tenants (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));

CREATE TABLE users (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, email TEXT NOT NULL COLLATE NOCASE,
  display_name TEXT, role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE (tenant_id, email),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE properties (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL,
  address TEXT, city TEXT, country TEXT, max_guests INTEGER NOT NULL DEFAULT 1 CHECK (max_guests > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, slug), FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE guides (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, property_id TEXT NOT NULL UNIQUE,
  default_language TEXT NOT NULL DEFAULT 'en' CHECK (default_language IN ('en', 'fr', 'ar')),
  published_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE guide_sections (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, guide_id TEXT NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('welcome', 'wifi', 'checkin', 'checkout', 'access', 'emergency', 'recommendations', 'custom')),
  language TEXT NOT NULL CHECK (language IN ('en', 'fr', 'ar')), title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '{}', sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_properties_tenant ON properties(tenant_id);
CREATE INDEX idx_guides_tenant ON guides(tenant_id);
CREATE INDEX idx_sections_guide_language ON guide_sections(guide_id, language, sort_order);