// Asad Tools — tracking: Supabase saves EVERYTHING.
// Every call goes to the Node API (/api/track/*, /api/orders) which writes to
// Supabase with the service-role key when configured, else keeps an in-memory
// copy (dev only). Nothing here contains a secret key.
const API = import.meta.env.VITE_API_URL || "";

function deviceFromUA(ua = navigator.userAgent) {
  const mobile = /Android|iPhone|iPad|Mobile/i.test(ua) ? "Mobile" : "Desktop";
  const browser = /Edg/i.test(ua) ? "Edge" : /Chrome/i.test(ua) ? "Chrome" : /Firefox/i.test(ua) ? "Firefox" : /Safari/i.test(ua) ? "Safari" : "Browser";
  const os = /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac/i.test(ua) ? "Mac" : "Other";
  return `${os} / ${browser} (${mobile})`;
}

function sessionId() {
  let s = sessionStorage.getItem("asadToolsSession");
  if (!s) { s = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; sessionStorage.setItem("asadToolsSession", s); }
  return s;
}

async function post(path, body) {
  try {
    await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, userAgent: navigator.userAgent, device: deviceFromUA(), sessionId: sessionId() }),
    });
  } catch { /* tracking must never break the store */ }
}

export function getDevice() { return deviceFromUA(); }

/** Who visited the web — once per browser session. */
export function recordVisit(page = window.location.pathname) {
  if (sessionStorage.getItem("asadToolsVisitRecorded")) return;
  sessionStorage.setItem("asadToolsVisitRecorded", "1");
  const user = JSON.parse(localStorage.getItem("asadToolsLogin") || sessionStorage.getItem("asadToolsLogin") || "null");
  post("/api/track/visit", { page, referrer: document.referrer || "", email: user?.email || null, userId: user?.id || null });
}

/** Who signed up — signup details. */
export function recordSignup(user) {
  post("/api/track/signup", { email: user.email, name: user.name, phone: user.phone || "", method: "email" });
}

/** Who logged in — email/number, time, device/browser. */
export function recordLogin(user, method = "email") {
  post("/api/track/login", { email: user.email, phone: user.phone || "", name: user.name || "", method, userId: user.id || null });
}

/** Who bought / ordered what — full buyer + product + plan detail.
 *  Called when the WhatsApp Order button is tapped, so the order is saved
 *  in Supabase BEFORE the buyer leaves for WhatsApp. */
export function recordOrder(user, product) {
  post("/api/orders", {
    email: user?.email || "",
    buyerName: user?.name || "",
    phone: user?.phone || "",
    productId: product.id,
    productName: product.name,
    category: product.category,
    planMonths: product.duration == null ? null : String(product.duration),
    price: product.price ?? null,
    whatsappOrder: true,
    paymentMethod: "WhatsApp",
    userId: user?.id || null,
  });
}
