const express  = require("express");
const cors     = require("cors");
const path     = require("path");
const Database = require("better-sqlite3");
const { v4: uuidv4 } = require("uuid");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
require("dotenv").config();

const app    = express();
const PORT   = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || "brainfeed-dev-secret-change-in-production";

// ─── Database ─────────────────────────────────────────────────────────────────
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "brainfeed.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL DEFAULT '',
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS books (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    author        TEXT DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'finished',
    days          INTEGER,
    date_started  TEXT,
    date_finished TEXT,
    mood          TEXT DEFAULT '',
    summary       TEXT DEFAULT '',
    reflection    TEXT DEFAULT '',
    genre         TEXT DEFAULT '',
    rating        INTEGER DEFAULT 0,
    cover_url     TEXT DEFAULT '',
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS podcasts (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    show_name     TEXT NOT NULL,
    episode_title TEXT DEFAULT '',
    host          TEXT DEFAULT '',
    category      TEXT DEFAULT '',
    duration_mins INTEGER,
    date_listened TEXT,
    rating        INTEGER DEFAULT 0,
    notes         TEXT DEFAULT '',
    key_takeaways TEXT DEFAULT '',
    cover_url     TEXT DEFAULT '',
    tags          TEXT DEFAULT '[]',
    mood          TEXT DEFAULT '',
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS media (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    type            TEXT NOT NULL DEFAULT 'movie',
    genre           TEXT DEFAULT '',
    director        TEXT DEFAULT '',
    year            INTEGER,
    rating          INTEGER DEFAULT 0,
    date_watched    TEXT,
    rewatched       INTEGER DEFAULT 0,
    review          TEXT DEFAULT '',
    favourite_scene TEXT DEFAULT '',
    cover_url       TEXT DEFAULT '',
    mood            TEXT DEFAULT '',
    recommend       INTEGER DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key     TEXT NOT NULL,
    value   TEXT NOT NULL,
    PRIMARY KEY (user_id, key)
  );
`);

// Migrations for older single-user databases
const bookCols = db.pragma("table_info(books)").map(c => c.name);
if (!bookCols.includes("user_id"))    db.exec("ALTER TABLE books ADD COLUMN user_id TEXT");
if (!bookCols.includes("cover_url"))  db.exec("ALTER TABLE books ADD COLUMN cover_url TEXT DEFAULT ''");
if (!bookCols.includes("status"))     db.exec("ALTER TABLE books ADD COLUMN status TEXT DEFAULT 'finished'");
if (!bookCols.includes("date_started")) db.exec("ALTER TABLE books ADD COLUMN date_started TEXT");

const podCols = db.pragma("table_info(podcasts)").map(c => c.name);
if (!podCols.includes("user_id"))     db.exec("ALTER TABLE podcasts ADD COLUMN user_id TEXT");

const medCols = db.pragma("table_info(media)").map(c => c.name);
if (!medCols.includes("user_id"))     db.exec("ALTER TABLE media ADD COLUMN user_id TEXT");

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: "Session expired — please log in again" });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeSort = (val, allowed, def) => allowed.includes(val) ? val : def;

// ═══════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════════════
app.post("/api/auth/register", (req, res) => {
  try {
    const { name = "", email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: "Email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });

    const existing = db.prepare("SELECT id FROM users WHERE email=?").get(email.toLowerCase().trim());
    if (existing)
      return res.status(409).json({ success: false, error: "An account with this email already exists" });

    const id   = uuidv4();
    const hash = bcrypt.hashSync(password, 12);
    db.prepare("INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)")
      .run(id, name.trim(), email.toLowerCase().trim(), hash);

    const token = jwt.sign({ userId: id, email: email.toLowerCase().trim() }, SECRET, { expiresIn: "30d" });
    res.status(201).json({ success: true, data: { token, user: { id, name: name.trim(), email } } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: "Email and password are required" });

    const user = db.prepare("SELECT * FROM users WHERE email=?").get(email.toLowerCase().trim());
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ success: false, error: "Invalid email or password" });

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, { expiresIn: "30d" });
    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email } } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  try {
    const user = db.prepare("SELECT id,name,email,created_at FROM users WHERE id=?").get(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════
//  BOOKS
// ═══════════════════════════════════════════════════════════════
app.get("/api/books", requireAuth, (req, res) => {
  try {
    const { year, mood, genre, status } = req.query;
    const { sort = "created_at", order = "DESC" } = req.query;
    let q = "SELECT * FROM books WHERE user_id=?";
    const p = [req.user.userId];
    if (year)   { q += " AND (strftime('%Y',date_finished)=? OR strftime('%Y',date_started)=?)"; p.push(year, year); }
    if (mood)   { q += " AND mood=?";   p.push(mood); }
    if (genre)  { q += " AND genre=?";  p.push(genre); }
    if (status) { q += " AND status=?"; p.push(status); }
    q += ` ORDER BY ${safeSort(sort, ["title","days","rating","date_finished","date_started","created_at"], "created_at")} ${order === "ASC" ? "ASC" : "DESC"}`;
    res.json({ success: true, data: db.prepare(q).all(...p) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get("/api/books/:id", requireAuth, (req, res) => {
  try {
    const b = db.prepare("SELECT * FROM books WHERE id=? AND user_id=?").get(req.params.id, req.user.userId);
    if (!b) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: b });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post("/api/books", requireAuth, (req, res) => {
  try {
    const { title, author="", status="finished", days, date_started, date_finished,
            mood="", summary="", reflection="", genre="", rating=0, cover_url="" } = req.body;
    if (!title) return res.status(400).json({ success: false, error: "Title is required" });
    if (status === "finished" && (!days || days < 1))
      return res.status(400).json({ success: false, error: "Days required for finished books" });

    const id  = uuidv4();
    const now = new Date().toISOString().split("T")[0];
    db.prepare(`INSERT INTO books (id,user_id,title,author,status,days,date_started,date_finished,mood,summary,reflection,genre,rating,cover_url)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, req.user.userId, title, author, status,
      days || null,
      date_started || (status === "reading" ? now : null),
      status === "finished" ? (date_finished || now) : null,
      mood, summary, reflection, genre, Number(rating), cover_url
    );
    res.status(201).json({ success: true, data: db.prepare("SELECT * FROM books WHERE id=?").get(id) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.put("/api/books/:id", requireAuth, (req, res) => {
  try {
    const b = db.prepare("SELECT * FROM books WHERE id=? AND user_id=?").get(req.params.id, req.user.userId);
    if (!b) return res.status(404).json({ success: false, error: "Not found" });
    const f = req.body;
    db.prepare(`UPDATE books SET title=?,author=?,status=?,days=?,date_started=?,date_finished=?,
      mood=?,summary=?,reflection=?,genre=?,rating=?,cover_url=? WHERE id=? AND user_id=?`).run(
      f.title??b.title, f.author??b.author, f.status??b.status,
      f.days??b.days, f.date_started??b.date_started, f.date_finished??b.date_finished,
      f.mood??b.mood, f.summary??b.summary, f.reflection??b.reflection,
      f.genre??b.genre, f.rating!=null ? Number(f.rating) : b.rating,
      f.cover_url??b.cover_url, req.params.id, req.user.userId
    );
    res.json({ success: true, data: db.prepare("SELECT * FROM books WHERE id=?").get(req.params.id) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete("/api/books/:id", requireAuth, (req, res) => {
  try {
    const r = db.prepare("DELETE FROM books WHERE id=? AND user_id=?").run(req.params.id, req.user.userId);
    if (!r.changes) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════
//  PODCASTS
// ═══════════════════════════════════════════════════════════════
app.get("/api/podcasts", requireAuth, (req, res) => {
  try {
    const { category, mood, sort = "created_at", order = "DESC" } = req.query;
    let q = "SELECT * FROM podcasts WHERE user_id=?";
    const p = [req.user.userId];
    if (category) { q += " AND category=?"; p.push(category); }
    if (mood)     { q += " AND mood=?";     p.push(mood); }
    q += ` ORDER BY ${safeSort(sort, ["show_name","rating","date_listened","duration_mins","created_at"], "created_at")} ${order === "ASC" ? "ASC" : "DESC"}`;
    res.json({ success: true, data: db.prepare(q).all(...p) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get("/api/podcasts/:id", requireAuth, (req, res) => {
  try {
    const p = db.prepare("SELECT * FROM podcasts WHERE id=? AND user_id=?").get(req.params.id, req.user.userId);
    if (!p) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: p });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post("/api/podcasts", requireAuth, (req, res) => {
  try {
    const { show_name, episode_title="", host="", category="", duration_mins,
            date_listened, rating=0, notes="", key_takeaways="", cover_url="", tags="[]", mood="" } = req.body;
    if (!show_name) return res.status(400).json({ success: false, error: "Show name is required" });
    const id  = uuidv4();
    const now = new Date().toISOString().split("T")[0];
    db.prepare(`INSERT INTO podcasts (id,user_id,show_name,episode_title,host,category,duration_mins,date_listened,rating,notes,key_takeaways,cover_url,tags,mood)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, req.user.userId, show_name, episode_title, host, category,
      duration_mins || null, date_listened || now, Number(rating),
      notes, key_takeaways, cover_url,
      typeof tags === "string" ? tags : JSON.stringify(tags), mood
    );
    res.status(201).json({ success: true, data: db.prepare("SELECT * FROM podcasts WHERE id=?").get(id) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.put("/api/podcasts/:id", requireAuth, (req, res) => {
  try {
    const p = db.prepare("SELECT * FROM podcasts WHERE id=? AND user_id=?").get(req.params.id, req.user.userId);
    if (!p) return res.status(404).json({ success: false, error: "Not found" });
    const f = req.body;
    db.prepare(`UPDATE podcasts SET show_name=?,episode_title=?,host=?,category=?,duration_mins=?,
      date_listened=?,rating=?,notes=?,key_takeaways=?,cover_url=?,tags=?,mood=? WHERE id=? AND user_id=?`).run(
      f.show_name??p.show_name, f.episode_title??p.episode_title, f.host??p.host,
      f.category??p.category, f.duration_mins??p.duration_mins, f.date_listened??p.date_listened,
      f.rating != null ? Number(f.rating) : p.rating, f.notes??p.notes,
      f.key_takeaways??p.key_takeaways, f.cover_url??p.cover_url,
      f.tags != null ? (typeof f.tags === "string" ? f.tags : JSON.stringify(f.tags)) : p.tags,
      f.mood??p.mood, req.params.id, req.user.userId
    );
    res.json({ success: true, data: db.prepare("SELECT * FROM podcasts WHERE id=?").get(req.params.id) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete("/api/podcasts/:id", requireAuth, (req, res) => {
  try {
    const r = db.prepare("DELETE FROM podcasts WHERE id=? AND user_id=?").run(req.params.id, req.user.userId);
    if (!r.changes) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════
//  MEDIA
// ═══════════════════════════════════════════════════════════════
app.get("/api/media", requireAuth, (req, res) => {
  try {
    const { type, genre, mood, sort = "created_at", order = "DESC" } = req.query;
    let q = "SELECT * FROM media WHERE user_id=?";
    const p = [req.user.userId];
    if (type)  { q += " AND type=?";  p.push(type); }
    if (genre) { q += " AND genre=?"; p.push(genre); }
    if (mood)  { q += " AND mood=?";  p.push(mood); }
    q += ` ORDER BY ${safeSort(sort, ["title","rating","date_watched","year","created_at"], "created_at")} ${order === "ASC" ? "ASC" : "DESC"}`;
    res.json({ success: true, data: db.prepare(q).all(...p) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get("/api/media/:id", requireAuth, (req, res) => {
  try {
    const m = db.prepare("SELECT * FROM media WHERE id=? AND user_id=?").get(req.params.id, req.user.userId);
    if (!m) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: m });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post("/api/media", requireAuth, (req, res) => {
  try {
    const { title, type="movie", genre="", director="", year, rating=0,
            date_watched, rewatched=false, review="", favourite_scene="",
            cover_url="", mood="", recommend=true } = req.body;
    if (!title) return res.status(400).json({ success: false, error: "Title is required" });
    const id  = uuidv4();
    const now = new Date().toISOString().split("T")[0];
    db.prepare(`INSERT INTO media (id,user_id,title,type,genre,director,year,rating,date_watched,rewatched,review,favourite_scene,cover_url,mood,recommend)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, req.user.userId, title, type, genre, director,
      year || null, Number(rating), date_watched || now,
      rewatched ? 1 : 0, review, favourite_scene, cover_url, mood, recommend ? 1 : 0
    );
    res.status(201).json({ success: true, data: db.prepare("SELECT * FROM media WHERE id=?").get(id) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.put("/api/media/:id", requireAuth, (req, res) => {
  try {
    const m = db.prepare("SELECT * FROM media WHERE id=? AND user_id=?").get(req.params.id, req.user.userId);
    if (!m) return res.status(404).json({ success: false, error: "Not found" });
    const f = req.body;
    db.prepare(`UPDATE media SET title=?,type=?,genre=?,director=?,year=?,rating=?,date_watched=?,
      rewatched=?,review=?,favourite_scene=?,cover_url=?,mood=?,recommend=? WHERE id=? AND user_id=?`).run(
      f.title??m.title, f.type??m.type, f.genre??m.genre, f.director??m.director,
      f.year != null ? f.year : m.year,
      f.rating != null ? Number(f.rating) : m.rating,
      f.date_watched??m.date_watched,
      f.rewatched != null ? (f.rewatched ? 1 : 0) : m.rewatched,
      f.review??m.review, f.favourite_scene??m.favourite_scene,
      f.cover_url??m.cover_url, f.mood??m.mood,
      f.recommend != null ? (f.recommend ? 1 : 0) : m.recommend,
      req.params.id, req.user.userId
    );
    res.json({ success: true, data: db.prepare("SELECT * FROM media WHERE id=?").get(req.params.id) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete("/api/media/:id", requireAuth, (req, res) => {
  try {
    const r = db.prepare("DELETE FROM media WHERE id=? AND user_id=?").run(req.params.id, req.user.userId);
    if (!r.changes) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════
//  STATS
// ═══════════════════════════════════════════════════════════════
app.get("/api/stats", requireAuth, (req, res) => {
  try {
    const uid  = req.user.userId;
    const year = String(req.query.year || new Date().getFullYear());

    const totalBooks    = db.prepare("SELECT COUNT(*) c FROM books WHERE user_id=? AND status='finished' AND strftime('%Y',date_finished)=?").get(uid, year).c;
    const totalReading  = db.prepare("SELECT COUNT(*) c FROM books WHERE user_id=? AND status='reading'").get(uid).c;
    const totalPodcasts = db.prepare("SELECT COUNT(*) c FROM podcasts WHERE user_id=? AND strftime('%Y',COALESCE(date_listened,created_at))=?").get(uid, year).c;
    const totalMedia    = db.prepare("SELECT COUNT(*) c FROM media WHERE user_id=? AND strftime('%Y',COALESCE(date_watched,created_at))=?").get(uid, year).c;
    const avgDays       = db.prepare("SELECT AVG(days) a FROM books WHERE user_id=? AND status='finished' AND strftime('%Y',date_finished)=?").get(uid, year).a;
    const totalDays     = db.prepare("SELECT SUM(days) s FROM books WHERE user_id=? AND status='finished' AND strftime('%Y',date_finished)=?").get(uid, year).s;
    const fastestBook   = db.prepare("SELECT * FROM books WHERE user_id=? AND status='finished' AND strftime('%Y',date_finished)=? ORDER BY days ASC  LIMIT 1").get(uid, year);
    const longestBook   = db.prepare("SELECT * FROM books WHERE user_id=? AND status='finished' AND strftime('%Y',date_finished)=? ORDER BY days DESC LIMIT 1").get(uid, year);

    const byMonth = db.prepare("SELECT strftime('%m',date_finished) month, COUNT(*) count FROM books WHERE user_id=? AND status='finished' AND strftime('%Y',date_finished)=? GROUP BY month ORDER BY month").all(uid, year);
    const byMood  = db.prepare("SELECT mood, COUNT(*) count FROM books WHERE user_id=? AND status='finished' AND strftime('%Y',date_finished)=? AND mood!='' GROUP BY mood ORDER BY count DESC").all(uid, year);
    const byGenre = db.prepare("SELECT genre, COUNT(*) count FROM books WHERE user_id=? AND genre!='' GROUP BY genre ORDER BY count DESC").all(uid);
    const currentlyReading = db.prepare("SELECT * FROM books WHERE user_id=? AND status='reading' ORDER BY created_at DESC").all(uid);

    const recentBooks = db.prepare("SELECT id,'book' type,title,cover_url,date_finished date FROM books WHERE user_id=? AND status='finished' ORDER BY date_finished DESC LIMIT 4").all(uid);
    const recentPods  = db.prepare("SELECT id,'podcast' type,show_name title,cover_url,date_listened date FROM podcasts WHERE user_id=? ORDER BY date_listened DESC LIMIT 2").all(uid);
    const recentMedia = db.prepare("SELECT id,'media' type,title,cover_url,date_watched date FROM media WHERE user_id=? ORDER BY date_watched DESC LIMIT 2").all(uid);
    const recentActivity = [...recentBooks, ...recentPods, ...recentMedia]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 8);

    res.json({ success: true, data: {
      totalBooks, totalReading, totalPodcasts, totalMedia,
      avgDays: Math.round(avgDays) || 0, totalDays: totalDays || 0,
      byMonth, byMood, byGenre, fastestBook, longestBook,
      currentlyReading, recentActivity,
    }});
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════
//  SETTINGS (per-user)
// ═══════════════════════════════════════════════════════════════
app.get("/api/settings", requireAuth, (req, res) => {
  try {
    const rows = db.prepare("SELECT key,value FROM settings WHERE user_id=?").all(req.user.userId);
    res.json({ success: true, data: Object.fromEntries(rows.map(r => [r.key, r.value])) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.put("/api/settings", requireAuth, (req, res) => {
  try {
    const upsert = db.prepare("INSERT INTO settings(user_id,key,value) VALUES(?,?,?) ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value");
    db.transaction(entries => { for (const [k, v] of entries) upsert.run(req.user.userId, k, String(v)); })(Object.entries(req.body));
    const rows = db.prepare("SELECT key,value FROM settings WHERE user_id=?").all(req.user.userId);
    res.json({ success: true, data: Object.fromEntries(rows.map(r => [r.key, r.value])) });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../client/dist/index.html")));
}

app.listen(PORT, () => console.log(`🧠 Brainfeed server → http://localhost:${PORT}`));
