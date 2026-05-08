const express = require("express");
const cors    = require("cors");
const path    = require("path");
const Database = require("better-sqlite3");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── DB ───────────────────────────────────────────────────────────────────────
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "shelf.db");
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id            TEXT PRIMARY KEY,
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
    id             TEXT PRIMARY KEY,
    title          TEXT NOT NULL,
    type           TEXT NOT NULL DEFAULT 'movie',
    genre          TEXT DEFAULT '',
    director       TEXT DEFAULT '',
    year           INTEGER,
    rating         INTEGER DEFAULT 0,
    date_watched   TEXT,
    rewatched      INTEGER DEFAULT 0,
    review         TEXT DEFAULT '',
    favourite_scene TEXT DEFAULT '',
    cover_url      TEXT DEFAULT '',
    mood           TEXT DEFAULT '',
    recommend      INTEGER DEFAULT 1,
    created_at     TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Migrations for existing DBs
const bookCols = db.pragma("table_info(books)").map(c => c.name);
if (!bookCols.includes("status"))    db.exec("ALTER TABLE books ADD COLUMN status TEXT NOT NULL DEFAULT 'finished'");
if (!bookCols.includes("date_started")) db.exec("ALTER TABLE books ADD COLUMN date_started TEXT");
if (!bookCols.includes("cover_url")) db.exec("ALTER TABLE books ADD COLUMN cover_url TEXT DEFAULT ''");

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function paginate(req) {
  const sort  = req.query.sort  || "created_at";
  const order = req.query.order === "ASC" ? "ASC" : "DESC";
  return { sort, order };
}

