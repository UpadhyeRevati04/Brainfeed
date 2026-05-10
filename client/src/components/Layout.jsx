import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Library, PlusCircle, Headphones, Film, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import styles from "./Layout.module.css";

const navGroups = [
  { label: "Overview",
    items: [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", cls: "dash" }] },
  { label: "Books",
    items: [
      { to: "/library",   icon: Library,   label: "My Library",   cls: "books" },
      { to: "/add-book",  icon: PlusCircle, label: "Log a Book",  cls: "books" },
    ] },
  { label: "Podcasts",
    items: [
      { to: "/podcasts",     icon: Headphones, label: "Podcasts",      cls: "podcasts" },
      { to: "/add-podcast",  icon: PlusCircle, label: "Log a Podcast", cls: "podcasts" },
    ] },
  { label: "Movies & Series",
    items: [
      { to: "/media",     icon: Film,      label: "Watch List", cls: "media" },
      { to: "/add-media", icon: PlusCircle, label: "Log Media", cls: "media" },
    ] },
];

const dotColors = { books: "var(--amber)", podcasts: "var(--teal)", media: "var(--rose)" };

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🧠</span> Brainfeed
        </div>

        {navGroups.map(group => (
          <div key={group.label} className={styles.navSection}>
            <div className={styles.navSectionLabel}>{group.label}</div>
            {group.items.map(({ to, icon: Icon, label, cls }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? `${styles.navItemActive} ${styles[cls]}` : ""}`
                }>
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
                {cls !== "dash" && location.pathname === to && (
                  <span className={styles.navDot}
                    style={{ background: dotColors[cls] || "var(--amber)" }} />
                )}
              </NavLink>
            ))}
          </div>
        ))}

        <div className={styles.sidebarUser}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className={styles.userMeta}>
              <p className={styles.userName}>{user?.name || "User"}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
            <LogOut size={15} strokeWidth={1.8} />
          </button>
        </div>
      </aside>

      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className={styles.topbarBrand}><span>🧠</span> Brainfeed</div>
          <button className={styles.topbarLogout} onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </header>
        <main className={styles.content}><Outlet /></main>
      </div>
    </div>
  );
}