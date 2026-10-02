CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  profile TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  image TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK(price >= 0),
  vehicles TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  destaque INTEGER NOT NULL DEFAULT 0 CHECK(destaque IN (0, 1)),
  admin_id TEXT NOT NULL REFERENCES admins(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  reply TEXT,
  admin_id TEXT REFERENCES admins(id),
  replied_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  admin_id TEXT REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  CHECK ((client_id IS NOT NULL AND admin_id IS NULL) OR (client_id IS NULL AND admin_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS interactions_client_idx ON interactions(client_id);
CREATE INDEX IF NOT EXISTS interactions_product_idx ON interactions(product_id);
CREATE INDEX IF NOT EXISTS products_admin_idx ON products(admin_id);
CREATE INDEX IF NOT EXISTS interactions_admin_idx ON interactions(admin_id);
CREATE INDEX IF NOT EXISTS sessions_client_idx ON sessions(client_id);
CREATE INDEX IF NOT EXISTS sessions_admin_idx ON sessions(admin_id);
