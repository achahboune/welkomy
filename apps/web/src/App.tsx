import { useState } from "react";
import { BarChart3, BookOpen, Building2, ChevronDown, CircleHelp, Globe2, LayoutDashboard, Plus, QrCode, Settings, ShieldCheck, Sparkles, Users, Wifi, MapPin, Copy, ExternalLink, MoreHorizontal } from "lucide-react";

type Property = { name: string; location: string; guests: number; status: "Published" | "Draft"; accent: string };

const initialProperties: Property[] = [
  { name: "Dar Jasmine", location: "Tangier, Morocco", guests: 8, status: "Published", accent: "terracotta" },
  { name: "The Medina Loft", location: "Tangier, Morocco", guests: 4, status: "Published", accent: "sage" },
  { name: "Coastal Escape", location: "Asilah, Morocco", guests: 6, status: "Draft", accent: "blue" },
];

export default function App() {
  const [properties, setProperties] = useState(initialProperties);
  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState("");

  function addProperty() {
    const name = window.prompt("Property name");
    if (!name?.trim()) return;
    setProperties((items) => [...items, { name: name.trim(), location: "Add your location", guests: 0, status: "Draft", accent: "blue" }]);
    setNotice("Property added to this demo. Connect the database to save it permanently.");
  }

  const nav = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "My properties", icon: Building2 },
    { label: "Guest guides", icon: BookOpen },
    { label: "QR codes", icon: QrCode },
    { label: "Guest insights", icon: BarChart3 },
  ];

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#"><span className="brand-mark">w.</span><span>welkomy</span></a>
      <div className="workspace-label">WORKSPACE</div>
      <button className="workspace-switch"><span className="workspace-avatar">A</span><span><b>Alaya Stays</b><small>Free workspace</small></span><ChevronDown size={16} /></button>
      <div className="nav-label">MENU</div>
      <nav>{nav.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${active === label ? "active" : ""}`} onClick={() => setActive(label)}><Icon size={18} />{label}</button>)}</nav>
      <div className="nav-label tools-label">PREFERENCES</div>
      <nav>
        <button className={`nav-item ${active === "Team" ? "active" : ""}`} onClick={() => setActive("Team")}><Users size={18} />Team</button>
        <button className={`nav-item ${active === "Settings" ? "active" : ""}`} onClick={() => setActive("Settings")}><Settings size={18} />Settings</button>
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>Need a hand?</b><p>Explore our quick guide to get the most out of Welkomy.</p><button onClick={() => setNotice("Help centre will be available soon.")}>Visit help centre <ExternalLink size={13}/></button></div><div className="profile"><div className="profile-avatar">AC</div><div><b>Account Owner</b><small>owner@welkomy.app</small></div><MoreHorizontal size={18}/></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div><div className="top-actions"><button className="language-button"><Globe2 size={16}/> EN <ChevronDown size={14}/></button><button className="upgrade-button" onClick={() => setNotice("Plans will be introduced after the MVP validation.")}><Sparkles size={15}/> Upgrade plan</button><div className="top-avatar">AC</div></div></header>
      <div className="page-wrap">
        <section className="welcome-row"><div><div className="eyebrow">MONDAY, NOVEMBER 9, 2026</div><h1>Good morning, Alaya <span>✳</span></h1><p className="subtitle">Here’s what’s happening with your guest experience.</p></div><button className="primary-button" onClick={addProperty}><Plus size={17}/> Add a property</button></section>
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
        <section className="stats-grid">
          <article className="stat-card"><div className="stat-top"><span>Total properties</span><Building2 size={18}/></div><div className="stat-number">{properties.length.toString().padStart(2, "0")}</div><div className="stat-foot"><span className="stat-dot green"></span> Your spaces in one place</div></article>
          <article className="stat-card"><div className="stat-top"><span>Published guides</span><BookOpen size={18}/></div><div className="stat-number">{properties.filter(p => p.status === "Published").length.toString().padStart(2, "0")}</div><div className="stat-foot"><span className="stat-dot green"></span> Ready to welcome guests</div></article>
          <article className="stat-card"><div className="stat-top"><span>Guest guide visits</span><BarChart3 size={18}/></div><div className="stat-number">—</div><div className="stat-foot muted">Analytics will appear after launch</div></article>
          <article className="stat-card"><div className="stat-top"><span>Guest capacity</span><Users size={18}/></div><div className="stat-number">{properties.reduce((sum, p) => sum + p.guests, 0)}</div><div className="stat-foot muted">Across all your properties</div></article>
        </section>
        <section className="section-heading"><div><h2>Your properties</h2><p>Manage your spaces and the guides your guests see.</p></div><button className="text-button" onClick={() => setActive("My properties")}>View all properties <span>→</span></button></section>
        <section className="property-grid">{properties.map((property, index) => <article className="property-card" key={`${property.name}-${index}`}><div className={`property-cover ${property.accent}`}><div className="cover-top"><span className="cover-tag"><span className={`status-dot ${property.status === "Published" ? "published" : "draft"}`}></span>{property.status}</span><button className="more-button" aria-label="More options"><MoreHorizontal size={18}/></button></div><div className="cover-illustration"><div className="sun"></div><div className="building-shape"><div className="window one"></div><div className="window two"></div><div className="door"></div></div><div className="plant">✳</div></div><div className="cover-caption">{property.name}</div></div><div className="property-details"><div><h3>{property.name}</h3><p><MapPin size={14}/>{property.location}</p></div><div className="guest-count"><Users size={15}/>{property.guests} guests</div></div><div className="property-footer"><button className="guide-link" onClick={() => setNotice("Guest guide preview is a planned next milestone.")}><BookOpen size={15}/> Open guide</button><button className="icon-action" aria-label="Copy guide link" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/guide/${index + 1}`); setNotice("Demo guide link copied (not a published guest URL)."); }}><Copy size={15}/></button><button className="icon-action" aria-label="QR code"><QrCode size={16}/></button></div></article>)}<button className="add-property-card" onClick={addProperty}><span><Plus size={22}/></span><b>Add a new property</b><small>Start creating a memorable stay</small></button></section>
        <section className="bottom-grid"><article className="setup-card"><div className="setup-icon"><ShieldCheck size={19}/></div><div><h3>Your workspace is taking shape</h3><p>This is the first dashboard preview. Next we’ll connect secure accounts, property storage and real guest guide publishing.</p><div className="progress-track"><span></span></div><small>Foundation preview · data is currently local demo state</small></div></article><article className="tip-card"><div className="tip-icon"><Wifi size={18}/></div><div><span className="eyebrow">A GOOD FIRST STEP</span><h3>Make check-in effortless</h3><p>Add Wi-Fi, arrival instructions and emergency contacts to each guest guide.</p></div></article></section>
        <footer>© 2026 Welkomy <span>Made for better stays.</span></footer>
      </div>
    </main>
  </div>;
}
