import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { BookOpen, LayoutDashboard, Library, PlusCircle, Headphones, Film, Menu, X } from "lucide-react";
import styles from "./Layout.module.css";

const navGroups = [
  {
    label: "Overview",
    items: [{ to:"/dashboard", icon:LayoutDashboard, label:"Dashboard", cls:"dash" }],
  },
  {
    label: "Books",
    items: [
      { to:"/library",  icon:Library,   label:"My Library", cls:"books" },
      { to:"/add-book", icon:PlusCircle, label:"Log a Book",  cls:"books" },
    ],
  },
  {
    label: "Podcasts",
    items: [
      { to:"/podcasts",     icon:Headphones, label:"Podcasts",       cls:"podcasts" },
      { to:"/add-podcast",  icon:PlusCircle, label:"Log a Podcast",  cls:"podcasts" },
    ],
  },
  {
    label: "Movies & Series",
    items: [
      { to:"/media",     icon:Film,      label:"Watch List",    cls:"media" },
      { to:"/add-media", icon:PlusCircle, label:"Log Media",    cls:"media" },
    ],
  },
];

const dotColors = { books:"var(--amber)", podcasts:"var(--teal)", media:"var(--rose)" };

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  React.useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>📚</span> Feed
        </div>

        {navGroups.map(group => (
          <div key={group.label} className={styles.navSection}>
            <div className={styles.navSectionLabel}>{group.label}</div>
            {group.items.map(({ to, icon:Icon, label, cls }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? `${styles.navItemActive} ${styles[cls]}` : ""}`
                }
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
                {cls !== "dash" && location.pathname === to && (
                  <span className={styles.navDot} style={{ background: dotColors[cls] || "var(--amber)" }} />
                )}
              </NavLink>
            ))}
          </div>
        ))}

        <div className={styles.sidebarFooter}>
          <p>Track every moment,<br /><em>own every story.</em></p>
        </div>
      </aside>

      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setMobileOpen(v=>!v)}>
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
          <div className={styles.topbarBrand}><BookOpen size={18} strokeWidth={1.8}/> Shelf</div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
