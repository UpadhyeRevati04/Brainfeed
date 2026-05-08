import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useBooks } from "../hooks/useData.js";
import { Card, PageHeader } from "../components/UI.jsx";
import BookForm from "../components/BookForm.jsx";

export default function AddBook() {
  const navigate = useNavigate();
  const { add } = useBooks();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true); setError(null);
    try { const b = await add(data); navigate(`/books/${b.id}`); }
    catch (e) { setError(e.message); setLoading(false); }
  };

  return (
    <div className="animate-fade-up">
      <Link to="/library" style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"13px", color:"var(--muted)", marginBottom:"16px" }}>
        <ArrowLeft size={14} /> Back to Library
      </Link>
      <PageHeader eyebrow="New entry" title="Log a Book" subtitle="Record a book you've read or are reading" />
      <Card style={{ maxWidth:"720px" }}>
        {error && <div style={{ background:"#fee", border:"1px solid var(--rust)", borderRadius:"8px", padding:"12px 16px", marginBottom:"20px", fontSize:"14px", color:"var(--rust)" }}>{error}</div>}
        <BookForm onSubmit={handleSubmit} loading={loading} submitLabel="Add to My Shelf" />
      </Card>
    </div>
  );
}
