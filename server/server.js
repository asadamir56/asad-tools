// Asad Tools — Node.js + Express backend.
// Auth (register/login, bcrypt-hashed passwords), products API, orders API,
// TRACKING API — Supabase saves EVERYTHING (see ../supabase/003_tracking.sql):
//   login_history, visitors, orders, purchases, user_activity, profiles.
// Data lives in Supabase when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
// (service-role bypasses RLS, so the server can write history rows).
// If Supabase is not configured yet, the API still runs with an in-memory
// store (dev only — restart wipes it). Never put the service-role key in the frontend.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.set("trust proxy", true); // real visitor IP behind Netlify/Vercel

const products = require("./products.js");

// ---- Supabase admin client (server only) ----
const supa = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;
async function supaInsert(table, row) {
  if (!supa) return null;
  const { error } = await supa.from(table).insert(row);
  if (error) console.error(`Supabase insert ${table} failed:`, error.message);
  return error ? null : true;
}

// ---- in-memory fallback (dev only) ----
const users = []; // { email, phone, name, passHash }
const orders = [];
const loginHistory = [];
const visitors = [];
const purchases = [];
const activity = [];

function gmailOk(email) {
  return /^[a-z0-9._%+-]+@(gmail|googlemail)\.com$/.test(String(email || "").toLowerCase());
}

app.get("/api/health", (req, res) => res.json({ ok: true, app: "Asad Tools", supabase: Boolean(process.env.SUPABASE_URL) }));

app.get("/api/products", (req, res) => res.json(products));

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, phone } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ ok: false, error: "Email, password aur naam zaroori hain." });
  if (!gmailOk(email)) return res.status(400).json({ ok: false, error: "Sirf asli Google Gmail (@gmail.com) likhein." });
  if (String(password).length < 6) return res.status(400).json({ ok: false, error: "Password kam se kam 6 harf ka ho." });
  if (users.some((u) => u.email === email.toLowerCase())) return res.status(400).json({ ok: false, error: "Ye email pehle se registered hai." });
  const passHash = await bcrypt.hash(password, 10);
  const user = { email: email.toLowerCase(), name, phone: phone || "", passHash };
  users.push(user);
  // Supabase: profile row (signup details) + activity row.
  await supaInsert("user_activity", { email: user.email, activity_type: "signup", details: { name, phone: user.phone } });
  res.json({ ok: true, user: { email: user.email, name, phone: user.phone } });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  const u = users.find((x) => x.email === String(username || "").toLowerCase() || x.phone === username);
  if (!u) return res.status(400).json({ ok: false, error: "Ye email/number registered nahi hai." });
  const ok = await bcrypt.compare(password || "", u.passHash);
  if (!ok) return res.status(400).json({ ok: false, error: "Password galat hai." });
  // Record the login: email/number, time, device/browser — Supabase login_history.
  const loginRow = { email: u.email, phone: u.phone, method: String(username).includes("@") ? "email" : "phone", success: true, userAgent: req.body.userAgent || req.headers["user-agent"] || "", device: req.body.device || "", ipAddress: req.ip || "" };
  loginHistory.push({ ...loginRow, loginAt: new Date().toISOString() });
  await supaInsert("login_history", { email: loginRow.email, phone: loginRow.phone, method: loginRow.method, success: true, user_agent: loginRow.userAgent, device: loginRow.device, ip_address: loginRow.ipAddress });
  res.json({ ok: true, user: { email: u.email, name: u.name, phone: u.phone } });
});

// ---------- TRACKING endpoints: Supabase saves everything ----------
// Who visited the web (even without login).
app.post("/api/track/visit", async (req, res) => {
  const { page, referrer, email, userId, userAgent, device, sessionId } = req.body || {};
  const row = { session_id: sessionId || "unknown", user_id: userId || null, email: email || null, page: page || "/", referrer: referrer || "", user_agent: userAgent || req.headers["user-agent"] || "", device: device || "", ip_address: req.ip || "" };
  visitors.push({ ...row, visitedAt: new Date().toISOString() });
  await supaInsert("visitors", row);
  res.json({ ok: true });
});

