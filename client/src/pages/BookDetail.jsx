import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { api } from "../utils/api.js";
import { Card, Spinner, Badge, StarRating, Button, Modal, CoverImage } from "../components/UI.jsx";
import { MOODS, SPINE_COLORS } from "../utils/constants.js";

function fmtDate(d) {
  if (!d) return "";
  const [y,m,day] = d.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${parseInt(day)}, ${y}`;
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delOpen, setDelOpen] = useState(false);

  useEffect(() => {
    api.getBook(id).then(d=>{ setBook(d); setLoading(false); }).catch(()=>setLoading(false));
  }, [id]);

  const handleDelete = async () => { await api.deleteBook(id); navigate("/library"); };

  if (loading) return <div style={{ display:"flex", justifyContent:"center", padding:"80px" }}><Spinner size={28}/></div>;
  if (!book)   return <div style={{ padding:"40px", textAlign:"center", color:"var(--muted)" }}>Book not found.</div>;

  const mood = MOODS.find(m=>m.value===book.mood);
  const spineColor = SPINE_COLORS[Math.abs(id.charCodeAt(0)) % SPINE_COLORS.length];

  return (
    <div className="animate-fade-up" style={{ maxWidth:"760px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px", flexWrap:"wrap", gap:"10px" }}>
        <Link to="/library" style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"13px", color:"var(--muted)" }}>
          <ArrowLeft size={14}/> Back to Library
        </Link>
        <div style={{ display:"flex", gap:"8px" }}>
          <Link to={`/books/${id}/edit`}><Button variant="ghost" size="sm"><Edit2 size={14}/> Edit</Button></Link>
          <Button variant="danger" size="sm" onClick={()=>setDelOpen(true)}><Trash2 size={14}/> Delete</Button>
        </div>
      </div>

      <Card style={{ marginBottom:"20px" }}>
        <div style={{ display:"flex", gap:"20px", alignItems:"flex-start" }}>
          <CoverImage src={book.cover_url} alt={book.title} width={90} height={130} accentColor={spineColor} fallbackEmoji="📚" />
          <div style={{ flex:1 }}>
            <p style={{ fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase", color:"var(--muted)", marginBottom:"8px" }}>{book.genre || "Book"}</p>
            <h1 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(1.4rem,4vw,2rem)", marginBottom:"6px" }}>{book.title}</h1>
            {book.author && <p style={{ fontSize:"15px", color:"var(--ink-light)", marginBottom:"14px" }}>by {book.author}</p>}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", alignItems:"center" }}>
              {mood && <Badge color={mood.color} bg={mood.color+"18"}>{mood.label}</Badge>}
              {book.date_finished && <span style={{ fontSize:"13px", color:"var(--muted)" }}>📅 {fmtDate(book.date_finished)}</span>}
              {book.days && <span style={{ fontSize:"13px", color:"var(--muted)" }}>⏱ {book.days} days</span>}
              {book.rating>0 && <StarRating value={book.rating} readonly />}
            </div>
          </div>
        </div>
      </Card>

      {book.summary && (
        <Card style={{ marginBottom:"16px" }}>
          <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1rem", marginBottom:"12px", color:"var(--ink-light)" }}>Summary</h3>
          <p style={{ fontSize:"15px", lineHeight:1.75, color:"#555" }}>{book.summary}</p>
        </Card>
      )}
      {book.reflection && (
        <Card style={{ borderLeft:`4px solid ${spineColor}`, background:"var(--amber-pale)" }}>
          <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1rem", marginBottom:"12px", fontStyle:"italic" }}>Personal Reflection</h3>
          <p style={{ fontSize:"15px", lineHeight:1.75, color:"#666", fontStyle:"italic" }}>"{book.reflection}"</p>
        </Card>
      )}

      <Modal open={delOpen} onClose={()=>setDelOpen(false)} title="Remove this book?">
        <p style={{ fontSize:"14px", color:"var(--muted)", marginBottom:"20px" }}>"{book.title}" will be permanently removed.</p>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={()=>setDelOpen(false)} style={{ flex:"none", padding:"11px 16px", background:"transparent", border:"1px solid var(--border)", borderRadius:"10px", cursor:"pointer", color:"var(--muted)", fontSize:"14px" }}>Cancel</button>
          <Button variant="danger" onClick={handleDelete} style={{ flex:1 }}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
