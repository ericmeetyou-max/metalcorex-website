CREATE TABLE IF NOT EXISTS rfq_submissions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  country TEXT,
  process TEXT,
  material TEXT,
  quantity TEXT,
  details TEXT
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