// Who signed up (signup details).
app.post("/api/track/signup", async (req, res) => {
  const { email, name, phone, method } = req.body || {};
  if (!email) return res.status(400).json({ ok: false, error: "Email zaroori hai." });
  activity.push({ email, activityType: "signup", details: { name, phone }, createdAt: new Date().toISOString() });
  await supaInsert("user_activity", { email, activity_type: "signup", details: { name, phone, method: method || "email" } });
  res.json({ ok: true });
});

// Who logged in (email/number, time, device/browser).
app.post("/api/track/login", async (req, res) => {
  const { email, phone, name, method, userId, userAgent, device } = req.body || {};
  if (!email) return res.status(400).json({ ok: false, error: "Email zaroori hai." });
  const row = { email, phone: phone || "", method: method || "email", success: true, user_agent: userAgent || req.headers["user-agent"] || "", device: device || "", ip_address: req.ip || "" };
  loginHistory.push({ ...row, loginAt: new Date().toISOString(), name });
  await supaInsert("login_history", row);
  res.json({ ok: true });
});

app.post("/api/orders", async (req, res) => {
  const { email, buyerName, phone, productId, productName, category, planMonths, price, whatsappOrder, paymentMethod, userId } = req.body || {};
  if (!email || !productId) return res.status(400).json({ ok: false, error: "Email aur product zaroori hain." });
  const order = { id: orders.length + 1, email, buyerName: buyerName || "", phone: phone || "", productId, productName, category: category || "", planMonths: planMonths ?? null, price: price ?? null, whatsappOrder: whatsappOrder !== false, paymentMethod: paymentMethod || "Easypaisa", status: "pending", createdAt: new Date().toISOString() };
  orders.push(order);
  // Supabase: full order row (buyer, product, plan/months, price, WhatsApp order).
  await supaInsert("orders", { email: order.email, buyer_name: order.buyerName, phone: order.phone, product_id: productId, product_name: productName, category: order.category, plan_months: order.planMonths, price: order.price, whatsapp_order: true, payment_method: order.paymentMethod, status: "pending" });
  res.json({ ok: true, order, note: "Order WhatsApp 03039929254 par confirm karein, Easypaisa se pay karein." });
});

// Owner marks a sale as paid/delivered — creates the purchases row
// (who bought what, with full buyer detail). Owner-only in production:
// call this from the server / Supabase Table Editor, not from the public app.
app.post("/api/purchases", async (req, res) => {
  const { orderId, email, buyerName, phone, productId, productName, category, planMonths, price, paymentMethod, paymentReference, userId } = req.body || {};
  if (!email || !productName) return res.status(400).json({ ok: false, error: "Email aur product zaroori hain." });
  const purchase = { id: purchases.length + 1, orderId: orderId || null, email, buyerName: buyerName || "", phone: phone || "", productId: productId || null, productName, category: category || "", planMonths: planMonths ?? null, price: price ?? null, paymentMethod: paymentMethod || "Easypaisa", paymentReference: paymentReference || "", status: "paid", purchasedAt: new Date().toISOString() };
  purchases.push(purchase);
  await supaInsert("purchases", { order_id: purchase.orderId, email, buyer_name: purchase.buyerName, phone: purchase.phone, product_id: purchase.productId, product_name: productName, category: purchase.category, plan_months: purchase.planMonths, price: purchase.price, payment_method: purchase.paymentMethod, payment_reference: purchase.paymentReference, status: "paid" });
  res.json({ ok: true, purchase });
});

app.get("/api/orders", (req, res) => res.json(orders));

// Owner overview (dev / server-side use): all tracking in one place.
// In production protect this with the owner check — the real owner view is
// Supabase Dashboard > Table Editor (see README).
app.get("/api/admin/overview", (req, res) => res.json({
  supabase: Boolean(supa),
  counts: { users: users.length, orders: orders.length, purchases: purchases.length, logins: loginHistory.length, visitors: visitors.length, activity: activity.length },
  recentLogins: loginHistory.slice(-20).reverse(),
  recentVisitors: visitors.slice(-20).reverse(),
  recentOrders: orders.slice(-20).reverse(),
  recentPurchases: purchases.slice(-20).reverse(),
  musePurchases: purchases.filter((p) => /muse/i.test(p.productName || "")),
}));

app.listen(PORT, () => console.log(`Asad Tools server: http://localhost:${PORT}`));
