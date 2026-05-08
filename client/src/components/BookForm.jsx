import React, { useState } from "react";
import { FormField, Input, Textarea, Select, Button, StarRating, CoverImage, CoverSearchField } from "./UI.jsx";
import { MOODS, GENRES } from "../utils/constants.js";
import { fetchBookCover } from "../utils/api.js";

const defaultForm = {
  title:"", author:"", status:"finished",
  days:"", date_started: new Date().toISOString().split("T")[0],
  date_finished: new Date().toISOString().split("T")[0],
  mood:"", summary:"", reflection:"", genre:"", rating:0, cover_url:"",
};

export default function BookForm({ initialValues={}, onSubmit, submitLabel="Save Book", loading=false }) {
  const [form, setForm] = useState({ ...defaultForm, ...initialValues });
  const [errors, setErrors] = useState({});
  const [fetchingCover, setFetchingCover] = useState(false);

  const isReading = form.status === "reading";
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:undefined})); };

  const handleFetchCover = async () => {
    setFetchingCover(true);
    const url = await fetchBookCover(form.title, form.author);
    if (url) set("cover_url", url);
    setFetchingCover(false);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!isReading) {
      if (!form.days || isNaN(form.days) || Number(form.days)<1) e.days = "Enter valid days";
      if (!form.mood) e.mood = "Select a mood";
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    await onSubmit({ ...form, days: form.days ? Number(form.days) : null, rating: Number(form.rating) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Status Toggle */}
      <div style={{ marginBottom:"24px" }}>
        <p style={{ fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", color:"var(--muted)", fontWeight:600, marginBottom:"10px" }}>Status</p>
        <div style={{ display:"flex", gap:"0", background:"var(--cream)", border:"1px solid var(--border)", borderRadius:"10px", padding:"4px", width:"fit-content" }}>
          {[{v:"reading",l:"📖 Currently Reading"},{v:"finished",l:"✅ Finished"}].map(s=>(
            <button key={s.v} type="button" onClick={()=>set("status",s.v)}
              style={{ padding:"9px 20px", borderRadius:"8px", fontSize:"13px", fontWeight:600,
                cursor:"pointer", border:"none", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
                background: form.status===s.v ? "var(--ink)" : "transparent",
                color: form.status===s.v ? "var(--amber-light)" : "var(--muted)",
              }}>{s.l}</button>
          ))}
        </div>
      </div>

      {/* Cover preview */}
      {form.cover_url && (
        <div style={{ marginBottom:"20px" }}>
          <CoverImage src={form.cover_url} alt={form.title} width={70} height={100} />
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px" }}>
        <FormField label="Book Title *" error={errors.title} style={{ gridColumn:"1/-1" }}>
          <Input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. The Alchemist" />
        </FormField>
        <FormField label="Author" style={{ gridColumn:"1/-1" }}>
          <Input value={form.author} onChange={e=>set("author",e.target.value)} placeholder="e.g. Paulo Coelho" />
        </FormField>

        {isReading ? (
          <FormField label="Started Reading">
            <Input type="date" value={form.date_started} onChange={e=>set("date_started",e.target.value)} />
          </FormField>
        ) : (
          <>
            <FormField label="Days to Finish *" error={errors.days}>
              <Input type="number" min="1" value={form.days} onChange={e=>set("days",e.target.value)} placeholder="7" />
            </FormField>
            <FormField label="Date Finished">
              <Input type="date" value={form.date_finished} onChange={e=>set("date_finished",e.target.value)} />
            </FormField>
          </>
        )}

        <FormField label="Genre">
          <Select value={form.genre} onChange={e=>set("genre",e.target.value)}>
            <option value="">Select genre…</option>
            {GENRES.map(g=><option key={g} value={g}>{g}</option>)}
          </Select>
        </FormField>

        {!isReading && (
          <FormField label="Rating">
            <div style={{ paddingTop:"8px" }}>
              <StarRating value={form.rating} onChange={v=>set("rating",v)} />
            </div>
          </FormField>
        )}

        <div style={{ gridColumn:"1/-1" }}>
          <CoverSearchField label="Cover Image" value={form.cover_url} onChange={v=>set("cover_url",v)}
            onFetch={handleFetchCover} fetching={fetchingCover} />
        </div>

        {!isReading && (
          <FormField label="How did it make you feel? *" error={errors.mood} style={{ gridColumn:"1/-1" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", paddingTop:"4px" }}>
              {MOODS.map(m=>(
                <button key={m.value} type="button" onClick={()=>set("mood",m.value)}
                  style={{ padding:"7px 14px", borderRadius:"20px", fontSize:"13px", cursor:"pointer",
                    border: form.mood===m.value ? `1.5px solid ${m.color}` : "1px solid var(--border-light)",
                    background: form.mood===m.value ? m.color+"18" : "var(--paper)",
                    color: form.mood===m.value ? m.color : "var(--muted)",
                    fontWeight: form.mood===m.value ? 600 : 400, transition:"all 0.15s",
                  }}>{m.label}</button>
              ))}
            </div>
            {errors.mood && <span style={{ fontSize:"12px", color:"var(--rust)" }}>{errors.mood}</span>}
          </FormField>
        )}

        <FormField label={isReading ? "Notes so far" : "Summary"} style={{ gridColumn:"1/-1" }}>
          <Textarea rows={4} value={form.summary} onChange={e=>set("summary",e.target.value)}
            placeholder={isReading ? "Thoughts so far?" : "What was this book about?"} />
        </FormField>
        {!isReading && (
          <FormField label="Personal Reflection" style={{ gridColumn:"1/-1" }}>
            <Textarea rows={4} value={form.reflection} onChange={e=>set("reflection",e.target.value)}
              placeholder="How did this book affect you? Favourite quotes?" />
          </FormField>
        )}
      </div>

      <div style={{ marginTop:"28px" }}>
        <Button type="submit" disabled={loading} size="lg" style={{ width:"100%" }}>
          {loading ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
