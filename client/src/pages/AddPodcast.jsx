import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePodcasts } from "../hooks/useData.js";
import { Card, PageHeader, FormField, Input, Textarea, Select, Button, StarRating, CoverImage, CoverSearchField, TagInput } from "../components/UI.jsx";
import { PODCAST_CATEGORIES } from "../utils/constants.js";
import { fetchPodcastCover } from "../utils/api.js";

const defaultForm = { show_name:"", episode_title:"", host:"", category:"", duration_mins:"",
  date_listened: new Date().toISOString().split("T")[0], rating:0, notes:"", key_takeaways:"",
  cover_url:"", tags:[], mood:"" };

const PODCAST_MOODS = [
  { value:"Mind-blown",   label:"🤯 Mind-blown",   color:"#3a7a80" },
  { value:"Educated",     label:"🎓 Educated",      color:"#4e7458" },
  { value:"Entertained",  label:"😄 Entertained",   color:"#c8882a" },
  { value:"Inspired",     label:"✨ Inspired",       color:"#6e5f88" },
  { value:"Challenged",   label:"🧠 Challenged",    color:"#a07040" },
  { value:"Relaxed",      label:"😌 Relaxed",       color:"#4a8a9a" },
  { value:"Moved",        label:"🥹 Moved",         color:"#a84030" },
];

export default function AddPodcast() {
  const navigate = useNavigate();
  const { add } = usePodcasts();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingCover, setFetchingCover] = useState(false);

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:undefined})); };

  const handleFetchCover = async () => {
    setFetchingCover(true);
    const url = await fetchPodcastCover(form.show_name);
    if (url) set("cover_url", url);
    setFetchingCover(false);
  };

  const validate = () => {
    const e = {};
    if (!form.show_name.trim()) e.show_name = "Show name is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const p = await add({ ...form, duration_mins: form.duration_mins ? Number(form.duration_mins) : null,
        rating: Number(form.rating), tags: JSON.stringify(form.tags) });
      navigate(`/podcasts/${p.id}`);
    } catch (err) { setLoading(false); }
  };

  return (
    <div className="animate-fade-up">
      <Link to="/podcasts" style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"13px", color:"var(--muted)", marginBottom:"16px" }}>
        <ArrowLeft size={14}/> Back to Podcasts
      </Link>
      <PageHeader eyebrow="New entry" title="Log a Podcast" subtitle="Record a podcast episode or show you've listened to" accentColor="var(--teal)" />
      <Card style={{ maxWidth:"720px" }}>
        <form onSubmit={handleSubmit} noValidate>
          {form.cover_url && <div style={{ marginBottom:"20px" }}><CoverImage src={form.cover_url} alt={form.show_name} width={80} height={80} radius={12} fallbackEmoji="🎙️" accentColor="var(--teal)" /></div>}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px" }}>
            <FormField label="Show / Podcast Name *" error={errors.show_name} style={{ gridColumn:"1/-1" }}>
              <Input value={form.show_name} onChange={e=>set("show_name",e.target.value)} placeholder="e.g. Lex Fridman Podcast" />
            </FormField>
            <FormField label="Episode Title" style={{ gridColumn:"1/-1" }}>
              <Input value={form.episode_title} onChange={e=>set("episode_title",e.target.value)} placeholder="e.g. #400 — Elon Musk" />
            </FormField>
            <FormField label="Host / Creator">
              <Input value={form.host} onChange={e=>set("host",e.target.value)} placeholder="e.g. Lex Fridman" />
            </FormField>
            <FormField label="Category">
              <Select value={form.category} onChange={e=>set("category",e.target.value)}>
                <option value="">Select category…</option>
                {PODCAST_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </Select>
            </FormField>
            <FormField label="Duration (minutes)">
              <Input type="number" min="1" value={form.duration_mins} onChange={e=>set("duration_mins",e.target.value)} placeholder="90" />
            </FormField>
            <FormField label="Date Listened">
              <Input type="date" value={form.date_listened} onChange={e=>set("date_listened",e.target.value)} />
            </FormField>
            <FormField label="Rating">
              <div style={{ paddingTop:"8px" }}><StarRating value={form.rating} onChange={v=>set("rating",v)} /></div>
            </FormField>

            <div style={{ gridColumn:"1/-1" }}>
              <CoverSearchField label="Cover Image" value={form.cover_url} onChange={v=>set("cover_url",v)}
                onFetch={handleFetchCover} fetching={fetchingCover} accentColor="var(--teal)" />
            </div>

            <FormField label="How did it make you feel?" style={{ gridColumn:"1/-1" }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", paddingTop:"4px" }}>
                {PODCAST_MOODS.map(m=>(
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

            <FormField label="Notes / Thoughts" style={{ gridColumn:"1/-1" }}>
              <Textarea rows={4} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="What stood out? Main ideas discussed?" />
            </FormField>
            <FormField label="Key Takeaways" style={{ gridColumn:"1/-1" }}>
              <Textarea rows={3} value={form.key_takeaways} onChange={e=>set("key_takeaways",e.target.value)} placeholder="The most important things you learned or want to remember…" />
            </FormField>

            <FormField label="Tags" style={{ gridColumn:"1/-1" }} hint="Press Enter or click Add">
              <TagInput tags={form.tags} onChange={v=>set("tags",v)} placeholder="e.g. ai, productivity, science…" color="var(--teal)" />
            </FormField>
          </div>

          <div style={{ marginTop:"28px" }}>
            <Button type="submit" variant="teal" size="lg" disabled={loading} style={{ width:"100%" }}>
              {loading ? "Saving…" : "Save Podcast"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
