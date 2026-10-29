CREATE TABLE IF NOT EXISTS rfq_submissions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  country TEXT,
  part_name TEXT,
  process TEXT,
  material TEXT,
  annual_quantity TEXT,
  project_stage TEXT,
  quantity TEXT,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  internal_notes TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS rfq_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  key TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES rfq_submissions(id)
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  visitor_key TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS site_media (
  slot_key TEXT PRIMARY KEY,
  object_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rfq_security_events (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  client_key TEXT NOT NULL,
  email_hash TEXT,
  fingerprint TEXT,
  outcome TEXT NOT NULL,
  reason TEXT,
  submission_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics_events (path);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics_events (visitor_key);
CREATE INDEX IF NOT EXISTS idx_rfq_created_at ON rfq_submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_rfq_status ON rfq_submissions (status);
CREATE INDEX IF NOT EXISTS idx_rfq_security_client_time ON rfq_security_events (client_key, created_at);
CREATE INDEX IF NOT EXISTS idx_rfq_security_email_time ON rfq_security_events (email_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_rfq_security_fingerprint_time ON rfq_security_events (fingerprint, created_at);
