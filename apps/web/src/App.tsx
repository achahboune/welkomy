import { useEffect, useState, type FormEvent } from "react";
import { BookOpen, Building2, Copy, LogOut, Plus, QrCode, Save, Trash2, X } from "lucide-react";

type Property = { id: string; name: string; location: string; guests: number; status: "Published" | "Draft"; accent?: string; slug: string };
type Guide = { wifi: string; checkin: string; checkout: string; access: string; emergency: string; notes: string };
const blankGuide: Guide = { wifi: "", checkin: "", checkout: "", access: "", emergency: "", notes: "" };
const API = (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(API + path, {
    ...options, credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`);
  return data as T;
}

export default function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({ name: "", location: "", guests: "2" });
  const [editing, setEditing] = useState<string | null>(null);
  const [guideFor, setGuideFor] = useState<Property | null>(null);
  const [guide, setGuide] = useState<Guide>(blankGuide);
  const [publicGuide, setPublicGuide] = useState<{ property: {name:string;location:string;guests:number}; guide: Guide } | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const publicSlug = window.location.pathname.match(/^\/guide\/([^/]+)/)?.[1];

  async function loadProperties() {
    const data = await request<{properties: Property[]}>("/api/properties");
    setProperties(data.properties);
  }
  useEffect(() => {
    if (publicSlug) {
      request<typeof publicGuide>(`/api/public/guides/${encodeURIComponent(publicSlug)}`)
        .then(setPublicGuide).catch(e => setNotice(e.message)).finally(() => setLoading(false));
      return;
    }
    request<{ user: { name: string; email: string } } | null>("/api/auth/get-session")
      .then(async session => {
        if (session?.user) { setUser(session.user); await loadProperties(); }
      }).catch(e => setNotice(e.message)).finally(() => setLoading(false));
  }, []);

  async function submitAuth(e: FormEvent) {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      await request(authMode === "signup" ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email", {
        method: "POST", body: JSON.stringify(authMode === "signup" ? auth : { email: auth.email, password: auth.password }),
      });
      const session = await request<{ user: {name:string;email:string} }>("/api/auth/get-session");
      if (!session?.user) throw new Error("Session not created. Check your API configuration.");
      setUser(session.user); await loadProperties();
    } catch (e) { setNotice(e instanceof Error ? e.message : "Authentication failed"); }
    finally { setBusy(false); }
  }

  async function saveProperty(e: FormEvent) {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      const payload = { name: form.name.trim(), location: form.location.trim(), guests: Number(form.guests) };
      await request(editing ? `/api/properties/${editing}` : "/api/properties", {
        method: editing ? "PUT" : "POST", body: JSON.stringify(payload),
      });
      setForm({name:"",location:"",guests:"2"}); setEditing(null); await loadProperties();
      setNotice("Property saved to your cloud account.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not save property"); }
    finally { setBusy(false); }
  }

  async function openGuide(property: Property) {
    setGuideFor(property); setBusy(true);
    try {
      const data = await request<{property: {guide_content:string}}>(`/api/properties/${property.id}/guide`);
      setGuide({ ...blankGuide, ...JSON.parse(data.property.guide_content || "{}") });
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not load guide"); }
    finally { setBusy(false); }
  }
  async function saveGuide() {
    if (!guideFor) return; setBusy(true);
    try {
      await request(`/api/properties/${guideFor.id}/guide`, { method:"PUT", body:JSON.stringify({guide_content:JSON.stringify(guide)}) });
      setNotice("Guest guide saved.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not save guide"); }
    finally { setBusy(false); }
  }
  async function publish(property: Property) {
    setBusy(true);
    try {
      await request(`/api/properties/${property.id}/${property.status === "Published" ? "unpublish" : "publish"}`, {method:"POST"});
      await loadProperties(); setNotice(property.status === "Published" ? "Guide unpublished." : "Guide is now public.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not update publication"); }
    finally { setBusy(false); }
  }
  async function remove(property: Property) {
    if (!window.confirm(`Delete ${property.name} and its guest guide?`)) return;
    try { await request(`/api/properties/${property.id}`, {method:"DELETE"}); await loadProperties(); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Could not delete property"); }
  }
  async function logout() {
    await request("/api/auth/sign-out", {method:"POST"}); setUser(null); setProperties([]);
  }

  if (loading) return <div className="auth-screen">Loading Welkomy…</div>;
  if (publicSlug) return <main className="guest-page">
    {publicGuide ? <article className="guest-card"><div className="brand"><span className="brand-mark">w.</span> welkomy</div><p className="eyebrow">YOUR STAY, MADE SIMPLE</p><h1>Welcome to {publicGuide.property.name}</h1><p>{publicGuide.property.location} · Up to {publicGuide.property.guests} guests</p>
      {Object.entries({ "Wi-Fi":publicGuide.guide?.wifi, "Check-in":publicGuide.guide?.checkin, "Check-out":publicGuide.guide?.checkout, "Access":publicGuide.guide?.access, "Emergency":publicGuide.guide?.emergency, "Good to know":publicGuide.guide?.notes }).filter(([,v])=>v).map(([k,v])=><section className="guest-section" key={k}><h2>{k}</h2><p>{v}</p></section>)}
    </article> : <div className="auth-card"><h1>Guide unavailable</h1><p>{notice || "This guide is not published or the link is incorrect."}</p></div>}
  </main>;

  if (!user) return <main className="auth-screen"><form className="auth-card" onSubmit={submitAuth}>
    <div className="brand"><span className="brand-mark">w.</span> welkomy</div><p className="eyebrow">HOST WORKSPACE</p><h1>{authMode === "signup" ? "Create your account" : "Welcome back"}</h1><p className="auth-subtitle">Create and share beautiful digital guest guides.</p>
    {authMode === "signup" && <label>Your name<input required value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})} autoComplete="name" /></label>}
    <label>Email<input required type="email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} autoComplete="email" /></label>
    <label>Password<input required minLength={8} type="password" value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} autoComplete={authMode==="signup"?"new-password":"current-password"} /></label>
    {notice && <p className="form-error">{notice}</p>}<button className="primary-button full" disabled={busy}>{busy?"Please wait…":authMode==="signup"?"Create account":"Sign in"}</button>
    <p className="auth-switch">{authMode==="signup"?"Already have an account?":"New to Welkomy?"} <button type="button" onClick={()=>setAuthMode(authMode==="signup"?"signin":"signup")}>{authMode==="signup"?"Sign in":"Create account"}</button></p>
  </form></main>;

  return <div className="app-shell"><aside className="sidebar"><a className="brand" href="/"><span className="brand-mark">w.</span><span>welkomy</span></a><div className="workspace-label">HOST WORKSPACE</div><div className="profile"><div className="profile-avatar">{user.name.slice(0,1).toUpperCase()}</div><div><b>{user.name}</b><small>{user.email}</small></div></div><div className="sidebar-bottom"><button className="nav-item" onClick={logout}><LogOut size={18}/> Sign out</button></div></aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>My properties</b></div><div className="top-actions">{user.name}</div></header>
      <div className="page-wrap"><section className="welcome-row"><div><div className="eyebrow">YOUR HOST DASHBOARD</div><h1>Welcome, {user.name.split(" ")[0]}</h1><p className="subtitle">Manage your properties and guest experiences.</p></div></section>
        {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice("")}>Dismiss</button></div>}
        <section className="stats-grid"><article className="stat-card"><div className="stat-top">Properties <Building2 size={18}/></div><div className="stat-number">{properties.length}</div><div className="stat-foot">In your account</div></article><article className="stat-card"><div className="stat-top">Published guides <BookOpen size={18}/></div><div className="stat-number">{properties.filter(p=>p.status==="Published").length}</div><div className="stat-foot">Guest-ready guides</div></article></section>
        <section className="section-heading"><div><h2>Your properties</h2><p>Create a property, add guest information and publish its guide.</p></div></section>
        <form className="inline-property-form" onSubmit={saveProperty}><input required placeholder="Property name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required placeholder="City and country" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/><input required type="number" min="1" max="1000" placeholder="Guests" value={form.guests} onChange={e=>setForm({...form,guests:e.target.value})}/><button className="primary-button" disabled={busy}><Plus size={16}/>{editing?"Save changes":"Add property"}</button>{editing&&<button type="button" className="secondary-button" onClick={()=>{setEditing(null);setForm({name:"",location:"",guests:"2"})}}>Cancel</button>}</form>
        <section className="property-grid">{properties.map(p=><article className="property-card" key={p.id}><div className="property-cover sage" onClick={() => openGuide(p)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") openGuide(p); }}><div className="cover-tag">{p.status}</div><div className="cover-illustration"><div className="sun"/><div className="building-shape"><div className="window one"/><div className="window two"/><div className="door"/></div></div><div className="cover-caption">{p.name}</div></div><div className="property-details"><div><h3>{p.name}</h3><p>{p.location}</p></div><div className="guest-count">{p.guests} guests</div></div><div className="property-footer"><button className="guide-link" onClick={()=>openGuide(p)}><BookOpen size={15}/> Edit guide</button><button className="icon-action" title="Publish/unpublish" onClick={()=>publish(p)}>{p.status==="Published"?"Unpublish":"Publish"}</button><button className="icon-action" title="QR code" onClick={()=>{if(p.status!=="Published"){setNotice("Publish the guide before sharing its QR code.");return;}window.open(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(window.location.origin+"/guide/"+p.slug)}`,"_blank","noopener");}}><QrCode size={16}/></button><button className="icon-action" title="Copy public link" onClick={()=>{if(p.status!=="Published"){setNotice("Publish the guide before sharing its link.");return;}navigator.clipboard.writeText(window.location.origin+"/guide/"+p.slug);setNotice("Guest link copied.");}}><Copy size={15}/></button><button className="icon-action" title="Delete" onClick={()=>remove(p)}><Trash2 size={15}/></button></div></article>)}</section>
        <footer>© 2026 Welkomy <span>Digital guest guides</span></footer>
      </div></main>
    {guideFor&&<div className="modal-backdrop"><section className="property-modal guide-modal"><div className="modal-heading"><div><span className="eyebrow">GUEST GUIDE</span><h2>{guideFor.name}</h2><p>Information visible to guests after publication.</p></div><button className="modal-close" onClick={()=>setGuideFor(null)}><X size={19}/></button></div><div className="guide-fields">{([["wifi","Wi-Fi name and password"],["checkin","Check-in instructions"],["checkout","Check-out instructions"],["access","Door code / access"],["emergency","Emergency contact"],["notes","Recommendations and useful information"]] as const).map(([key,label])=><label key={key}>{label}<textarea rows={key==="notes"?4:2} value={guide[key]} onChange={e=>setGuide({...guide,[key]:e.target.value})}/></label>)}</div><div className="modal-actions"><button className="secondary-button" onClick={()=>setGuideFor(null)}>Close</button><button className="primary-button" onClick={saveGuide} disabled={busy}><Save size={15}/> Save guide</button></div></section></div>}
  </div>;
}
