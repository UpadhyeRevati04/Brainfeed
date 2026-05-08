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
const TYPE_EMOJI = { movie:"🎬", series:"📺", documentary:"🎥", anime:"⛩️" };

export default function MediaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delOpen, setDelOpen] = useState(false);

  useEffect(() => {
    api.getMedia(id).then(d=>{ setItem(d); setLoading(false); }).catch(()=>setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display:"flex", justifyContent:"center", padding:"80px" }}><Spinner size={28}/></div>;
  if (!item)   return <div style={{ padding:"40px", textAlign:"center" }}>Not found.</div>;

  return (
    <div className="animate-fade-up" style={{ maxWidth:"760px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px", flexWrap:"wrap", gap:"10px" }}>
        <Link to="/media" style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"13px", color:"var(--muted)" }}>
          <ArrowLeft size={14}/> Back to Watch List
        </Link>
        <Button variant="danger" size="sm" onClick={()=>setDelOpen(true)}><Trash2 size={14}/> Delete</Button>
      </div>

      <Card style={{ marginBottom:"20px" }}>
        <div style={{ display:"flex", gap:"20px", alignItems:"flex-start" }}>
          <CoverImage src={item.cover_url} alt={item.title} width={100} height={145} fallbackEmoji={TYPE_EMOJI[item.type]||"🎬"} accentColor="var(--rose)" />
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", gap:"8px", marginBottom:"8px", flexWrap:"wrap" }}>
              <Badge color="var(--rose)" bg="var(--rose-pale)">{TYPE_EMOJI[item.type]||"🎬"} {item.type}</Badge>
              {item.year && <Badge color="var(--muted)" bg="var(--cream)">{item.year}</Badge>}
              {item.genre && <Badge color="var(--lavender)" bg="var(--lavender-pale)">{item.genre}</Badge>}
            </div>
            <h1 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(1.4rem,4vw,2rem)", marginBottom:"6px" }}>{item.title}</h1>
            {item.director && <p style={{ fontSize:"14px", color:"var(--muted)", marginBottom:"12px" }}>Directed by {item.director}</p>}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", alignItems:"center" }}>
              {item.rating>0 && <StarRating value={item.rating} readonly />}
              {item.mood && <Badge color="var(--rose)" bg="var(--rose-pale)">{item.mood}</Badge>}
              {item.date_watched && <span style={{ fontSize:"13px", color:"var(--muted)" }}>📅 {fmtDate(item.date_watched)}</span>}
            </div>
            <div style={{ display:"flex", gap:"8px", marginTop:"10px", flexWrap:"wrap" }}>
              {item.rewatched  && <Badge color="var(--teal)" bg="var(--teal-pale)">🔁 Rewatched</Badge>}
              {item.recommend  && <Badge color="var(--sage)" bg="var(--sage-pale)">👍 Would Recommend</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {item.review && (
        <Card style={{ marginBottom:"16px" }}>
          <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1rem", marginBottom:"12px" }}>Review</h3>
          <p style={{ fontSize:"15px", lineHeight:1.75, color:"#555" }}>{item.review}</p>
        </Card>
      )}
      {item.favourite_scene && (
        <Card style={{ borderLeft:"4px solid var(--rose)", background:"var(--rose-pale)" }}>
          <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1rem", marginBottom:"12px", color:"var(--rose)", fontStyle:"italic" }}>Favourite Scene</h3>
          <p style={{ fontSize:"15px", lineHeight:1.75, color:"#555", fontStyle:"italic" }}>"{item.favourite_scene}"</p>
        </Card>
      )}

      <Modal open={delOpen} onClose={()=>setDelOpen(false)} title="Remove this title?">
        <p style={{ fontSize:"14px", color:"var(--muted)", marginBottom:"20px" }}>"{item.title}" will be permanently removed.</p>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={()=>setDelOpen(false)} style={{ flex:"none", padding:"11px 16px", background:"transparent", border:"1px solid var(--border)", borderRadius:"10px", cursor:"pointer", color:"var(--muted)", fontSize:"14px" }}>Cancel</button>
          <Button variant="danger" onClick={async()=>{ await api.deleteMedia(id); navigate("/media"); }} style={{ flex:1 }}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
