import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.logo}>🧠</div>
        <h1 style={styles.brand}>Brainfeed</h1>
        <p style={styles.sub}>Create your account — it's free</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
          {[
            { k: "name",     label: "Your Name",       type: "text",     ph: "e.g. Arjun" },
            { k: "email",    label: "Email",            type: "email",    ph: "you@example.com" },
            { k: "password", label: "Password",         type: "password", ph: "Min. 6 characters" },
            { k: "confirm",  label: "Confirm Password", type: "password", ph: "Repeat password" },
          ].map(({ k, label, type, ph }) => (
            <div key={k} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input style={styles.input} type={type} placeholder={ph}
                value={form[k]} onChange={e => set(k, e.target.value)} required />
            </div>
          ))}
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p style={styles.foot}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--amber)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  shell: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", padding: "20px" },
  card:  { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "44px 40px", width: "100%", maxWidth: "420px", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  logo:  { fontSize: "3rem", marginBottom: "4px" },
  brand: { fontFamily: "'Lora', serif", fontSize: "1.8rem", color: "var(--ink)", marginBottom: "4px" },
  sub:   { fontSize: "14px", color: "var(--muted)", marginBottom: "24px" },
  error: { width: "100%", padding: "10px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#dc2626", marginBottom: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px", width: "100%" },
  label: { fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600 },
  input: { padding: "11px 14px", border: "1.5px solid var(--border)", borderRadius: "8px", fontSize: "14px", background: "var(--paper)", color: "var(--ink)", outline: "none", width: "100%", fontFamily: "'DM Sans', sans-serif" },
  btn:   { width: "100%", padding: "13px", background: "var(--ink)", color: "var(--amber-light)", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer", marginTop: "8px", fontFamily: "'DM Sans', sans-serif" },
  foot:  { marginTop: "24px", fontSize: "13px", color: "var(--muted)" },
};