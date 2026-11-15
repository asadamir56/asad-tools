import { useState } from "react";
import { supabase, supabaseConfigured, cloudVerifyEmail, gmailCheck } from "../lib/supabaseClient.js";
import { recordSignup, recordLogin } from "../lib/tracking.js";

const ACCOUNTS_KEY = "asadToolsAccounts";
const SESSION_KEY = "asadToolsLogin";

function loadAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); } catch { return []; }
}
function saveAccounts(a) { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a)); }
async function hashPassword(pw) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch { return "hash:" + pw.length + ":" + [...pw].map((c) => c.charCodeAt(0)).join("-"); }
}
function isEmail(v) { return v.includes("@"); }

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [remember, setRemember] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");

  async function checkEmailLive(v) {
    setEmail(v);
    if (!v.includes("@")) { setEmailStatus(""); return; }
    const g = gmailCheck(v);
    if (!g.ok) { setEmailStatus(g.reason); return; }
    setEmailStatus("Google Gmail — sahi hai. Cloud Verify ho raha hai…");
    const c = await cloudVerifyEmail(v);
    setEmailStatus(c.ok ? "Cloud Verified — " + c.reason : c.reason);
  }

  function saveSession(user) {
    const data = JSON.stringify(user);
    if (remember) { localStorage.setItem(SESSION_KEY, data); sessionStorage.setItem(SESSION_KEY, data); }
    else { sessionStorage.setItem(SESSION_KEY, data); localStorage.removeItem(SESSION_KEY); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(""); setMsgOk(false);
    const username = mode === "login" ? email.trim() : email.trim().toLowerCase();

    if (mode === "register") {
      if (!email || !password || !name) { setMsg("Email, Password aur Naam — teeno zaroori hain."); return; }
      if (password.length < 6) { setMsg("Password kam se kam 6 harf ka ho."); return; }
      const g = gmailCheck(email);
      if (!g.ok) { setMsg(g.reason); return; }
      const c = await cloudVerifyEmail(email);
      if (!c.ok) { setMsg(c.reason); return; }
      const accounts = loadAccounts();
      if (accounts.some((a) => a.email === email.toLowerCase() || (phone && a.phone === phone))) {
        setMsg("Ye email/number pehle se registered hai — Login karein."); return;
      }
      // 1) Supabase Auth (if configured)  2) Node API  3) browser registry fallback
      // Unlimited: if Supabase email rate-limit (or any Supabase error) hits,
      // fall back to the local account — signup never stops for email limits.
      if (supabaseConfigured) {
        const { error } = await supabase.auth.signUp({ email: email.toLowerCase(), password, options: { data: { name, phone } } });
        if (error) {
          if (String(error.message || "").toLowerCase().includes("rate limit")) {
            setMsg("Supabase email limit full hai — local account se register ho raha hai, koi email nahi jayegi.");
          } else {
            setMsg("Supabase: " + error.message + " — local account se register ho raha hai.");
          }
        }
      } else {
        try { await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, name, phone }) }); } catch { /* server optional in static preview */ }
      }
      const user = { email: email.toLowerCase(), name, phone, passHash: await hashPassword(password) };
      accounts.push(user); saveAccounts(accounts);
      saveSession(user);
      recordSignup(user); // who signed up — saved in Supabase
      setMsgOk(true); setMsg("Registered! Ab aap logged in hain.");
      onLogin(user);
      return;
    }

    // ---- Login ----
    if (!username || !password) { setMsg("Username aur Password likhein."); return; }
    if (supabaseConfigured && isEmail(username)) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: username.toLowerCase(), password });
      if (!error) {
        const user = { email: data.user.email, name: data.user.user_metadata?.name || data.user.email, phone: data.user.user_metadata?.phone || "" };
        saveSession(user); recordLogin(user, "email"); onLogin(user); return;
      }
      // Unlimited: Supabase error (rate limit, unconfirmed email, etc.) —
      // try the local account instead of stopping the login.
      setMsg("Supabase login nahi hua (" + error.message + ") — local account se try ho raha hai.");
    }
    const accounts = loadAccounts();
    const acc = accounts.find((a) => a.email === username.toLowerCase() || a.phone === username);
    if (!acc) { setMsg("Ye email/number registered nahi hai — pehle Register karein."); return; }
    if (acc.passHash !== (await hashPassword(password))) { setMsg("Password galat hai."); return; }
    saveSession(acc); recordLogin(acc, isEmail(username) ? "email" : "phone"); onLogin(acc);
  }

  async function handleGoogle() {
    if (!supabaseConfigured) { setMsg("Google login ke liye Supabase keys chahiye — pehle .env check karein."); return; }
    setMsg("Google ki taraf ja rahe hain…");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setMsg("Google login nahi hua: " + error.message + " — Supabase Dashboard > Authentication > Providers > Google ON karein.");
  }

  return (
    <div className="wrap">
      <div className="card login-grid" style={{ padding: 0 }}>
        <div className="login-hero">
          <img className="owner-photo" src="/images/owner-asad.png" alt="Muhammad Asad — Owner, Asad Tools" />
          <h2>Asad Tools</h2>
          <p><b>Muhammad Asad</b> — Owner</p>
          <p>Digital subscriptions &amp; accounts — Gemini, CapCut, ChatGPT, Muse by Meta aur 69 tools. Order on WhatsApp.</p>
          <span className="chip">Secure payments</span>
          <span className="chip">WhatsApp support</span>
          <span className="chip">Instant delivery</span>
          <div className="stats">
            <div className="stat"><b>12,000+</b>Happy Clients</div>
            <div className="stat"><b>1,000+</b>Services Available</div>
            <div className="stat"><b>FAST</b>Instant Delivery</div>
          </div>
          <p style={{ marginTop: 20, fontSize: ".9rem" }}>JazzCash · Bank Transfer · VISA · Mastercard · PayPal</p>
        </div>

        <div className="login-card">
          <h2 style={{ marginTop: 0 }}>Welcome back</h2>
          <p style={{ color: "#5c5c55" }}>Log in to manage your orders and funds</p>
          <div className="tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log In</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Create Account</button>
          </div>
          <form onSubmit={handleSubmit} autoComplete="on">
            <label>1 — Email</label>
            <input type="email" name="email" autoComplete="email" placeholder="apka@gmail.com"
              value={email} onChange={(e) => checkEmailLive(e.target.value)} required />
            {emailStatus && <div className={emailStatus.startsWith("Cloud Verified") || emailStatus.startsWith("Google Gmail") ? "msg-ok" : "msg-err"} style={{ fontSize: ".9rem", marginTop: 6 }}>{emailStatus}</div>}

            <label>2 — Password</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type={showPw ? "text" : "password"} name="password" autoComplete={mode === "register" ? "new-password" : "current-password"}
                placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="btn btn-outline" onClick={() => setShowPw(!showPw)}>{showPw ? "Hide" : "Show"}</button>
            </div>

            {mode === "register" && (<>
              <label>3 — Naam</label>
              <input type="text" name="name" autoComplete="name" placeholder="Apna naam" value={name} onChange={(e) => setName(e.target.value)} required />
              <label>4 — WhatsApp Number (optional)</label>
              <input type="tel" name="tel" autoComplete="tel" placeholder="03xx-xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </>)}

            {mode === "login" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: ".9rem" }}>
                <label style={{ margin: 0 }}><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: "auto" }} /> Remember me</label>
                <button type="button" style={{ background: "none", border: "none", color: "#b3261e", fontWeight: 700 }}
                  onClick={() => setMsg("Password bhool gaye? WhatsApp 03039929254 par message karein — owner aap ki madad karega. (Real email reset ke liye Supabase + backend chahiye.)")}>
                  Forgot password?
                </button>
              </div>
            )}

            {msg && <p className={msgOk ? "msg-ok" : "msg-err"}>{msg}</p>}
            <button className="btn btn-teal" type="submit" style={{ width: "100%", marginTop: 16 }}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <button className="btn" type="button" style={{ width: "100%", marginTop: 12, background: "#0f766e", color: "#fff" }}
            onClick={handleGoogle}>
            G Continue with Google
          </button>
          <p style={{ textAlign: "center" }}>New here? <button type="button" style={{ background: "none", border: "none", color: "#b3261e", fontWeight: 700 }} onClick={() => setMode("register")}>Create a free account</button></p>
          <p style={{ textAlign: "center", fontSize: ".85rem", color: "#5c5c55" }}>Secure, encrypted login</p>
          <p style={{ fontSize: ".85rem", color: "#5c5c55" }}>Note: Google se login karne par aapki Gmail khud verify ho jati hai. Agar Google button error de, to Supabase Dashboard &gt; Authentication &gt; Providers &gt; Google ON karein, phir dobara try karein.</p>
        </div>
      </div>
    </div>
  );
}
