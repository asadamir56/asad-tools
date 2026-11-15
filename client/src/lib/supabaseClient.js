// Supabase client — keys come ONLY from .env (Vite: VITE_ prefix).
// Never commit a real key. Copy client/.env.example to client/.env and fill it.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured
  ? createClient(url, anonKey)
  : null;

// Cloud Verify (MX check) — Cloudflare DNS-over-HTTPS, no key needed.
// Returns true if the domain exists and has MX records (can receive mail).
export async function cloudVerifyEmail(email) {
  const domain = String(email || "").split("@")[1];
  if (!domain) return { ok: false, reason: "Email me @ ke baad domain nahi hai." };
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { accept: "application/dns-json" } }
    );
    const data = await res.json();
    if (data.Status === 3) return { ok: false, reason: "Ye domain exist nahi karta." };
    if (!data.Answer || data.Answer.length === 0)
      return { ok: false, reason: "Is domain par mail receive nahi hoti (no MX)." };
    return { ok: true, reason: "Cloud Verified — domain aur mail server sahi hain." };
  } catch {
    // Offline / blocked: do not block the user, fall back to format check.
    return { ok: true, reason: "Cloud check nahi ho saka — format check se aage barhein.", fallback: true };
  }
}

export function gmailCheck(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(e) && !/^[a-z0-9._%+-]+@googlemail\.com$/.test(e))
    return { ok: false, reason: "Sirf asli Google Gmail (@gmail.com) likhein." };
  const local = e.split("@")[0];
  if (local.length < 6 || local.length > 30)
    return { ok: false, reason: "Gmail naam 6–30 harf ka hona chahiye." };
  if (local.startsWith(".") || local.endsWith(".") || local.includes(".."))
    return { ok: false, reason: "Gmail me dot galat jagah hai." };
  const temp = ["tempmail", "guerrillamail", "mailinator", "10minutemail", "yopmail"];
  if (temp.some((t) => e.includes(t)))
    return { ok: false, reason: "Temporary mail allowed nahi hai." };
  return { ok: true, reason: "Google Gmail — sahi hai." };
}
