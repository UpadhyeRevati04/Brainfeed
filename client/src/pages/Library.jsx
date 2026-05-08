import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search, SlidersHorizontal, Trash2, Eye } from "lucide-react";
import { useBooks } from "../hooks/useData.js";
import { Card, PageHeader, Button, Spinner, EmptyState, Badge, StarRating, Modal, CoverImage } from "../components/UI.jsx";
import { MOODS, GENRES, SPINE_COLORS } from "../utils/constants.js";

function fmtDate(d) {
  if (!d) return "";
  const [y,m,day] = d.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${parseInt(day)}, ${y}`;
}

export default function Library() {
  const { items, loading, remove } = useBooks({ sort:"created_at", order:"DESC" });
  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sort, setSort] = useState("created_at");
  const [delTarget, setDelTarget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const sorted = [...items].sort((a,b) => {
    if (sort==="title") return a.title.localeCompare(b.title);
    if (sort==="days")  return (b.days||0)-(a.days||0);
    if (sort==="rating") return (b.rating||0)-(a.rating||0);
    return new Date(b.date_finished||b.created_at) - new Date(a.date_finished||a.created_at);
  });

  const filtered = sorted.filter(b => {
    const q = search.toLowerCase();
    return (!q || b.title?.toLowerCase().includes(q) || (b.author||"").toLowerCase().includes(q))
      && (!filterMood || b.mood===filterMood)
      && (!filterGenre || b.genre===filterGenre)
      && (!filterStatus || b.status===filterStatus);
  });

  const currentlyReading = items.filter(b=>b.status==="reading");

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow={`${items.length} book${items.length!==1?"s":""} logged`}
        title="My Library" subtitle="Every book you've read or are reading"
        action={<Link to="/add-book"><Button><PlusCircle size={16}/> Log a Book</Button></Link>}
      />

      {/* Currently reading shelf */}
      {currentlyReading.length > 0 && (
        <div style={{ marginBottom:"28px" }}>
          <p style={{ fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase", color:"var(--sage)", fontWeight:600, marginBottom:"12px" }}>📖 Currently Reading</p>
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
            {currentlyReading.map(b => {
              const spineColor = SPINE_COLORS[Math.abs((b.id||"").charCodeAt(0)) % SPINE_COLORS.length];
              return (
                <Link key={b.id} to={`/books/${b.id}`}>
                  <Card hover style={{ display:"flex", gap:"12px", alignItems:"center", padding:"14px 18px", border:`1.5px solid ${spineColor}40` }}>
                    <CoverImage src={b.cover_url} alt={b.title} width={40} height={55} radius={6} accentColor={spineColor} />
                    <div>
                      <p style={{ fontFamily:"'Lora',serif", fontSize:"0.9rem", fontWeight:600, maxWidth:"160px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.title}</p>
                      {b.author && <p style={{ fontSize:"11px", color:"var(--muted)" }}>{b.author}</p>}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & filter bar */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"16px", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:"200px" }}>
          <Search size={16} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--muted)" }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or author…"
            style={{ width:"100%", padding:"10px 12px 10px 36px", border:"1px solid var(--border)", borderRadius:"10px", fontSize:"14px", background:"var(--paper)", color:"var(--ink)", outline:"none" }} />
        </div>
        <button onClick={()=>setShowFilters(v=>!v)}
          style={{ padding:"10px 14px", border:"1px solid var(--border)", borderRadius:"10px",
            background: showFilters ? "var(--ink)" : "var(--paper)", color: showFilters ? "var(--amber-light)" : "var(--muted)",
            cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"13px", fontFamily:"'DM Sans',sans-serif",
          }}>
          <SlidersHorizontal size={15}/> Filters
        </button>
        <select value={sort} onChange={e=>setSort(e.target.value)}
          style={{ padding:"10px 12px", border:"1px solid var(--border)", borderRadius:"10px", fontSize:"13px", background:"var(--paper)", color:"var(--ink)", cursor:"pointer" }}>
          <option value="date_finished">Sort: Date finished</option>
          <option value="days">Sort: Days taken</option>
          <option value="rating">Sort: Rating</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>

      {showFilters && (
        <div style={{ display:"flex", gap:"10px", marginBottom:"16px", flexWrap:"wrap", padding:"16px", background:"var(--cream)", borderRadius:"12px", border:"1px solid var(--border-light)" }}>
          {[
            { val:filterStatus, set:setFilterStatus, opts:[{v:"",l:"All statuses"},{v:"reading",l:"📖 Reading"},{v:"finished",l:"✅ Finished"}] },
          ].map(({val,set:s,opts},i) => (
            <select key={i} value={val} onChange={e=>s(e.target.value)}
              style={{ padding:"8px 12px", border:"1px solid var(--border)", borderRadius:"8px", fontSize:"13px", background:"var(--paper)", color:"var(--ink)", cursor:"pointer" }}>
              {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          ))}
          <select value={filterMood} onChange={e=>setFilterMood(e.target.value)}
            style={{ padding:"8px 12px", border:"1px solid var(--border)", borderRadius:"8px", fontSize:"13px", background:"var(--paper)", color:"var(--ink)", cursor:"pointer" }}>
            <option value="">All moods</option>
            {MOODS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={filterGenre} onChange={e=>setFilterGenre(e.target.value)}
            style={{ padding:"8px 12px", border:"1px solid var(--border)", borderRadius:"8px", fontSize:"13px", background:"var(--paper)", color:"var(--ink)", cursor:"pointer" }}>
            <option value="">All genres</option>
            {GENRES.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
          {(filterMood||filterGenre||filterStatus) && (
            <button onClick={()=>{setFilterMood("");setFilterGenre("");setFilterStatus("");}}
              style={{ padding:"8px 12px", background:"transparent", border:"1px solid var(--border)", borderRadius:"8px", cursor:"pointer", fontSize:"13px", color:"var(--rust)", fontFamily:"'DM Sans',sans-serif" }}>
              Clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner size={28}/></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="📖" title={search||filterMood||filterGenre ? "No books match" : "Your shelf is empty"}
          message={search ? "Try different search terms." : "Start logging books!"}
          action={!search && <Link to="/add-book"><Button>Log your first book</Button></Link>} />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"14px" }} className="stagger">
          {filtered.map((b,i) => {
            const mood = MOODS.find(m=>m.value===b.mood);
            const spineColor = SPINE_COLORS[Math.abs((b.id||"").charCodeAt(0)) % SPINE_COLORS.length];
            return (
              <Card key={b.id} hover glow="var(--shadow-glow-amber)" className="animate-fade-up"
                style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:"16px", alignItems:"start", animationDelay:`${i*40}ms` }}>
                <CoverImage src={b.cover_url} alt={b.title} width={60} height={86} accentColor={spineColor} fallbackEmoji="📚" />
                <div>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", marginBottom:"4px", flexWrap:"wrap" }}>
                    <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1.05rem" }}>{b.title}</h3>
                    {b.status==="reading" && <Badge color="var(--sage)" bg="var(--sage-pale)">📖 Reading</Badge>}
                  </div>
                  <p style={{ fontSize:"13px", color:"var(--muted)", marginBottom:"8px" }}>
                    {b.author && <span>{b.author} · </span>}
                    {b.days && <span>{b.days} days · </span>}
                    {fmtDate(b.date_finished||b.date_started)}
                    {b.genre && <span> · {b.genre}</span>}
                  </p>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {mood && <Badge color={mood.color} bg={mood.color+"18"}>{mood.label}</Badge>}
                    {b.rating>0 && <StarRating value={b.rating} readonly size={14} />}
                  </div>
                  {b.summary && <p style={{ fontSize:"13px", color:"#666", marginTop:"8px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{b.summary}</p>}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  <Link to={`/books/${b.id}`}>
                    <button style={{ background:"none", border:"1px solid var(--border-light)", borderRadius:"8px", padding:"7px 10px", cursor:"pointer", color:"var(--muted)", transition:"all 0.18s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--amber)";e.currentTarget.style.color="var(--amber)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-light)";e.currentTarget.style.color="var(--muted)";}}>
                      <Eye size={14}/>
                    </button>
                  </Link>
                  <button onClick={()=>setDelTarget(b)} style={{ background:"none", border:"1px solid var(--border-light)", borderRadius:"8px", padding:"7px 10px", cursor:"pointer", color:"var(--muted)", transition:"all 0.18s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--rust)";e.currentTarget.style.color="var(--rust)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-light)";e.currentTarget.style.color="var(--muted)";}}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!delTarget} onClose={()=>setDelTarget(null)} title="Remove this book?">
        <p style={{ fontSize:"14px", color:"var(--muted)", marginBottom:"20px" }}>"{delTarget?.title}" will be permanently removed.</p>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={()=>setDelTarget(null)} style={{ flex:"none", padding:"11px 16px", background:"transparent", border:"1px solid var(--border)", borderRadius:"10px", cursor:"pointer", color:"var(--muted)", fontSize:"14px" }}>Cancel</button>
          <Button variant="danger" onClick={async()=>{ await remove(delTarget.id); setDelTarget(null); }} style={{ flex:1 }}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
