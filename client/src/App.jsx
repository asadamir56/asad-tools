import { useEffect, useState } from "react";
import DuroodScreen from "./components/DuroodScreen.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import AdminScreen from "./components/AdminScreen.jsx";
import Store from "./components/Store.jsx";
import { recordVisit } from "./lib/tracking.js";
import { supabase, supabaseConfigured } from "./lib/supabaseClient.js";

const SESSION_KEY = "asadToolsLogin";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || "null");
  } catch { return null; }
}

export default function App() {
  const [step, setStep] = useState("durood"); // durood | auth | store
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = loadSession();
    if (saved) setUser(saved);
    // Google OAuth return: Supabase session from the redirect URL
    if (supabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => {
        const s = data?.session?.user;
        if (s) {
          const u = { email: s.email, name: s.user_metadata?.name || s.email, phone: s.user_metadata?.phone || "" };
          localStorage.setItem(SESSION_KEY, JSON.stringify(u));
          setUser(u); setStep("store");
        }
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
        const s = session?.user;
        if (s) {
          const u = { email: s.email, name: s.user_metadata?.name || s.email, phone: s.user_metadata?.phone || "" };
          localStorage.setItem(SESSION_KEY, JSON.stringify(u));
          setUser(u); setStep("store");
        }
      });
      recordVisit();
      return () => listener?.subscription?.unsubscribe();
    }
    recordVisit(); // who visited the web — saved in Supabase (visitors table)
  }, []);

  function handleDurood() { setStep(user ? "store" : "auth"); }
  function handleLogin(u) { setUser(u); setStep("store"); }
  function handleLogout() {
    if (supabaseConfigured) supabase.auth.signOut().catch(() => {});
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null); setStep("auth");
  }

  return (
    <div>
      <header className="topbar">
        <div className="brand">Asad <span>Tools</span></div>
        <div>WhatsApp: 03039929254</div>
      </header>
      {step === "durood" && <DuroodScreen onEnter={handleDurood} />}
      {step === "auth" && <AuthScreen onLogin={handleLogin} />}
      {step === "admin" && <AdminScreen onBack={() => setStep(user ? "store" : "auth")} />}
      {step === "store" && <Store user={user} onLogout={handleLogout} />}
      <footer className="footer">
        <b>Asad Tools</b> — Owner: Muhammad Asad · WhatsApp 03039929254<br />
        Durood Pak parh kar app me dakhil hon. Muse AI Account — Muse, by Meta.<br />
        <button type="button" onClick={() => setStep("admin")} style={{ background: "none", border: "none", color: "#0284c7", fontWeight: 700, cursor: "pointer", padding: 0 }}>Admin</button>
      </footer>
    </div>
  );
}
