import React, { useState, useRef, useEffect } from "react";

// ── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "md", className = "", style = {}, ...props }) {
  const [pressed, setPressed] = useState(false);
  const variants = {
    primary:   { background: "var(--ink)", color: "var(--amber-light)", border: "none" },
    secondary: { background: "var(--cream)", color: "var(--ink)", border: "1px solid var(--border)" },
    ghost:     { background: "transparent", color: "var(--muted)", border: "1px solid var(--border-light)" },
    danger:    { background: "var(--rust)", color: "#fff", border: "none" },
    sage:      { background: "var(--sage)", color: "#fff", border: "none" },
    teal:      { background: "var(--teal)", color: "#fff", border: "none" },
    rose:      { background: "var(--rose)", color: "#fff", border: "none" },
  };
  const sizes = {
    sm: { padding: "7px 14px", fontSize: "13px", borderRadius: "8px" },
    md: { padding: "10px 20px", fontSize: "14px", borderRadius: "10px" },
    lg: { padding: "14px 28px", fontSize: "15px", borderRadius: "12px" },
  };
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
        fontFamily: "'DM Sans',sans-serif", fontWeight: 500, cursor: "pointer",
        transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        opacity: props.disabled ? 0.55 : 1,
        ...variants[variant], ...sizes[size], ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, hover = false, glow, className = "", style = {}, onClick, ...props }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: "var(--card)", border: "1px solid var(--border-light)",
        borderRadius: "var(--radius)", padding: "22px",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        cursor: onClick ? "pointer" : "default",
        boxShadow: hovered && hover ? (glow || "var(--shadow)") : "var(--shadow-sm)",
        transform: hovered && hover ? "translateY(-3px)" : "translateY(0)",
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

