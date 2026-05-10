import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
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
        <p style={styles.sub}>Welcome back — sign in to continue</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set("email", e.target.value)} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={form.password} onChange={e => set("password", e.target.value)} required />
          </div>
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p style={styles.foot}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--amber)", fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  shell: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", padding: "20px" },
  card:  { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "44px 40px", width: "100%", maxWidth: "400px", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  logo:  { fontSize: "3rem", marginBottom: "4px" },
  brand: { fontFamily: "'Lora', serif", fontSize: "1.8rem", color: "var(--ink)", marginBottom: "4px" },
  sub:   { fontSize: "14px", color: "var(--muted)", marginBottom: "24px" },
  error: { width: "100%", padding: "10px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#dc2626", marginBottom: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px", width: "100%" },
  label: { fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600 },
  input: { padding: "11px 14px", border: "1.5px solid var(--border)", borderRadius: "8px", fontSize: "14px", background: "var(--paper)", color: "var(--ink)", outline: "none", width: "100%", fontFamily: "'DM Sans', sans-serif" },
  btn:   { width: "100%", padding: "13px", background: "var(--ink)", color: "var(--amber-light)", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer", marginTop: "8px", fontFamily: "'DM Sans', sans-serif" },
  foot:  { marginTop: "24px", fontSize: "13px", color: "var(--muted)" },
};