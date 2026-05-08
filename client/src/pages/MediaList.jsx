import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search, Trash2, Eye } from "lucide-react";
import { useMedia } from "../hooks/useData.js";
import { Card, PageHeader, Button, Spinner, EmptyState, Badge, StarRating, Modal, CoverImage } from "../components/UI.jsx";
import { MOVIE_GENRES } from "../utils/constants.js";

function fmtDate(d) {
  if (!d) return "";
  const [y,m,day] = d.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${parseInt(day)}, ${y}`;
}

const TYPE_EMOJI = { movie:"🎬", series:"📺", documentary:"🎥", anime:"⛩️" };

export default function MediaList() {
  const { items, loading, remove } = useMedia({ sort:"date_watched", order:"DESC" });
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [delTarget, setDelTarget] = useState(null);

  const filtered = items.filter(m => {
    const q = search.toLowerCase();
    return (!q || m.title?.toLowerCase().includes(q) || m.director?.toLowerCase().includes(q))
      && (!filterType || m.type === filterType)
      && (!filterGenre || m.genre === filterGenre);
  });

  const byType = items.reduce((a,m)=>{ a[m.type]=(a[m.type]||0)+1; return a; }, {});

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow={`${items.length} title${items.length!==1?"s":""} logged`}
        title="Movies & Series" subtitle="Your watchlist and reviews" accentColor="var(--rose)"
        action={<Link to="/add-media"><Button style={{ background:"var(--rose)", color:"#fff" }}><PlusCircle size={16}/> Log Media</Button></Link>}
      />

      {/* Type pills */}
      {items.length > 0 && (
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"20px" }}>
          {Object.entries(byType).map(([type, count]) => (
            <button key={type} onClick={()=>setFilterType(filterType===type?"":type)}
              style={{ padding:"7px 16px", borderRadius:"20px", fontSize:"13px", cursor:"pointer",
                border: filterType===type ? "1.5px solid var(--rose)" : "1px solid var(--border-light)",
                background: filterType===type ? "var(--rose-pale)" : "var(--paper)",
                color: filterType===type ? "var(--rose)" : "var(--muted)",
                fontWeight: filterType===type ? 600 : 400, transition:"all 0.18s",
                fontFamily:"'DM Sans',sans-serif",
              }}>
              {TYPE_EMOJI[type]||"🎬"} {type.charAt(0).toUpperCase()+type.slice(1)} ({count})
            </button>
          ))}
        </div>
      )}

      <div style={{ display:"flex", gap:"10px", marginBottom:"20px", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:"200px" }}>
          <Search size={16} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--muted)" }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search titles…"
            style={{ width:"100%", padding:"10px 12px 10px 36px", border:"1px solid var(--border)", borderRadius:"10px", fontSize:"14px", background:"var(--paper)", color:"var(--ink)", outline:"none" }} />
        </div>
        <select value={filterGenre} onChange={e=>setFilterGenre(e.target.value)}
          style={{ padding:"10px 12px", border:"1px solid var(--border)", borderRadius:"10px", fontSize:"13px", background:"var(--paper)", color:"var(--ink)", cursor:"pointer" }}>
          <option value="">All genres</option>
          {MOVIE_GENRES.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner size={28}/></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎬" title="No media logged yet" message="Start tracking movies and series!"
          action={<Link to="/add-media"><Button style={{ background:"var(--rose)", color:"#fff" }}>Log your first watch</Button></Link>} />
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"16px" }} className="stagger">
          {filtered.map(m => (
            <Card key={m.id} hover glow="var(--shadow-glow-rose)" className="animate-fade-up"
              style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <div style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>
                <CoverImage src={m.cover_url} alt={m.title} width={70} height={100} fallbackEmoji={TYPE_EMOJI[m.type]||"🎬"} accentColor="var(--rose)" />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:"6px", marginBottom:"4px", flexWrap:"wrap" }}>
                    <Badge color="var(--rose)" bg="var(--rose-pale)">{TYPE_EMOJI[m.type]||"🎬"} {m.type}</Badge>
                    {m.year && <span style={{ fontSize:"12px", color:"var(--muted)", paddingTop:"2px" }}>{m.year}</span>}
                  </div>
                  <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1rem", marginBottom:"4px", lineHeight:1.3 }}>{m.title}</h3>
                  {m.director && <p style={{ fontSize:"12px", color:"var(--muted)", marginBottom:"6px" }}>{m.director}</p>}
                  {m.rating>0 && <StarRating value={m.rating} readonly size={14} />}
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {m.genre && <Badge color="var(--lavender)" bg="var(--lavender-pale)">{m.genre}</Badge>}
                {m.rewatched && <Badge color="var(--teal)" bg="var(--teal-pale)">🔁 Rewatched</Badge>}
                {m.recommend && <Badge color="var(--sage)" bg="var(--sage-pale)">👍 Recommend</Badge>}
              </div>
              {m.review && <p style={{ fontSize:"13px", color:"#666", lineHeight:1.6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{m.review}</p>}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"auto", paddingTop:"8px", borderTop:"1px solid var(--border-light)" }}>
                <span style={{ fontSize:"12px", color:"var(--muted)" }}>{fmtDate(m.date_watched)}</span>
                <div style={{ display:"flex", gap:"6px" }}>
                  <Link to={`/media/${m.id}`}>
                    <button style={{ background:"none", border:"1px solid var(--border-light)", borderRadius:"7px", padding:"5px 8px", cursor:"pointer", color:"var(--muted)", transition:"all 0.18s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--rose)";e.currentTarget.style.color="var(--rose)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-light)";e.currentTarget.style.color="var(--muted)";}}>
                      <Eye size={13}/>
                    </button>
                  </Link>
                  <button onClick={()=>setDelTarget(m)} style={{ background:"none", border:"1px solid var(--border-light)", borderRadius:"7px", padding:"5px 8px", cursor:"pointer", color:"var(--muted)", transition:"all 0.18s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--rust)";e.currentTarget.style.color="var(--rust)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-light)";e.currentTarget.style.color="var(--muted)";}}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!delTarget} onClose={()=>setDelTarget(null)} title="Remove this title?">
        <p style={{ fontSize:"14px", color:"var(--muted)", marginBottom:"20px" }}>"{delTarget?.title}" will be removed.</p>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={()=>setDelTarget(null)} style={{ flex:"none", padding:"11px 16px", background:"transparent", border:"1px solid var(--border)", borderRadius:"10px", cursor:"pointer", color:"var(--muted)", fontSize:"14px" }}>Cancel</button>
          <Button variant="danger" onClick={async()=>{ await remove(delTarget.id); setDelTarget(null); }} style={{ flex:1 }}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
