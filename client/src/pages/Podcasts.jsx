import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search, Trash2, Eye, Clock, Star } from "lucide-react";
import { usePodcasts } from "../hooks/useData.js";
import { Card, PageHeader, Button, Spinner, EmptyState, Badge, StarRating, Modal, CoverImage } from "../components/UI.jsx";
import { PODCAST_CATEGORIES } from "../utils/constants.js";

function fmtDate(d) {
  if (!d) return "";
  const [y,m,day] = d.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${parseInt(day)}, ${y}`;
}

export default function Podcasts() {
  const { items, loading, remove } = usePodcasts({ sort:"date_listened", order:"DESC" });
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [delTarget, setDelTarget] = useState(null);

  const filtered = items.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.show_name?.toLowerCase().includes(q) || p.episode_title?.toLowerCase().includes(q) || p.host?.toLowerCase().includes(q))
      && (!filterCat || p.category === filterCat);
  });

  const totalMins = items.reduce((a,p) => a + (p.duration_mins||0), 0);
  const totalHrs  = Math.floor(totalMins/60);

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow={`${items.length} podcast${items.length!==1?"s":""} logged`}
        title="Podcasts" subtitle="Your listening journal"
        accentColor="var(--teal)"
        action={<Link to="/add-podcast"><Button variant="teal"><PlusCircle size={16}/> Log a Podcast</Button></Link>}
      />

      {/* Quick stats */}
      {items.length > 0 && (
        <div style={{ display:"flex", gap:"12px", flexWrap:"wrap", marginBottom:"24px" }}>
          {[
            { icon:"🎙️", label:"Episodes", value: items.length },
            { icon:"⏱️", label:"Total Hours", value: totalHrs > 0 ? `${totalHrs}h ${totalMins%60}m` : `${totalMins}m` },
            { icon:"⭐", label:"Avg Rating", value: items.length ? (items.reduce((a,p)=>a+p.rating,0)/items.length).toFixed(1) : "—" },
          ].map(s => (
            <Card key={s.label} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 18px" }}>
              <span style={{ fontSize:"1.4rem" }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily:"'Lora',serif", fontSize:"1.3rem", fontWeight:700 }}>{s.value}</div>
                <div style={{ fontSize:"11px", color:"var(--muted)", letterSpacing:"1px", textTransform:"uppercase" }}>{s.label}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"20px", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:"200px" }}>
          <Search size={16} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--muted)" }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search podcasts…"
            style={{ width:"100%", padding:"10px 12px 10px 36px", border:"1px solid var(--border)", borderRadius:"10px", fontSize:"14px", background:"var(--paper)", color:"var(--ink)", outline:"none" }} />
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
          style={{ padding:"10px 12px", border:"1px solid var(--border)", borderRadius:"10px", fontSize:"13px", background:"var(--paper)", color:"var(--ink)", cursor:"pointer" }}>
          <option value="">All categories</option>
          {PODCAST_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner size={28}/></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎙️" title="No podcasts yet" message="Start logging what you listen to!"
          action={<Link to="/add-podcast"><Button variant="teal">Log your first podcast</Button></Link>} />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }} className="stagger">
          {filtered.map(p => {
            const tags = (() => { try { return JSON.parse(p.tags||"[]"); } catch { return []; } })();
            return (
              <Card key={p.id} hover glow="var(--shadow-glow-teal)"
                style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:"16px", alignItems:"start" }}
                className="animate-fade-up">
                <CoverImage src={p.cover_url} alt={p.show_name} width={64} height={64} radius={10} fallbackEmoji="🎙️" accentColor="var(--teal)" />
                <div>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"8px", marginBottom:"4px", flexWrap:"wrap" }}>
                    <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1rem" }}>{p.show_name}</h3>
                    {p.category && <Badge color="var(--teal)" bg="var(--teal-pale)" size="sm">{p.category}</Badge>}
                  </div>
                  {p.episode_title && <p style={{ fontSize:"13px", fontStyle:"italic", color:"var(--ink-light)", marginBottom:"4px" }}>"{p.episode_title}"</p>}
                  <p style={{ fontSize:"12px", color:"var(--muted)", marginBottom:"8px" }}>
                    {p.host && <span>{p.host} · </span>}
                    {p.duration_mins && <span><Clock size={11} style={{ verticalAlign:"middle" }}/> {p.duration_mins}m · </span>}
                    {fmtDate(p.date_listened)}
                  </p>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
                    {p.rating>0 && <StarRating value={p.rating} readonly size={14} />}
                    {p.mood && <Badge color="var(--lavender)" bg="var(--lavender-pale)">{p.mood}</Badge>}
                    {tags.map(t=><Badge key={t} color="var(--teal)" bg="var(--teal-pale)">{t}</Badge>)}
                  </div>
                  {p.notes && <p style={{ fontSize:"13px", color:"#666", marginTop:"8px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.notes}</p>}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  <Link to={`/podcasts/${p.id}`}>
                    <button style={{ background:"none", border:"1px solid var(--border-light)", borderRadius:"8px", padding:"7px 10px", cursor:"pointer", color:"var(--muted)", transition:"all 0.18s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--teal)";e.currentTarget.style.color="var(--teal)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-light)";e.currentTarget.style.color="var(--muted)";}}>
                      <Eye size={14}/>
                    </button>
                  </Link>
                  <button onClick={()=>setDelTarget(p)} style={{ background:"none", border:"1px solid var(--border-light)", borderRadius:"8px", padding:"7px 10px", cursor:"pointer", color:"var(--muted)", transition:"all 0.18s" }}
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

      <Modal open={!!delTarget} onClose={()=>setDelTarget(null)} title="Remove this podcast?">
        <p style={{ fontSize:"14px", color:"var(--muted)", marginBottom:"20px" }}>"{delTarget?.show_name}" will be removed.</p>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={()=>setDelTarget(null)} style={{ flex:"none", padding:"11px 16px", background:"transparent", border:"1px solid var(--border)", borderRadius:"10px", cursor:"pointer", color:"var(--muted)", fontSize:"14px" }}>Cancel</button>
          <Button variant="danger" onClick={async()=>{ await remove(delTarget.id); setDelTarget(null); }} style={{ flex:1 }}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
