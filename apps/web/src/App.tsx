import { useEffect, useState, type FormEvent } from "react";
import { BarChart3, BookOpen, Building2, ChevronDown, CircleHelp, Globe2, LayoutDashboard, Plus, QrCode, Settings, ShieldCheck, Sparkles, Users, Wifi, MapPin, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";

type Property = {
  id: string;
  name: string;
  location: string;
  guests: number;
  status: "Published" | "Draft";
  accent: string;
};

type PropertyForm = { name: string; location: string; guests: string };

const STORAGE_KEY = "welkomy.properties.v1";
const initialProperties: Property[] = [
  { id: "demo-dar-jasmine", name: "Dar Jasmine", location: "Tangier, Morocco", guests: 8, status: "Published", accent: "terracotta" },
  { id: "demo-medina-loft", name: "The Medina Loft", location: "Tangier, Morocco", guests: 4, status: "Published", accent: "sage" },
  { id: "demo-coastal-escape", name: "Coastal Escape", location: "Asilah, Morocco", guests: 6, status: "Draft", accent: "blue" },
];

function loadProperties(): Property[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialProperties;
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return initialProperties;
    return parsed as Property[];
  } catch {
    return initialProperties;
  }
}

const emptyForm: PropertyForm = { name: "", location: "", guests: "2" };