// ── CoverImage ───────────────────────────────────────────────────────────────
export function CoverImage({ src, alt, width = 80, height = 110, radius = 8, fallbackEmoji = "📚", accentColor = "var(--amber)" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);
  return (
    <div style={{
      width, height, borderRadius: radius, overflow: "hidden", flexShrink: 0,
      background: "var(--cream)", position: "relative",
      border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)",
    }}>
      {src && !error ? (
        <>
          {!loaded && <div className="img-skeleton" style={{ position:"absolute", inset:0 }} />}
          <img
            src={src} alt={alt}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", display: loaded ? "block" : "none",
              transition: "opacity 0.3s ease", opacity: loaded ? 1 : 0 }}
          />
        </>
      ) : (
        <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center",
          background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
          fontSize: width > 60 ? "2rem" : "1.2rem" }}>
          {fallbackEmoji}
        </div>
      )}
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────
export function FormField({ label, error, hint, children, style = {} }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"6px", ...style }}>
      {label && <label style={{ fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", color:"var(--muted)", fontWeight:600 }}>{label}</label>}
      {children}
      {hint  && !error && <span style={{ fontSize:"12px", color:"var(--muted)", fontStyle:"italic" }}>{hint}</span>}
      {error && <span style={{ fontSize:"12px", color:"var(--rust)" }}>{error}</span>}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ ...props }) {
  const [f, setF] = useState(false);
  return (
    <input style={{ padding:"10px 12px", border:`1.5px solid ${f?"var(--amber)":"var(--border)"}`,
      borderRadius:"var(--radius-sm)", fontSize:"14px", background:"var(--paper)",
      color:"var(--ink)", outline:"none", width:"100%", transition:"border-color 0.18s",
      boxShadow: f ? "0 0 0 3px rgba(200,136,42,0.08)" : "none",
    }} onFocus={()=>setF(true)} onBlur={()=>setF(false)} {...props} />
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ rows=4, ...props }) {
  const [f, setF] = useState(false);
  return (
    <textarea rows={rows} style={{ padding:"10px 12px", border:`1.5px solid ${f?"var(--amber)":"var(--border)"}`,
      borderRadius:"var(--radius-sm)", fontSize:"14px", background:"var(--paper)", color:"var(--ink)",
      outline:"none", width:"100%", resize:"vertical", fontFamily:"'DM Sans',sans-serif",
      transition:"border-color 0.18s", lineHeight:1.65,
      boxShadow: f ? "0 0 0 3px rgba(200,136,42,0.08)" : "none",
    }} onFocus={()=>setF(true)} onBlur={()=>setF(false)} {...props} />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ children, ...props }) {
  return (
    <select style={{ padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:"var(--radius-sm)",
      fontSize:"14px", background:"var(--paper)", color:"var(--ink)", outline:"none", width:"100%", cursor:"pointer",
      transition:"border-color 0.18s",
    }} {...props}>{children}</select>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color="var(--amber)", bg="var(--amber-pale)", size="sm" }) {
  return (
    <span style={{ display:"inline-block", padding: size==="lg" ? "5px 14px" : "3px 10px",
      borderRadius:"20px", fontSize: size==="lg" ? "13px" : "11px", fontWeight:500, color, background:bg,
      whiteSpace:"nowrap",
    }}>{children}</span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size=24 }) {
  return <div style={{ width:size, height:size, border:"2px solid var(--border)", borderTopColor:"var(--amber)",
    borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />;
}

// ── PageHeader ─────────────────────────────────────────────────────────────────
export function PageHeader({ eyebrow, title, subtitle, action, accentColor = "var(--amber)" }) {
  return (
    <div style={{ marginBottom:"32px" }}>
      {eyebrow && <p style={{ fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase",
        color: accentColor, fontWeight:600, marginBottom:"8px" }}>{eyebrow}</p>}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:"16px", flexWrap:"wrap" }}>
        <div>
          <h1 style={{ fontSize:"clamp(1.6rem,4vw,2.2rem)" }}>{title}</h1>
          {subtitle && <p style={{ color:"var(--muted)", marginTop:"6px", fontSize:"14px" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, message, action }) {
  return (
    <div style={{ textAlign:"center", padding:"72px 24px", color:"var(--muted)" }} className="animate-fade-in">
      <div style={{ fontSize:"3.5rem", marginBottom:"16px", animation:"float 3s ease-in-out infinite" }}>{icon}</div>
      <h3 style={{ fontFamily:"'Lora',serif", fontSize:"1.2rem", color:"var(--ink-light)", marginBottom:"8px" }}>{title}</h3>
      <p style={{ fontSize:"14px", marginBottom:"24px", maxWidth:"320px", margin:"0 auto 24px" }}>{message}</p>
      {action}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = "400px" }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex",
      alignItems:"center", justifyContent:"center", padding:"20px", zIndex:200,
      animation:"fadeIn 0.2s ease", backdropFilter:"blur(3px)",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"var(--card)", borderRadius:"var(--radius-lg)", padding:"28px",
        width:"100%", maxWidth:width, border:"1px solid var(--border)", boxShadow:"var(--shadow-lg)",
        animation:"scaleIn 0.22s cubic-bezier(.4,0,.2,1)",
      }}>
        {title && <h2 style={{ fontFamily:"'Lora',serif", fontSize:"1.3rem", marginBottom:"20px" }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

// ── StarRating ────────────────────────────────────────────────────────────────
export function StarRating({ value, onChange, readonly=false, size=20 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:"flex", gap:"3px" }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          onClick={() => !readonly && onChange?.(s===value ? 0 : s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ fontSize:size, cursor:readonly?"default":"pointer",
            color: s<=(hover||value) ? "var(--amber)" : "var(--border)",
            transition:"color 0.12s, transform 0.12s",
            transform: !readonly && s<=(hover||value) ? "scale(1.15)" : "scale(1)",
            display:"inline-block",
          }}>★</span>
      ))}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:"4px", background:"var(--cream)", border:"1px solid var(--border)",
      borderRadius:"12px", padding:"4px", marginBottom:"24px", flexWrap:"wrap",
    }}>
      {tabs.map(t => (
        <button key={t.value} onClick={() => onChange(t.value)}
          style={{ flex:1, minWidth:"100px", padding:"10px 12px", border:"none", borderRadius:"9px",
            fontFamily:"'DM Sans',sans-serif", fontSize:"13px", fontWeight:500,
            cursor:"pointer", transition:"all 0.2s",
            background: active===t.value ? "var(--ink)" : "transparent",
            color: active===t.value ? (t.activeColor||"var(--amber-light)") : "var(--muted)",
            transform: active===t.value ? "none" : "none",
          }}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}

// ── CoverSearch ───────────────────────────────────────────────────────────────
export function CoverSearchField({ label, value, onChange, onFetch, fetching, accentColor="var(--amber)" }) {
  return (
    <FormField label={label} hint="Paste a URL or auto-fetch below">
      <div style={{ display:"flex", gap:"8px" }}>
        <Input value={value} onChange={e=>onChange(e.target.value)} placeholder="https://… or leave blank to auto-fetch" />
        <button type="button" onClick={onFetch} disabled={fetching}
          style={{ padding:"10px 14px", background: accentColor, color:"#fff", border:"none",
            borderRadius:"var(--radius-sm)", cursor:"pointer", fontSize:"12px", fontWeight:600,
            whiteSpace:"nowrap", opacity: fetching ? 0.6 : 1, transition:"opacity 0.18s",
            fontFamily:"'DM Sans',sans-serif",
          }}>
          {fetching ? "…" : "Auto-fetch"}
        </button>
      </div>
    </FormField>
  );
}

// ── TagInput ──────────────────────────────────────────────────────────────────
export function TagInput({ tags=[], onChange, placeholder="Add tag…", color="var(--teal)" }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };
  return (
    <div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"8px" }}>
        {tags.map(t => (
          <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:"5px",
            padding:"4px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:500,
            background: color+"18", color, border:`1px solid ${color}40`,
          }}>
            {t}
            <span onClick={() => onChange(tags.filter(x=>x!==t))}
              style={{ cursor:"pointer", fontSize:"14px", lineHeight:1, opacity:0.7 }}>×</span>
          </span>
        ))}
      </div>
      <div style={{ display:"flex", gap:"8px" }}>
        <Input value={input} onChange={e=>setInput(e.target.value)} placeholder={placeholder}
          onKeyDown={e=>{ if(e.key==="Enter"){e.preventDefault();add();} }} />
        <button type="button" onClick={add}
          style={{ padding:"10px 14px", background:color, color:"#fff", border:"none",
            borderRadius:"var(--radius-sm)", cursor:"pointer", fontSize:"13px", fontWeight:600,
            fontFamily:"'DM Sans',sans-serif",
          }}>Add</button>
      </div>
    </div>
  );
}
