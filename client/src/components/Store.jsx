import { useMemo, useState } from "react";
import { PRODUCTS, CATEGORIES, DURATIONS, WHATSAPP_LINK, EASYPAISA_NUMBER, EASYPAISA_NAME } from "../data/products.js";
import ProductCard from "./ProductCard.jsx";

export default function Store({ user, onLogout }) {
  const [category, setCategory] = useState("All");
  const [duration, setDuration] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => PRODUCTS.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (duration !== "all") {
      const d = DURATIONS.find((x) => x.key === duration);
      if (String(p.duration) !== String(d.months)) return false;
    }
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [category, duration, search]);

  const counts = useMemo(() => {
    const m = { all: PRODUCTS.length };
    for (const d of DURATIONS) if (d.key !== "all") m[d.key] = PRODUCTS.filter((p) => String(p.duration) === String(d.months)).length;
    return m;
  }, []);

  return (
    <div className="wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Khush Aamdeed, {user?.name || "Guest"}</h2>
        <button className="btn btn-outline" onClick={onLogout}>Logout</button>
      </div>
      <p>40 products — real brand logos, WhatsApp order, Easypaisa payment. Koi stock nahi dikhaya jata.</p>

      <input className="search" placeholder="Search — Gemini, CapCut, Muse…" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="pills">
        {CATEGORIES.map((c) => (
          <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <h3>Kitne month wala plan chahiye?</h3>
      <div className="pills">
        {DURATIONS.map((d) => (
          <button key={d.key} className={duration === d.key ? "active" : ""} onClick={() => setDuration(d.key)}>
            {d.label} ({counts[d.key]})
          </button>
        ))}
      </div>

      <p>{filtered.length} products dikh rahe hain.</p>
      {filtered.length === 0 && <p>Koi product nahi mila — filter badlein.</p>}
      <div className="grid">
        {filtered.map((p) => <ProductCard key={p.id} product={p} user={user} />)}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>Easypaisa Payment</h3>
        <p><b>Easypaisa:</b> {EASYPAISA_NUMBER} — {EASYPAISA_NAME}</p>
        <p>Order ke baad payment karein aur screenshot WhatsApp par bhejein.</p>
        <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer"><button className="btn btn-green">WhatsApp: {EASYPAISA_NUMBER}</button></a>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Account, Login aur Email Check</h3>
        <p>Register: Email (1st) → Password (2nd) → Naam (3rd) → WhatsApp (4th). Gmail check + Cloud Verify (MX) se domain verify hota hai. Login sirf registered email/number + sahi password se hota hai.</p>
        <p><b>Note:</b> Kisi mail ki asli ownership ki poori tasdeeq sirf Google sign-in ya mail par aaye code se hoti hai. Real Google sign-in ke liye Supabase me Google OAuth credentials lagane honge (README dekhein) — ye page us ko fake nahi karta.</p>
      </div>
    </div>
  );
}
