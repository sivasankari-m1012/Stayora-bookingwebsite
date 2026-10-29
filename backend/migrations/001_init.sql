-- Baseline schema. IF NOT EXISTS keeps it safe on databases created by the v1 backend.
CREATE TABLE IF NOT EXISTS listing (
  id   INTEGER PRIMARY KEY CHECK (id = 1),   -- single-listing demo; drop the CHECK to go multi-listing
  data TEXT NOT NULL                          -- JSON: title, host, about, rules, pricing config...
);

CREATE TABLE IF NOT EXISTS rooms (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
  id         TEXT PRIMARY KEY,
  room_id    TEXT NOT NULL REFERENCES rooms(id),
  url        TEXT NOT NULL,
  position   INTEGER NOT NULL UNIQUE,         -- 1-based global order
  room_index INTEGER NOT NULL,
  is_hero    INTEGER NOT NULL DEFAULT 0,
  hero_order INTEGER
);

CREATE TABLE IF NOT EXISTS amenities (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  icon     TEXT NOT NULL,
  label    TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  off      INTEGER NOT NULL DEFAULT 0,
  sort     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id      INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  tone    TEXT,
  avatar  TEXT,
  tenure  TEXT,
  ago     TEXT,
  text    TEXT NOT NULL,
  sort    INTEGER NOT NULL                     -- 0 = newest
);

CREATE TABLE IF NOT EXISTS review_stats (
  id   INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL                           -- JSON: rating, total, distribution, categories, topics
);

CREATE TABLE IF NOT EXISTS nearby (
  id     INTEGER PRIMARY KEY,
  title  TEXT NOT NULL,
  price  INTEGER NOT NULL,
  rating TEXT NOT NULL,
  image  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blocked_dates (     -- host-blocked nights (maintenance, own use)
  date TEXT PRIMARY KEY                        -- YYYY-MM-DD, the night of that date is unavailable
);

CREATE TABLE IF NOT EXISTS bookings (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  reference       TEXT NOT NULL UNIQUE,
  idempotency_key TEXT UNIQUE,
  check_in        TEXT NOT NULL,
  check_out       TEXT NOT NULL,
  nights          INTEGER NOT NULL,
  adults          INTEGER NOT NULL,
  children        INTEGER NOT NULL DEFAULT 0,
  infants         INTEGER NOT NULL DEFAULT 0,
  pets            INTEGER NOT NULL DEFAULT 0,
  nightly_rate    REAL NOT NULL,               -- snapshot, so later price changes don't rewrite history
  total           INTEGER NOT NULL,
  guest_name      TEXT NOT NULL,
  guest_email     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  created_at      TEXT NOT NULL,
  cancelled_at    TEXT,
  CHECK (check_out > check_in)
);
CREATE INDEX IF NOT EXISTS idx_bookings_range ON bookings (status, check_in, check_out);
