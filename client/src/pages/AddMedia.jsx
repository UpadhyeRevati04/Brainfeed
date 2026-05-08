import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useMedia } from "../hooks/useData.js";
import { Card, PageHeader, FormField, Input, Textarea, Select, Button, StarRating, CoverImage, CoverSearchField } from "../components/UI.jsx";
import { MOVIE_GENRES } from "../utils/constants.js";
import { fetchMovieCover } from "../utils/api.js";

const defaultForm = { title:"", type:"movie", genre:"", director:"", year:"", rating:0,
  date_watched: new Date().toISOString().split("T")[0], rewatched:false, review:"",
  favourite_scene:"", cover_url:"", mood:"", recommend:true };

const MEDIA_MOODS = [
  { value:"Thrilled",    label:"⚡ Thrilled",    color:"#3a7a80" },
  { value:"Moved",       label:"🥹 Moved",       color:"#a84030" },
  { value:"Scared",      label:"😱 Scared",      color:"#6e5f88" },
  { value:"Laughed",     label:"😂 Laughed",     color:"#c8882a" },
  { value:"Inspired",    label:"✨ Inspired",    color:"#4e7458" },
  { value:"Mind-blown",  label:"🤯 Mind-blown",  color:"#3a7a80" },
  { value:"Sad",         label:"😢 Sad",         color:"#7a6060" },
  { value:"Nostalgic",   label:"🍂 Nostalgic",   color:"#a07040" },
  { value:"Bored",       label:"😑 Bored",       color:"#999" },
];

