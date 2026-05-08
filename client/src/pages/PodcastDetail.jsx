import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { api } from "../utils/api.js";
import { Card, Spinner, Badge, StarRating, Button, Modal, CoverImage } from "../components/UI.jsx";

function fmtDate(d) {
  if (!d) return "";
  const [y,m,day] = d.split("-");
  return `${["January","February","March","April","May","June","July","August","September","October","November","December"][parseInt(m)-1]} ${parseInt(day)}, ${y}`;
}

export default function PodcastDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delOpen, setDelOpen] = useState(false);

  useEffect(() => {
    api.getPodcast(id).then(d=>{ setItem(d); setLoading(false); }).catch(()=>setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display:"flex", justifyContent:"center", padding:"80px" }}><Spinner size={28}/></div>;
  if (!item)   return <div style={{ padding:"40px", textAlign:"center" }}>Not found.</div>;

  const tags = (() => { try { return JSON.parse(item.tags||"[]"); } catch { return []; } })();

  return (
    <div className="animate-fade-up" style={{ maxWidth:"760px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px", flexWrap:"wrap", gap:"10px" }}>
        <Link to="/podcasts" style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"13px", color:"var(--muted)" }}>
          <ArrowLeft size={14}/> Back to Podcasts
        </Link>
        <Button variant="danger" size="sm" onClick={()=>setDelOpen(true)}><Trash2 size={14}/> Delete</Button>
      </div>

      <Card style={{ marginBottom:"20px" }}>
        <div style={{ display:"flex", gap:"20px", alignItems:"flex-start" }}>
          <CoverImage src={item.cover_url} alt={item.show_name} width={90} height={90} radius={14} fallbackEmoji="🎙️" accentColor="var(--teal)" />
          <div style={{ flex:1 }}>
            <p style={{ fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase", color:"var(--teal)", fontWeight:600, marginBottom:"6px" }}>{item.category || "Podcast"}</p>
            <h1 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(1.3rem,4vw,1.8rem)", marginBottom:"6px" }}>{item.show_name}</h1>
            {item.episode_title && <p style={{ fontSize:"15px", fontStyle:"italic", color:"var(--ink-light)", marginBottom:"8px" }}>"{item.episode_title}"</p>}
            {item.host && <p style={{ fontSize:"13px", color:"var(--muted)", marginBottom:"12px" }}>Hosted by {item.host}</p>}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", alignItems:"center" }}>
              {item.rating>0 && <StarRating value={item.rating} readonly />}
              {item.mood && <Badge color="var(--teal)" bg="var(--teal-pale)">{item.mood}</Badge>}
              {item.duration_mins && <span style={{ fontSize:"13px", color:"var(--muted)" }}>⏱ {item.duration_mins} min</span>}
              {item.date_listened && <span style={{ fontSize:"13px", color:"var(--muted)" }}>📅 {fmtDate(item.date_listened)}</span>}
            </div>
            {tags.length > 0 && (
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginTop:"10px" }}>
                {tags.map(t=><Badge key={t} color="var(--teal)" bg="var(--teal-pale)">{t}</Badge>)}
              </div>
            )}
          </div>
        </div>
      </Card>

      {item.notes && (
        <Card style={{ marginBottom:"16px" }}>
          <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1rem", marginBottom:"12px" }}>Notes</h3>
          <p style={{ fontSize:"15px", lineHeight:1.75, color:"#555" }}>{item.notes}</p>
        </Card>
      )}
      {item.key_takeaways && (
        <Card style={{ borderLeft:"4px solid var(--teal)", background:"var(--teal-pale)" }}>
          <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1rem", marginBottom:"12px", color:"var(--teal)" }}>Key Takeaways</h3>
          <p style={{ fontSize:"15px", lineHeight:1.75, color:"#444" }}>{item.key_takeaways}</p>
        </Card>
      )}

      <Modal open={delOpen} onClose={()=>setDelOpen(false)} title="Remove this podcast?">
        <p style={{ fontSize:"14px", color:"var(--muted)", marginBottom:"20px" }}>This will be permanently removed.</p>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={()=>setDelOpen(false)} style={{ flex:"none", padding:"11px 16px", background:"transparent", border:"1px solid var(--border)", borderRadius:"10px", cursor:"pointer", color:"var(--muted)", fontSize:"14px" }}>Cancel</button>
          <Button variant="danger" onClick={async()=>{ await api.deletePodcast(id); navigate("/podcasts"); }} style={{ flex:1 }}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