// ═══════════════════════════════════════════════════════════════
//  BOOKS
// ═══════════════════════════════════════════════════════════════
app.get("/api/books", (req, res) => {
  try {
    const { year, mood, genre, status } = req.query;
    const { sort, order } = paginate(req);
    let q = "SELECT * FROM books WHERE 1=1";
    const p = [];
    if (year)   { q += " AND (strftime('%Y',date_finished)=? OR strftime('%Y',date_started)=? OR strftime('%Y',created_at)=?)"; p.push(year,year,year); }
    if (mood)   { q += " AND mood=?";   p.push(mood); }
    if (genre)  { q += " AND genre=?";  p.push(genre); }
    if (status) { q += " AND status=?"; p.push(status); }
    const safe = ["title","days","rating","date_finished","date_started","created_at"].includes(sort) ? sort : "created_at";
    q += ` ORDER BY ${safe} ${order}`;
    res.json({ success:true, data: db.prepare(q).all(...p) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.get("/api/books/:id", (req, res) => {
  try {
    const b = db.prepare("SELECT * FROM books WHERE id=?").get(req.params.id);
    if (!b) return res.status(404).json({ success:false, error:"Not found" });
    res.json({ success:true, data:b });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.post("/api/books", (req, res) => {
  try {
    const { title, author="", status="finished", days, date_started, date_finished,
            mood="", summary="", reflection="", genre="", rating=0, cover_url="" } = req.body;
    if (!title) return res.status(400).json({ success:false, error:"Title required" });
    if (status==="finished" && (!days||days<1)) return res.status(400).json({ success:false, error:"Days required for finished books" });
    const id  = uuidv4();
    const now = new Date().toISOString().split("T")[0];
    db.prepare(`INSERT INTO books (id,title,author,status,days,date_started,date_finished,mood,summary,reflection,genre,rating,cover_url)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, title, author, status, days||null,
      date_started||(status==="reading"?now:null),
      status==="finished"?(date_finished||now):null,
      mood, summary, reflection, genre, Number(rating), cover_url
    );
    res.status(201).json({ success:true, data: db.prepare("SELECT * FROM books WHERE id=?").get(id) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.put("/api/books/:id", (req, res) => {
  try {
    const b = db.prepare("SELECT * FROM books WHERE id=?").get(req.params.id);
    if (!b) return res.status(404).json({ success:false, error:"Not found" });
    const f = req.body;
    db.prepare(`UPDATE books SET title=?,author=?,status=?,days=?,date_started=?,date_finished=?,
      mood=?,summary=?,reflection=?,genre=?,rating=?,cover_url=? WHERE id=?`).run(
      f.title??b.title, f.author??b.author, f.status??b.status, f.days??b.days,
      f.date_started??b.date_started, f.date_finished??b.date_finished,
      f.mood??b.mood, f.summary??b.summary, f.reflection??b.reflection,
      f.genre??b.genre, f.rating!=null?Number(f.rating):b.rating,
      f.cover_url??b.cover_url, req.params.id
    );
    res.json({ success:true, data: db.prepare("SELECT * FROM books WHERE id=?").get(req.params.id) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.delete("/api/books/:id", (req, res) => {
  try {
    const r = db.prepare("DELETE FROM books WHERE id=?").run(req.params.id);
    if (!r.changes) return res.status(404).json({ success:false, error:"Not found" });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
//  PODCASTS
// ═══════════════════════════════════════════════════════════════
app.get("/api/podcasts", (req, res) => {
  try {
    const { category, mood } = req.query;
    const { sort, order } = paginate(req);
    let q = "SELECT * FROM podcasts WHERE 1=1";
    const p = [];
    if (category) { q += " AND category=?"; p.push(category); }
    if (mood)     { q += " AND mood=?";     p.push(mood); }
    const safe = ["show_name","rating","date_listened","duration_mins","created_at"].includes(sort) ? sort : "created_at";
    q += ` ORDER BY ${safe} ${order}`;
    res.json({ success:true, data: db.prepare(q).all(...p) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.get("/api/podcasts/:id", (req, res) => {
  try {
    const p = db.prepare("SELECT * FROM podcasts WHERE id=?").get(req.params.id);
    if (!p) return res.status(404).json({ success:false, error:"Not found" });
    res.json({ success:true, data:p });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.post("/api/podcasts", (req, res) => {
  try {
    const { show_name, episode_title="", host="", category="", duration_mins,
            date_listened, rating=0, notes="", key_takeaways="", cover_url="", tags="[]", mood="" } = req.body;
    if (!show_name) return res.status(400).json({ success:false, error:"Show name required" });
    const id  = uuidv4();
    const now = new Date().toISOString().split("T")[0];
    db.prepare(`INSERT INTO podcasts (id,show_name,episode_title,host,category,duration_mins,date_listened,rating,notes,key_takeaways,cover_url,tags,mood)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, show_name, episode_title, host, category, duration_mins||null,
      date_listened||now, Number(rating), notes, key_takeaways, cover_url,
      typeof tags==="string"?tags:JSON.stringify(tags), mood
    );
    res.status(201).json({ success:true, data: db.prepare("SELECT * FROM podcasts WHERE id=?").get(id) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.put("/api/podcasts/:id", (req, res) => {
  try {
    const p = db.prepare("SELECT * FROM podcasts WHERE id=?").get(req.params.id);
    if (!p) return res.status(404).json({ success:false, error:"Not found" });
    const f = req.body;
    db.prepare(`UPDATE podcasts SET show_name=?,episode_title=?,host=?,category=?,duration_mins=?,
      date_listened=?,rating=?,notes=?,key_takeaways=?,cover_url=?,tags=?,mood=? WHERE id=?`).run(
      f.show_name??p.show_name, f.episode_title??p.episode_title, f.host??p.host,
      f.category??p.category, f.duration_mins??p.duration_mins, f.date_listened??p.date_listened,
      f.rating!=null?Number(f.rating):p.rating, f.notes??p.notes, f.key_takeaways??p.key_takeaways,
      f.cover_url??p.cover_url, f.tags!=null?(typeof f.tags==="string"?f.tags:JSON.stringify(f.tags)):p.tags,
      f.mood??p.mood, req.params.id
    );
    res.json({ success:true, data: db.prepare("SELECT * FROM podcasts WHERE id=?").get(req.params.id) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.delete("/api/podcasts/:id", (req, res) => {
  try {
    const r = db.prepare("DELETE FROM podcasts WHERE id=?").run(req.params.id);
    if (!r.changes) return res.status(404).json({ success:false, error:"Not found" });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
//  MEDIA (movies / series / documentary / anime)
// ═══════════════════════════════════════════════════════════════
app.get("/api/media", (req, res) => {
  try {
    const { type, genre, mood } = req.query;
    const { sort, order } = paginate(req);
    let q = "SELECT * FROM media WHERE 1=1";
    const p = [];
    if (type)  { q += " AND type=?";  p.push(type); }
    if (genre) { q += " AND genre=?"; p.push(genre); }
    if (mood)  { q += " AND mood=?";  p.push(mood); }
    const safe = ["title","rating","date_watched","year","created_at"].includes(sort) ? sort : "created_at";
    q += ` ORDER BY ${safe} ${order}`;
    res.json({ success:true, data: db.prepare(q).all(...p) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.get("/api/media/:id", (req, res) => {
  try {
    const m = db.prepare("SELECT * FROM media WHERE id=?").get(req.params.id);
    if (!m) return res.status(404).json({ success:false, error:"Not found" });
    res.json({ success:true, data:m });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.post("/api/media", (req, res) => {
  try {
    const { title, type="movie", genre="", director="", year, rating=0, date_watched,
            rewatched=false, review="", favourite_scene="", cover_url="", mood="", recommend=true } = req.body;
    if (!title) return res.status(400).json({ success:false, error:"Title required" });
    const id  = uuidv4();
    const now = new Date().toISOString().split("T")[0];
    db.prepare(`INSERT INTO media (id,title,type,genre,director,year,rating,date_watched,rewatched,review,favourite_scene,cover_url,mood,recommend)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, title, type, genre, director, year||null, Number(rating),
      date_watched||now, rewatched?1:0, review, favourite_scene, cover_url, mood, recommend?1:0
    );
    res.status(201).json({ success:true, data: db.prepare("SELECT * FROM media WHERE id=?").get(id) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.put("/api/media/:id", (req, res) => {
  try {
    const m = db.prepare("SELECT * FROM media WHERE id=?").get(req.params.id);
    if (!m) return res.status(404).json({ success:false, error:"Not found" });
    const f = req.body;
    db.prepare(`UPDATE media SET title=?,type=?,genre=?,director=?,year=?,rating=?,date_watched=?,
      rewatched=?,review=?,favourite_scene=?,cover_url=?,mood=?,recommend=? WHERE id=?`).run(
      f.title??m.title, f.type??m.type, f.genre??m.genre, f.director??m.director,
      f.year!=null?f.year:m.year, f.rating!=null?Number(f.rating):m.rating,
      f.date_watched??m.date_watched, f.rewatched!=null?(f.rewatched?1:0):m.rewatched,
      f.review??m.review, f.favourite_scene??m.favourite_scene, f.cover_url??m.cover_url,
      f.mood??m.mood, f.recommend!=null?(f.recommend?1:0):m.recommend, req.params.id
    );
    res.json({ success:true, data: db.prepare("SELECT * FROM media WHERE id=?").get(req.params.id) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.delete("/api/media/:id", (req, res) => {
  try {
    const r = db.prepare("DELETE FROM media WHERE id=?").run(req.params.id);
    if (!r.changes) return res.status(404).json({ success:false, error:"Not found" });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
//  STATS (unified)
// ═══════════════════════════════════════════════════════════════
app.get("/api/stats", (req, res) => {
  try {
    const year = String(req.query.year || new Date().getFullYear());

    const totalBooks   = db.prepare("SELECT COUNT(*) c FROM books WHERE status='finished' AND strftime('%Y',date_finished)=?").get(year).c;
    const totalReading = db.prepare("SELECT COUNT(*) c FROM books WHERE status='reading'").get().c;
    const totalPodcasts = db.prepare("SELECT COUNT(*) c FROM podcasts WHERE strftime('%Y',date_listened)=? OR strftime('%Y',created_at)=?").get(year,year).c;
    const totalMedia   = db.prepare("SELECT COUNT(*) c FROM media WHERE strftime('%Y',date_watched)=? OR strftime('%Y',created_at)=?").get(year,year).c;
    const avgDays      = db.prepare("SELECT AVG(days) a FROM books WHERE status='finished' AND strftime('%Y',date_finished)=?").get(year).a;
    const totalDays    = db.prepare("SELECT SUM(days) s FROM books WHERE status='finished' AND strftime('%Y',date_finished)=?").get(year).s;
    const fastestBook  = db.prepare("SELECT * FROM books WHERE status='finished' AND strftime('%Y',date_finished)=? ORDER BY days ASC  LIMIT 1").get(year);
    const longestBook  = db.prepare("SELECT * FROM books WHERE status='finished' AND strftime('%Y',date_finished)=? ORDER BY days DESC LIMIT 1").get(year);

    const byMonth = db.prepare("SELECT strftime('%m',date_finished) month, COUNT(*) count FROM books WHERE status='finished' AND strftime('%Y',date_finished)=? GROUP BY month ORDER BY month").all(year);
    const byMood  = db.prepare("SELECT mood, COUNT(*) count FROM books WHERE status='finished' AND strftime('%Y',date_finished)=? GROUP BY mood ORDER BY count DESC").all(year);
    const byGenre = db.prepare("SELECT genre, COUNT(*) count FROM books WHERE strftime('%Y',COALESCE(date_finished,date_started,created_at))=? AND genre!='' GROUP BY genre ORDER BY count DESC").all(year);

    const currentlyReading = db.prepare("SELECT * FROM books WHERE status='reading' ORDER BY created_at DESC").all();

    // Recent activity across all types (last 8 items)
    const recentBooks = db.prepare("SELECT id,'book' type,title,cover_url,date_finished date FROM books WHERE status='finished' ORDER BY date_finished DESC LIMIT 4").all();
    const recentPods  = db.prepare("SELECT id,'podcast' type,show_name title,cover_url,date_listened date FROM podcasts ORDER BY date_listened DESC LIMIT 2").all();
    const recentMedia = db.prepare("SELECT id,'media' type,title,cover_url,date_watched date FROM media ORDER BY date_watched DESC LIMIT 2").all();
    const recentActivity = [...recentBooks, ...recentPods, ...recentMedia]
      .sort((a,b) => new Date(b.date||0) - new Date(a.date||0)).slice(0, 8)
      .map(x => ({ ...x, date: x.date ? x.date.split("T")[0] : "" }));

    res.json({ success:true, data: {
      totalBooks, totalReading, totalPodcasts, totalMedia,
      avgDays: Math.round(avgDays)||0, totalDays: totalDays||0,
      byMonth, byMood, byGenre, fastestBook, longestBook,
      currentlyReading, recentActivity,
    }});
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════════
app.get("/api/settings", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM settings").all();
    res.json({ success:true, data: Object.fromEntries(rows.map(r=>[r.key,r.value])) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

app.put("/api/settings", (req, res) => {
  try {
    const upsert = db.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
    db.transaction(entries => { for(const [k,v] of entries) upsert.run(k,String(v)); })(Object.entries(req.body));
    const rows = db.prepare("SELECT * FROM settings").all();
    res.json({ success:true, data: Object.fromEntries(rows.map(r=>[r.key,r.value])) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../client/dist/index.html")));
}

app.listen(PORT, () => console.log(`📚 Shelf server → http://localhost:${PORT}`));
