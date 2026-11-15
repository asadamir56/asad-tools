import { useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabaseClient.js";

// Asad Tools — Owner Admin page.
// Password: 6767 (owner can change it here, then push again).
// Shows: total users, logins, visits, orders — and who bought Muse.
const ADMIN_PASSWORD = "6767";

export default function AdminScreen({ onBack }) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ profiles: [], logins: [], visits: [], orders: [], purchases: [] });

  function login(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setAuthed(true); setMsg(""); loadData(); }
    else setMsg("Password galat hai.");
  }

  async function loadData() {
    if (!supabaseConfigured) { setMsg("Supabase connected nahi — Table Editor me data dekhein."); return; }
    setLoading(true);
    const [p, l, v, o, pu] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("login_history").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("visitors").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setData({
      profiles: p.data || [],
      logins: l.data || [],
      visits: v.data || [],
      orders: o.data || [],
      purchases: pu.data || [],
    });
    setLoading(false);
    if (p.error || l.error || v.error || o.error || pu.error) setMsg("Kuch tables load nahi hui — Supabase Table Editor check karein.");
  }

  const museBuyers = data.purchases.filter((x) => String(x.product_name || "").toLowerCase().includes("muse"));

  if (!authed) {
    return (
      <div className="wrap">
        <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
          <h2 style={{ marginTop: 0 }}>Admin — Asad Tools</h2>
          <p>Sirf owner ke liye. Admin password likhein.</p>
          <form onSubmit={login}>
            <label>Admin Password</label>
            <input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {msg && <p className="msg-err">{msg}</p>}
            <button className="btn btn-teal" type="submit" style={{ width: "100%", marginTop: 12 }}>Admin Login</button>
          </form>
          <button className="btn btn-outline" onClick={onBack} style={{ marginTop: 12 }}>Wapas</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Admin — Asad Tools</h2>
        <button className="btn btn-outline" onClick={onBack}>Wapas Store</button>
      </div>
      {msg && <p className="msg-err">{msg}</p>}
      {loading && <p>Loading…</p>}
      <button className="btn btn-teal" onClick={loadData} style={{ marginTop: 12 }}>Refresh</button>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Summary</h3>
        <p>Users: <b>{data.profiles.length}</b> · Logins: <b>{data.logins.length}</b> · Visits: <b>{data.visits.length}</b> · Orders: <b>{data.orders.length}</b> · Purchases: <b>{data.purchases.length}</b></p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Kon ne Muse khareeda? (Muse buyers)</h3>
        {museBuyers.length === 0 ? <p>Abhi tak koi Muse purchase record nahi.</p> : museBuyers.map((x, i) => (
          <p key={i}><b>{x.user_email || x.email || "—"}</b> — {x.product_name} — Rs {x.price} — {x.created_at ? String(x.created_at).slice(0, 10) : ""}</p>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Orders (latest 100)</h3>
        {data.orders.length === 0 ? <p>Koi order nahi.</p> : data.orders.map((o, i) => (
          <p key={i}><b>{o.user_email || o.email || "—"}</b> — {o.product_name || o.product || ""} — Rs {o.price ?? ""} — {o.created_at ? String(o.created_at).slice(0, 10) : ""}</p>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Logins (latest 100)</h3>
        {data.logins.length === 0 ? <p>Koi login record nahi.</p> : data.logins.map((l, i) => (
          <p key={i}><b>{l.user_email || l.email || "—"}</b> — {l.created_at ? String(l.created_at).slice(0, 19).replace("T", " ") : ""}</p>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Users (latest 100)</h3>
        {data.profiles.length === 0 ? <p>Koi user nahi.</p> : data.profiles.map((u, i) => (
          <p key={i}><b>{u.email || "—"}</b> — {u.name || ""} — {u.phone || ""} — logins: {u.login_count ?? 0} — first: {u.first_login_at ? String(u.first_login_at).slice(0, 10) : ""} — last: {u.last_login_at ? String(u.last_login_at).slice(0, 10) : ""}</p>
        ))}
      </div>
    </div>
  );
}