export default function App() {
  const [properties, setProperties] = useState<Property[]>(loadProperties);
  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    } catch {
      setNotice("Unable to save in this browser. Check available storage and browser permissions.");
    }
  }, [properties]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
    setMenuFor(null);
  }

  function openEditForm(property: Property) {
    setEditingId(property.id);
    setForm({ name: property.name, location: property.location, guests: String(property.guests) });
    setFormError("");
    setModalOpen(true);
    setMenuFor(null);
  }

  function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const location = form.location.trim();
    const guests = Number(form.guests);
    if (!name || !location) {
      setFormError("Please enter both the property name and location.");
      return;
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > 1000) {
      setFormError("Guest capacity must be a whole number between 1 and 1000.");
      return;
    }

    if (editingId) {
      setProperties(items => items.map(item => item.id === editingId
        ? { ...item, name, location, guests }
        : item));
      setNotice("Property updated and saved in this browser.");
    } else {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `property-${Date.now()}`;
      setProperties(items => [...items, {
        id, name, location, guests, status: "Draft", accent: "blue",
      }]);
      setNotice("Property added and saved in this browser. Its guest guide is still a draft.");
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function deleteProperty(property: Property) {
    setMenuFor(null);
    if (!window.confirm(`Delete "${property.name}" from this browser?`)) return;
    setProperties(items => items.filter(item => item.id !== property.id));
    setNotice("Property deleted from this browser.");
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
        <section className="welcome-row"><div><div className="eyebrow">MONDAY, NOVEMBER 9, 2026</div><h1>Good morning, Alaya <span>✳</span></h1><p className="subtitle">Here’s what’s happening with your guest experience.</p></div><button className="primary-button" onClick={openCreateForm}><Plus size={17}/> Add a property</button></section>
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
        <section className="stats-grid">
          <article className="stat-card"><div className="stat-top"><span>Total properties</span><Building2 size={18}/></div><div className="stat-number">{properties.length.toString().padStart(2, "0")}</div><div className="stat-foot"><span className="stat-dot green"></span> Your spaces in one place</div></article>
          <article className="stat-card"><div className="stat-top"><span>Published guides</span><BookOpen size={18}/></div><div className="stat-number">{properties.filter(p => p.status === "Published").length.toString().padStart(2, "0")}</div><div className="stat-foot"><span className="stat-dot green"></span> Ready to welcome guests</div></article>
          <article className="stat-card"><div className="stat-top"><span>Guest guide visits</span><BarChart3 size={18}/></div><div className="stat-number">—</div><div className="stat-foot muted">Analytics will appear after launch</div></article>
          <article className="stat-card"><div className="stat-top"><span>Guest capacity</span><Users size={18}/></div><div className="stat-number">{properties.reduce((sum, p) => sum + p.guests, 0)}</div><div className="stat-foot muted">Across all your properties</div></article>
        </section>
        <section className="section-heading"><div><h2>Your properties</h2><p>Manage your spaces and the guides your guests see.</p></div><button className="text-button" onClick={() => setActive("My properties")}>View all properties <span>→</span></button></section>
        <section className="property-grid">{properties.map((property) => <article className="property-card" key={property.id}><div className={`property-cover ${property.accent}`}><div className="cover-top"><span className="cover-tag"><span className={`status-dot ${property.status === "Published" ? "published" : "draft"}`}></span>{property.status}</span><div className="property-menu-wrap"><button className="more-button" aria-label={`Options for ${property.name}`} aria-expanded={menuFor === property.id} onClick={() => setMenuFor(menuFor === property.id ? null : property.id)}><MoreHorizontal size={18}/></button>{menuFor === property.id && <div className="property-menu"><button onClick={() => openEditForm(property)}><Pencil size={14}/> Edit</button><button className="danger" onClick={() => deleteProperty(property)}><Trash2 size={14}/> Delete</button></div>}</div></div><div className="cover-illustration"><div className="sun"></div><div className="building-shape"><div className="window one"></div><div className="window two"></div><div className="door"></div></div><div className="plant">✳</div></div><div className="cover-caption">{property.name}</div></div><div className="property-details"><div><h3>{property.name}</h3><p><MapPin size={14}/>{property.location}</p></div><div className="guest-count"><Users size={15}/>{property.guests} guests</div></div><div className="property-footer"><button className="guide-link" onClick={() => setNotice("Guest guide preview is a planned next milestone.")}><BookOpen size={15}/> Open guide</button><button className="icon-action" aria-label="Copy guide link" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/guide/${property.id}`); setNotice("This is a placeholder link: public guest guides are not implemented yet."); }}><Copy size={15}/></button><button className="icon-action" aria-label="QR code" onClick={() => setNotice("QR code generation will be added after public guest guide URLs are available.")}><QrCode size={16}/></button></div></article>)}<button className="add-property-card" onClick={openCreateForm}><span><Plus size={22}/></span><b>Add a new property</b><small>Start creating a memorable stay</small></button></section>
        <section className="bottom-grid"><article className="setup-card"><div className="setup-icon"><ShieldCheck size={19}/></div><div><h3>Your workspace is taking shape</h3><p>This is the first dashboard preview. Property changes are saved in this browser only. Secure accounts, cloud storage and guest guide publishing are still to come.</p><div className="progress-track"><span></span></div><small>Foundation preview · browser-local data</small></div></article><article className="tip-card"><div className="tip-icon"><Wifi size={18}/></div><div><span className="eyebrow">A GOOD FIRST STEP</span><h3>Make check-in effortless</h3><p>Add Wi-Fi, arrival instructions and emergency contacts to each guest guide.</p></div></article></section>
        <footer>© 2026 Welkomy <span>Made for better stays.</span></footer>
      </div>
    </main>
    {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
      <section className="property-modal" role="dialog" aria-modal="true" aria-labelledby="property-modal-title">
        <div className="modal-heading"><div><span className="eyebrow">{editingId ? "PROPERTY DETAILS" : "NEW PROPERTY"}</span><h2 id="property-modal-title">{editingId ? "Edit property" : "Add a property"}</h2><p>Enter the basic information for this accommodation.</p></div><button className="modal-close" aria-label="Close" onClick={() => setModalOpen(false)}><X size={19}/></button></div>
        <form onSubmit={saveProperty}>
          <label>Property name<input autoFocus maxLength={80} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Riad Dar Jasmine" /></label>
          <label>City and country<input maxLength={120} value={form.location} onChange={event => setForm(current => ({ ...current, location: event.target.value }))} placeholder="e.g. Tangier, Morocco" /></label>
          <label>Guest capacity<input type="number" min="1" max="1000" step="1" value={form.guests} onChange={event => setForm(current => ({ ...current, guests: event.target.value }))} /></label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-button">{editingId ? "Save changes" : "Create property"}</button></div>
        </form>
      </section>
    </div>}
  </div>;
}
