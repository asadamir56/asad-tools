import { useEffect, useState } from "react";
import DuroodScreen from "./components/DuroodScreen.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import Store from "./components/Store.jsx";
import { recordVisit } from "./lib/tracking.js";

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
    recordVisit(); // who visited the web — saved in Supabase (visitors table)
  }, []);

  function handleDurood() { setStep(user ? "store" : "auth"); }
  function handleLogin(u) { setUser(u); setStep("store"); }
  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null); setStep("auth");
  }

  return (
    <div>
      <header className="topbar">
        <div className="brand">Asad <span>Tools</span></div>
        <div>WhatsApp: 03039929254 · Easypaisa: 03039929254</div>
      </header>
      {step === "durood" && <DuroodScreen onEnter={handleDurood} />}
      {step === "auth" && <AuthScreen onLogin={handleLogin} />}
      {step === "store" && <Store user={user} onLogout={handleLogout} />}
      <footer className="footer">
        <b>Asad Tools</b> — Owner: Muhammad Asad · WhatsApp 03039929254 · Easypaisa 03039929254<br />
        Durood Pak parh kar app me dakhil hon. Muse AI Account — Muse, by Meta.
      </footer>
    </div>
  );
}
