import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PlusCircle, Target, BookOpen, Clock, Headphones, Film, BookMarked, Zap } from "lucide-react";
import { useStats, useSettings } from "../hooks/useData.js";
import { Card, Button, PageHeader, Spinner, Modal, Input, Badge, CoverImage } from "../components/UI.jsx";
import { MONTHS, SPINE_COLORS } from "../utils/constants.js";

const YEAR = new Date().getFullYear();
const PIE_COLORS = ["#c8882a","#a84030","#4e7458","#6e5f88","#3a7a80","#a07040","#c04830","#4a6888"];

function GoalRing({ current, goal }) {
  const pct = goal > 0 ? Math.min(current / goal, 1) : 0;
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
      <circle cx="64" cy="64" r={r} fill="none" stroke="var(--amber-light)" strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - pct * circ}
        transform="rotate(-90 64 64)" style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
      <text x="64" y="60" textAnchor="middle" fill="white" fontSize="22" fontFamily="Lora,serif" fontWeight="700">{current}</text>
      <text x="64" y="78" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="12" fontFamily="DM Sans,sans-serif">of {goal||"?"}</text>
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "var(--amber)", link }) {
  const [hov, setHov] = useState(false);
  const inner = (
    <Card style={{ display:"flex", alignItems:"center", gap:"16px", transition:"all 0.22s", cursor: link ? "pointer" : "default",
      transform: hov && link ? "translateY(-3px)" : "none", boxShadow: hov && link ? "var(--shadow)" : "var(--shadow-sm)" }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ width:44, height:44, borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center",
        background: color+"18", color, flexShrink:0, transition:"transform 0.22s",
        transform: hov ? "scale(1.08) rotate(-4deg)" : "scale(1)" }}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:"1.7rem", fontFamily:"Lora,serif", fontWeight:700, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:"12px", color:"var(--muted)", marginTop:"3px" }}>{label}</div>
        {sub && <div style={{ fontSize:"11px", color, marginTop:"2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"150px" }}>{sub}</div>}
      </div>
    </Card>
  );
  return link ? <Link to={link} style={{ textDecoration:"none" }}>{inner}</Link> : inner;
}

function daysAgo(d) {
  if (!d) return null;
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Started today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

export default function Dashboard() {
  const { stats, loading } = useStats(YEAR);
  const { settings, updateSettings } = useSettings();
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalVal, setGoalVal] = useState("");

  const goal = parseInt(settings.reading_goal) || 0;
  const booksRead = stats?.totalBooks || 0;

  const monthData = MONTHS.map((m, i) => {
    const found = stats?.byMonth?.find(x => parseInt(x.month) === i + 1);
    return { month: m, books: found?.count || 0 };
  });

  const saveGoal = async () => {
    const v = parseInt(goalVal);
    if (v > 0) await updateSettings({ reading_goal: v });
    setGoalOpen(false);
  };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"80px" }}><Spinner size={32} /></div>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow={`${YEAR} overview`} title="Dashboard"
        subtitle="Everything you've consumed at a glance"
        action={<Link to="/add-book"><Button><PlusCircle size={16} /> Log a Book</Button></Link>}
      />

      {/* Currently Reading */}
      {stats?.currentlyReading?.length > 0 && (
        <div style={{ marginBottom:"28px" }}>
          <p style={{ fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase", color:"var(--sage)", fontWeight:600, marginBottom:"12px" }}>📖 Currently Reading</p>
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
            {stats.currentlyReading.map(b => {
              const spineColor = SPINE_COLORS[Math.abs((b.id||"").charCodeAt(0)) % SPINE_COLORS.length];
              return (
                <Link key={b.id} to={`/books/${b.id}`} style={{ textDecoration:"none" }}>
                  <Card hover glow="var(--shadow-glow-sage)"
                    style={{ display:"flex", gap:"12px", alignItems:"center", padding:"14px 18px", border:`1.5px solid ${spineColor}40` }}>
                    <CoverImage src={b.cover_url} alt={b.title} width={40} height={55} radius={6} accentColor={spineColor} />
                    <div>
                      <p style={{ fontFamily:"'Lora',serif", fontSize:"0.9rem", fontWeight:600, maxWidth:"150px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.title}</p>
                      <p style={{ fontSize:"11px", color:"var(--sage)", marginTop:"3px" }}>{daysAgo(b.date_started)}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Goal Banner */}
      <div style={{ background:"var(--ink)", borderRadius:"var(--radius-lg)", padding:"28px 32px",
        display:"flex", alignItems:"center", gap:"32px", flexWrap:"wrap",
        marginBottom:"28px", boxShadow:"var(--shadow-lg)", position:"relative", overflow:"hidden" }}>
        {/* subtle glow decoration */}
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200,
          borderRadius:"50%", background:"rgba(200,136,42,0.06)", pointerEvents:"none" }} />
        <GoalRing current={booksRead} goal={goal} />
        <div style={{ flex:1, minWidth:"180px" }}>
          <p style={{ fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:"6px" }}>Book Goal {YEAR}</p>
          <h2 style={{ fontFamily:"Lora,serif", fontSize:"2rem", color:"white", marginBottom:"8px" }}>
            {booksRead} <span style={{ fontSize:"1rem", color:"rgba(255,255,255,0.35)" }}>/ {goal||"—"} books</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"14px" }}>
            {goal===0 ? "Set your yearly goal →"
              : booksRead>=goal ? "🎉 Goal achieved! Keep going!"
              : `${Math.max(goal-booksRead,0)} more to reach your goal`}
          </p>
        </div>
        <button onClick={()=>{ setGoalVal(goal||""); setGoalOpen(true); }}
          style={{ padding:"11px 20px", background:"transparent", border:"1px solid rgba(255,255,255,0.18)",
            borderRadius:"10px", color:"rgba(255,255,255,0.65)", fontSize:"14px", cursor:"pointer",
            fontFamily:"DM Sans,sans-serif", display:"flex", alignItems:"center", gap:"8px",
            transition:"all 0.2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--amber-light)"; e.currentTarget.style.color="var(--amber-light)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.18)"; e.currentTarget.style.color="rgba(255,255,255,0.65)"; }}>
          <Target size={16} /> {goal ? "Edit Goal" : "Set Goal"}
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(185px, 1fr))", gap:"14px", marginBottom:"28px" }} className="stagger">
        <StatCard icon={BookOpen}   label="Books Finished"     value={stats?.totalBooks||0}      color="var(--amber)"   link="/library" />
        <StatCard icon={BookMarked} label="Currently Reading"  value={stats?.totalReading||0}     color="var(--sage)"    link="/library" />
        <StatCard icon={Headphones} label="Podcasts Logged"    value={stats?.totalPodcasts||0}    color="var(--teal)"    link="/podcasts" />
        <StatCard icon={Film}       label="Movies & Series"    value={stats?.totalMedia||0}       color="var(--rose)"    link="/media" />
        <StatCard icon={Clock}      label="Avg. Days / Book"   value={stats?.avgDays||"—"}        color="var(--lavender)" />
        <StatCard icon={Zap}        label="Fastest Read"       value={stats?.fastestBook ? `${stats.fastestBook.days}d` : "—"} sub={stats?.fastestBook?.title} color="var(--teal)" />
      </div>

      {/* Charts Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"24px" }}>
        <Card>
          <h3 style={{ fontFamily:"Lora,serif", fontSize:"1rem", marginBottom:"20px", fontStyle:"italic" }}>Books per Month</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthData} barSize={14}>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize:10, fill:"var(--muted)" }} axisLine={false} tickLine={false} width={18} />
              <Tooltip contentStyle={{ background:"var(--ink)", border:"none", borderRadius:"8px", fontSize:"12px" }}
                labelStyle={{ color:"var(--amber-light)", fontFamily:"Lora,serif" }}
                itemStyle={{ color:"rgba(255,255,255,0.8)" }} cursor={{ fill:"rgba(200,136,42,0.06)" }} />
              <Bar dataKey="books" fill="var(--amber)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ fontFamily:"Lora,serif", fontSize:"1rem", marginBottom:"20px", fontStyle:"italic" }}>Reading Moods</h3>
          {stats?.byMood?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={stats.byMood} dataKey="count" nameKey="mood" cx="50%" cy="50%" outerRadius={68} innerRadius={34}>
                  {stats.byMood.map((e,i) => <Cell key={e.mood} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:"var(--ink)", border:"none", borderRadius:"8px", fontSize:"12px" }}
                  labelStyle={{ color:"var(--amber-light)" }} itemStyle={{ color:"rgba(255,255,255,0.8)" }}
                  formatter={(v,n) => [v+" books", n]} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize:"11px", color:"var(--muted)" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:180, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--muted)", fontSize:"14px", fontStyle:"italic" }}>
              Finish books to see mood data
            </div>
          )}
        </Card>
      </div>

      {/* Genre breakdown */}
      {stats?.byGenre?.length > 0 && (
        <Card style={{ marginBottom:"24px" }}>
          <h3 style={{ fontFamily:"Lora,serif", fontSize:"1rem", marginBottom:"16px", fontStyle:"italic" }}>Genre Breakdown</h3>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
            {stats.byGenre.map((g,i) => (
              <div key={g.genre} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{ width:10, height:10, borderRadius:"2px", background:PIE_COLORS[i%PIE_COLORS.length] }} />
                <span style={{ fontSize:"13px" }}>{g.genre}</span>
                <Badge color={PIE_COLORS[i%PIE_COLORS.length]} bg={PIE_COLORS[i%PIE_COLORS.length]+"18"}>{g.count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent across all types */}
      {stats?.recentActivity?.length > 0 && (
        <Card>
          <h3 style={{ fontFamily:"Lora,serif", fontSize:"1rem", marginBottom:"16px", fontStyle:"italic" }}>Recent Activity</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {stats.recentActivity.map(item => (
              <div key={item.id+item.type} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 0",
                borderBottom:"1px solid var(--border-light)" }}>
                <CoverImage src={item.cover_url} alt={item.title} width={36} height={50} radius={6}
                  fallbackEmoji={item.type==="podcast"?"🎙️":item.type==="media"?"🎬":"📚"}
                  accentColor={item.type==="podcast"?"var(--teal)":item.type==="media"?"var(--rose)":"var(--amber)"} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:"'Lora',serif", fontSize:"0.9rem", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.title}</p>
                  <p style={{ fontSize:"11px", color:"var(--muted)" }}>{item.date}</p>
                </div>
                <Badge color={item.type==="podcast"?"var(--teal)":item.type==="media"?"var(--rose)":"var(--amber)"}
                  bg={item.type==="podcast"?"var(--teal-pale)":item.type==="media"?"var(--rose-pale)":"var(--amber-pale)"}>
                  {item.type==="podcast"?"🎙️":item.type==="media"?"🎬":"📚"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={goalOpen} onClose={()=>setGoalOpen(false)} title={`Set Reading Goal for ${YEAR}`}>
        <p style={{ fontSize:"14px", color:"var(--muted)", marginBottom:"16px" }}>How many books do you want to finish this year?</p>
        <Input type="number" min="1" max="365" value={goalVal} onChange={e=>setGoalVal(e.target.value)}
          placeholder="e.g. 24" style={{ fontSize:"1.4rem", textAlign:"center", padding:"14px", marginBottom:"16px" }}
          onKeyDown={e=>e.key==="Enter"&&saveGoal()} autoFocus />
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={()=>setGoalOpen(false)} style={{ flex:"none", padding:"11px 16px", background:"transparent", border:"1px solid var(--border)", borderRadius:"10px", cursor:"pointer", color:"var(--muted)", fontSize:"14px" }}>Cancel</button>
          <Button onClick={saveGoal} style={{ flex:1 }}>Save Goal</Button>
        </div>
      </Modal>
    </div>
  );
}
