import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../utils/api.js";
import { Card, PageHeader, Spinner } from "../components/UI.jsx";
import BookForm from "../components/BookForm.jsx";

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getBook(id).then(d=>{ setBook(d); setLoading(false); }).catch(()=>setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    setSaving(true); setError(null);
    try { await api.updateBook(id, data); navigate(`/books/${id}`); }
    catch (e) { setError(e.message); setSaving(false); }
  };

  if (loading) return <div style={{ display:"flex", justifyContent:"center", padding:"80px" }}><Spinner size={28} /></div>;
  if (!book) return <div style={{ padding:"40px", textAlign:"center", color:"var(--muted)" }}>Book not found.</div>;

  return (
    <div className="animate-fade-up">
      <Link to={`/books/${id}`} style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"13px", color:"var(--muted)", marginBottom:"16px" }}>
        <ArrowLeft size={14} /> Back
      </Link>
      <PageHeader eyebrow="Editing" title={`Edit: ${book.title}`} />
      <Card style={{ maxWidth:"720px" }}>
        {error && <div style={{ background:"#fee", border:"1px solid var(--rust)", borderRadius:"8px", padding:"12px 16px", marginBottom:"20px", fontSize:"14px", color:"var(--rust)" }}>{error}</div>}
        <BookForm initialValues={book} onSubmit={handleSubmit} loading={saving} submitLabel="Save Changes" />
      </Card>
    </div>
  );
}
