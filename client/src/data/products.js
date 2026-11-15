// Asad Tools — 40 products.
// Prices: Asad's base rate + margin (up to Rs 1,000: +Rs 100;
// Rs 1,001–2,000: +Rs 200; Rs 2,001–4,000: +Rs 300; above Rs 4,000: +Rs 500–1,000).
// `price` below is the SELLING price shown to customers. No stock anywhere.
export const WHATSAPP_NUMBER = "03039929254";
export const WHATSAPP_LINK = "https://wa.me/923039929254";
export const EASYPAISA_NUMBER = "03039929254";
export const EASYPAISA_NAME = "Muhammad Asad";

export function sellingPrice(base) {
  if (base == null) return null;
  if (base <= 1000) return base + 100;
  if (base <= 2000) return base + 200;
  if (base <= 4000) return base + 300;
  if (base <= 5000) return base + 500;
  return base + 1000;
}

// duration: months as number, "14d" for 14 days, null = no duration
// Logos: asli brand logos, public/logos/ folder me save hain.
// Muse ka logo real Meta Muse 'm' PNG hai — Muse by Meta hai, Anthropic nahi.
export const PRODUCTS = [
  { id: 1, name: "Gemini Pro 6M CDK", detail: "No Card Required", category: "AI Tools", duration: 6, basePrice: 700, logo: "/logos/googlegemini.svg" },
  { id: 2, name: "Gemini Plus 6m Links", detail: "No Card Required", category: "AI Tools", duration: 6, basePrice: 400, logo: "/logos/googlegemini.svg" },
  { id: 3, name: "Gemini Plus 12m Links", detail: "No Card Required", category: "AI Tools", duration: 12, basePrice: 400, logo: "/logos/googlegemini.svg" },
  { id: 4, name: "CapCut Ultra 1M", detail: "39k Credits", category: "AI Tools", duration: 1, basePrice: 8000, logo: "/logos/capcut_com.png" },
  { id: 5, name: "CapCut Team 1M", detail: "1200 Credits", category: "AI Tools", duration: 1, basePrice: 600, logo: "/logos/capcut_com.png" },
  { id: 6, name: "HeyGen Creator 1M", detail: "600 Credits", category: "AI Tools", duration: 1, basePrice: 4000, logo: "/logos/heygen_com.png" },
  { id: 7, name: "Duolingo Super 12M", detail: "Coupons", category: "AI Tools", duration: 12, basePrice: 350, logo: "/logos/duolingo.svg" },
  { id: 8, name: "Muse AI Account", detail: "by Meta · Ready account", category: "AI Tools", duration: null, basePrice: 150, logo: "/logos/muse.png", byMeta: true },
  { id: 9, name: "ElevenLabs Creator 3M", detail: "", category: "AI Tools", duration: 3, basePrice: 3000, logo: "/logos/elevenlabs.svg" },
  { id: 10, name: "Replit Core 1M", detail: "20$ Credits", category: "AI Tools", duration: 1, basePrice: 900, logo: "/logos/replit.svg" },
  { id: 11, name: "ChatGPT Plus 1M", detail: "20DW", category: "AI Tools", duration: 1, basePrice: 2700, logo: "/logos/openai.svg" },
  { id: 12, name: "ChatGPT K12 Edu 2 Yrs", detail: "30DW", category: "AI Tools", duration: 24, basePrice: 2500, logo: "/logos/openai.svg" },
  { id: 13, name: "ChatGPT Plus 1M NW", detail: "", category: "AI Tools", duration: 1, basePrice: 1700, logo: "/logos/openai.svg" },
  { id: 14, name: "Kling Standard 1M", detail: "700-1000 Credits", category: "Developer & Team Tools", duration: 1, basePrice: null, logo: "/logos/klingai_com.png" },
  { id: 15, name: "Grok + Cursor Premium", detail: "14 Days", category: "Developer & Team Tools", duration: "14d", basePrice: 1500, logo: "/logos/x.svg" },
  { id: 16, name: "Grok Plus + Cursor", detail: "1 Month", category: "Developer & Team Tools", duration: 1, basePrice: 1500, logo: "/logos/x.svg" },
  { id: 17, name: "GitHub Student Developer Pack", detail: "", category: "Developer & Team Tools", duration: null, basePrice: 2900, logo: "/logos/github.svg" },
  { id: 18, name: "Bolt.new Pro Plan 1 Month", detail: "", category: "Developer & Team Tools", duration: 1, basePrice: 800, logo: "/logos/bolt_new.png" },
  { id: 19, name: "Bolt.new Pro Plan 12 Month", detail: "", category: "Developer & Team Tools", duration: 12, basePrice: 1900, logo: "/logos/bolt_new.png" },
  { id: 20, name: "Magic Patterns Starter 12 Months", detail: "", category: "Developer & Team Tools", duration: 12, basePrice: 1200, logo: "/logos/magicpatterns_com.png" },
  { id: 21, name: "Arize Pro 12 Month", detail: "", category: "Developer & Team Tools", duration: 12, basePrice: 900, logo: "/logos/arize_com.png" },
  { id: 22, name: "Airtable Team 12 Month", detail: "", category: "Developer & Team Tools", duration: 12, basePrice: 700, logo: "/logos/airtable.svg" },
  { id: 23, name: "Meshy Pro 1M", detail: "", category: "Developer & Team Tools", duration: 1, basePrice: 500, logo: "/logos/meshy_ai.png" },
  { id: 24, name: "Crunchyroll 1 Month", detail: "Link", category: "Developer & Team Tools", duration: 1, basePrice: 300, logo: "/logos/crunchyroll.svg" },
  { id: 25, name: "Microsoft Office 365 Plus 12M", detail: "", category: "Developer & Team Tools", duration: 12, basePrice: 300, logo: "/logos/microsoftoffice.svg" },
  { id: 26, name: "Figma Pro Edu 2 Yr", detail: "", category: "Developer & Team Tools", duration: 24, basePrice: 1500, logo: "/logos/figma.svg" },
  { id: 27, name: "Amazon Prime Video 6M", detail: "", category: "Subscriptions & Plans", duration: 6, basePrice: 600, logo: "/logos/amazonprime.svg" },
  { id: 28, name: "Amazon Prime Video 1M", detail: "", category: "Subscriptions & Plans", duration: 1, basePrice: 400, logo: "/logos/amazonprime.svg" },
  { id: 29, name: "Udemy Personal Plan 1M", detail: "", category: "Subscriptions & Plans", duration: 1, basePrice: 700, logo: "/logos/udemy.svg" },
  { id: 30, name: "Apple Music 5M", detail: "Redeem Link", category: "Subscriptions & Plans", duration: 5, basePrice: 350, logo: "/logos/applemusic.svg" },
  { id: 31, name: "Autodesk Admin Panel", detail: "3000 Invites", category: "Subscriptions & Plans", duration: null, basePrice: 2700, logo: "/logos/autodesk.svg" },
  { id: 32, name: "iLovePDF Premium 1 Yr", detail: "", category: "Subscriptions & Plans", duration: 12, basePrice: 2400, logo: "/logos/ilovepdf.svg" },
  { id: 33, name: "Framer Basic Plan 12M", detail: "", category: "Subscriptions & Plans", duration: 12, basePrice: 2100, logo: "/logos/framer.svg" },
  { id: 34, name: "JetBrains Edu Pack 12M", detail: "", category: "Subscriptions & Plans", duration: 12, basePrice: 1400, logo: "/logos/jetbrains.svg" },
  { id: 35, name: "Miro Edu Panel", detail: "100 Invites", category: "Subscriptions & Plans", duration: null, basePrice: 2700, logo: "/logos/miro.svg" },
  { id: 36, name: "Adobe Express Premium 12M", detail: "Coupons", category: "Subscriptions & Plans", duration: 12, basePrice: 400, logo: "/logos/adobe.svg" },
  { id: 37, name: "Adobe Express Invites 3M", detail: "", category: "Subscriptions & Plans", duration: 3, basePrice: null, logo: "/logos/adobe.svg" },
  { id: 38, name: "Notion Plus 12M", detail: "", category: "Subscriptions & Plans", duration: 12, basePrice: 800, logo: "/logos/notion.svg" },
  { id: 39, name: "Notion Business 3M", detail: "Coupon", category: "Subscriptions & Plans", duration: 3, basePrice: 400, logo: "/logos/notion.svg" },
  { id: 40, name: "LinkedIn Business 2M", detail: "New User", category: "Subscriptions & Plans", duration: 2, basePrice: 400, logo: "/logos/linkedin.svg" },
].map((p) => ({ ...p, price: sellingPrice(p.basePrice) }));

export const CATEGORIES = ["All", "AI Tools", "Developer & Team Tools", "Subscriptions & Plans"];

export const DURATIONS = [
  { key: "all", label: "Sab Muddat", months: null },
  { key: "14d", label: "14 Days", months: "14d" },
  { key: "1", label: "1 Month", months: 1 },
  { key: "2", label: "2 Months", months: 2 },
  { key: "3", label: "3 Months", months: 3 },
  { key: "5", label: "5 Months", months: 5 },
  { key: "6", label: "6 Months", months: 6 },
  { key: "12", label: "12 Months · 1 Year", months: 12 },
  { key: "24", label: "2 Years", months: 24 },
];

export function durationLabel(d) {
  if (d === null || d === undefined) return "";
  if (d === "14d") return "14 Days";
  if (d === 1) return "1 Month";
  if (d === 24) return "2 Years";
  return `${d} Months`;
}

export function whatsappOrderLink(product) {
  const price = product.price ? `Rs ${product.price.toLocaleString("en-PK")}` : "price on WhatsApp";
  const text = `Assalam-o-Alaikum! Mujhe ye chahiye: ${product.name} — ${price}. Asad Tools`;
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(text)}`;
}