export default function AddMedia() {
  const navigate = useNavigate();
  const { add } = useMedia();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingCover, setFetchingCover] = useState(false);

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:undefined})); };

  const handleFetchCover = async () => {
    setFetchingCover(true);
    const url = await fetchMovieCover(form.title);
    if (url) set("cover_url", url);
    setFetchingCover(false);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const m = await add({ ...form, rating: Number(form.rating), year: form.year ? Number(form.year) : null });
      navigate(`/media/${m.id}`);
    } catch (err) { setLoading(false); }
  };

  return (
    <div className="animate-fade-up">
      <Link to="/media" style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"13px", color:"var(--muted)", marginBottom:"16px" }}>
        <ArrowLeft size={14}/> Back to Watch List
      </Link>
      <PageHeader eyebrow="New entry" title="Log a Movie or Series" subtitle="Record something you've watched and your thoughts on it" accentColor="var(--rose)" />
      <Card style={{ maxWidth:"720px" }}>
        <form onSubmit={handleSubmit} noValidate>
          {form.cover_url && <div style={{ marginBottom:"20px" }}><CoverImage src={form.cover_url} alt={form.title} width={80} height={115} fallbackEmoji="🎬" accentColor="var(--rose)" /></div>}

          {/* Type toggle */}
          <div style={{ marginBottom:"24px" }}>
            <p style={{ fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", color:"var(--muted)", fontWeight:600, marginBottom:"10px" }}>Type</p>
            <div style={{ display:"flex", gap:"0", background:"var(--cream)", border:"1px solid var(--border)", borderRadius:"10px", padding:"4px", width:"fit-content" }}>
              {[{v:"movie",l:"🎬 Movie"},{v:"series",l:"📺 Series"},{v:"documentary",l:"🎥 Documentary"},{v:"anime",l:"⛩️ Anime"}].map(t=>(
                <button key={t.v} type="button" onClick={()=>set("type",t.v)}
                  style={{ padding:"8px 16px", borderRadius:"8px", fontSize:"13px", fontWeight:600,
                    cursor:"pointer", border:"none", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
                    background: form.type===t.v ? "var(--ink)" : "transparent",
                    color: form.type===t.v ? "var(--rose)" : "var(--muted)",
                  }}>{t.l}</button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px" }}>
            <FormField label="Title *" error={errors.title} style={{ gridColumn:"1/-1" }}>
              <Input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Interstellar" />
            </FormField>
            <FormField label="Director / Creator">
              <Input value={form.director} onChange={e=>set("director",e.target.value)} placeholder="e.g. Christopher Nolan" />
            </FormField>
            <FormField label="Year">
              <Input type="number" min="1900" max="2030" value={form.year} onChange={e=>set("year",e.target.value)} placeholder="2014" />
            </FormField>
            <FormField label="Genre">
              <Select value={form.genre} onChange={e=>set("genre",e.target.value)}>
                <option value="">Select genre…</option>
                {MOVIE_GENRES.map(g=><option key={g} value={g}>{g}</option>)}
              </Select>
            </FormField>
            <FormField label="Date Watched">
              <Input type="date" value={form.date_watched} onChange={e=>set("date_watched",e.target.value)} />
            </FormField>
            <FormField label="Rating">
              <div style={{ paddingTop:"8px" }}><StarRating value={form.rating} onChange={v=>set("rating",v)} /></div>
            </FormField>

            {/* Rewatched & Recommend toggles */}
            <div style={{ gridColumn:"1/-1", display:"flex", gap:"16px", flexWrap:"wrap" }}>
              {[{k:"rewatched",l:"🔁 Rewatched / Rewatch?"},{k:"recommend",l:"👍 Would Recommend"}].map(toggle=>(
                <button key={toggle.k} type="button" onClick={()=>set(toggle.k,!form[toggle.k])}
                  style={{ padding:"9px 18px", borderRadius:"10px", fontSize:"13px", cursor:"pointer",
                    border:`1.5px solid ${form[toggle.k]?"var(--rose)":"var(--border-light)"}`,
                    background: form[toggle.k] ? "var(--rose-pale)" : "var(--paper)",
                    color: form[toggle.k] ? "var(--rose)" : "var(--muted)",
                    fontWeight: form[toggle.k] ? 600 : 400, transition:"all 0.18s",
                    fontFamily:"'DM Sans',sans-serif",
                  }}>{toggle.l}</button>
              ))}
            </div>

            <div style={{ gridColumn:"1/-1" }}>
              <CoverSearchField label="Cover / Poster Image" value={form.cover_url} onChange={v=>set("cover_url",v)}
                onFetch={handleFetchCover} fetching={fetchingCover} accentColor="var(--rose)" />
            </div>

            <FormField label="How did it make you feel?" style={{ gridColumn:"1/-1" }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", paddingTop:"4px" }}>
                {MEDIA_MOODS.map(m=>(
                  <button key={m.value} type="button" onClick={()=>set("mood",m.value)}
                    style={{ padding:"7px 14px", borderRadius:"20px", fontSize:"13px", cursor:"pointer",
                      border: form.mood===m.value ? `1.5px solid ${m.color}` : "1px solid var(--border-light)",
                      background: form.mood===m.value ? m.color+"18" : "var(--paper)",
                      color: form.mood===m.value ? m.color : "var(--muted)",
                      fontWeight: form.mood===m.value ? 600 : 400, transition:"all 0.15s",
                    }}>{m.label}</button>
                ))}
              </div>
            </FormField>

            <FormField label="Your Review" style={{ gridColumn:"1/-1" }}>
              <Textarea rows={5} value={form.review} onChange={e=>set("review",e.target.value)} placeholder="What did you think overall? Plot, acting, visuals?" />
            </FormField>
            <FormField label="Favourite Scene / Moment" style={{ gridColumn:"1/-1" }}>
              <Textarea rows={3} value={form.favourite_scene} onChange={e=>set("favourite_scene",e.target.value)} placeholder="The scene that stuck with you most…" />
            </FormField>
          </div>

          <div style={{ marginTop:"28px" }}>
            <Button type="submit" variant="rose" size="lg" disabled={loading} style={{ width:"100%", background:"var(--rose)" }}>
              {loading ? "Saving…" : "Save to Watch List"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
