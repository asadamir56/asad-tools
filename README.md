# Asad Tools — React + Node.js + Supabase

Store for digital subscriptions / accounts: Gemini, CapCut, ChatGPT, **Muse by Meta**,
HeyGen, ElevenLabs aur 40 products. **HTML/CSS single file nahi — ye poora React +
Node.js project hai, data Supabase me save hota hai.**

Owner: Muhammad Asad · WhatsApp / Easypaisa: **03039929254**

## Features (static Asad Tools wali sab kuch)
- **Durood Pak pehle:** Arabic Durood Sharif, button "Durood Parh Liya — App Kholein"
- **Login / Register — TechSMMPro-style layout, apne colours (deep teal + gold, orange nahi):**
  left hero (12,000+ Happy Clients, 1,000+ Services, FAST Instant Delivery, payment badges
  Easypaisa / JazzCash / Bank / VISA / Mastercard / PayPal), right "Welcome back" card
  (Log In / Create Account tabs, Username, Password Show/Hide, Remember me,
  Forgot password, Sign In, Continue with Google, "New here? Create a free account",
  "Secure, encrypted login")
- **Register order:** 1st Email, 2nd Password (min 6, hashed — SHA-256 frontend, bcrypt server),
  3rd Naam, 4th WhatsApp number (optional)
- **Email check:** Gmail format check + **Cloud Verify (MX)** — Cloudflare DNS-over-HTTPS se
  domain + mail server check. Temp-mail domains reject.
- **Login sirf registered email/number + sahi password se.** Session browser me save
  (Remember me = localStorage, warna sessionStorage).
- **40 products, 3 sections** (AI Tools 13, Developer & Team Tools 13, Subscriptions & Plans 14),
  real brand logos, **Muse — by Meta** (blue wavy "M", Anthropic/Claude nahi),
  **month filter "Kitne month wala plan chahiye?"** (Sab, 14 Days, 1/2/3/5/6/12 Months, 2 Years),
  category filter + search, WhatsApp order, Easypaisa payment. **Koi stock badge / count nahi.**
- **Rates:** base + margin (≤ Rs 1,000: +Rs 100; 1,001–2,000: +Rs 200; 2,001–4,000: +Rs 300;
  above: +Rs 500–1,000). Selling price dikhta hai. 2 products (Kling Standard, Adobe Express
  Invites 3M) ki price WhatsApp par hai — koi price invent nahi ki.
- **SEO:** title, description, Open Graph, Store + WebSite + FAQ JSON-LD.
  Fonts: Source Serif 4 headings, Archivo body, Amiri Durood. Warm paper background.

## Folder structure
```
asad-tools-react/
  client/                 React + Vite frontend
    package.json  vite.config.js  index.html
    .env.example
    public/logos/muse.svg        Muse by Meta logo
    src/main.jsx  src/App.jsx  src/index.css
    src/data/products.js         40 products + margin rule
    src/lib/supabaseClient.js    Supabase + Gmail/Cloud Verify
    src/components/DuroodScreen.jsx  AuthScreen.jsx  Store.jsx  ProductCard.jsx
  server/                 Node.js + Express backend
    package.json  server.js  products.js  .env.example
    API: GET /api/health, GET /api/products,
         POST /api/auth/register, POST /api/auth/login, POST/GET /api/orders,
         POST /api/track/visit, POST /api/track/signup, POST /api/track/login,
         POST /api/purchases, GET /api/admin/overview
  supabase/
    001_init.sql          profiles, products, orders + RLS + new-user trigger
    002_seed_products.sql 40 products seed
    003_tracking.sql      login_history, visitors, purchases, user_activity,
                          profiles first/last login + first order + totals,
                          auto-history triggers
  README.md  .gitignore
```

## Supabase saves EVERYTHING — tracking
Har cheez Supabase me save hoti hai (003_tracking.sql chalane ke baad):

| Table | Kya save hota hai |
|---|---|
| `profiles` | Signup details (naam, email, phone) + **first login, last login, login count, first order, last order, total orders, total spent** |
| `login_history` | **Kaun login hua** — email/number, time, device/browser, method (email/phone/Google), success |
| `visitors` | **Kaun web par aaya** — bina login ke bhi: session, page, time, device/browser, referrer |
| `orders` | **Kaun ne kya order kiya** — buyer naam, email/number, product, category, **plan/months**, price, WhatsApp order, Easypaisa, status |
| `purchases` | **Kaun ne kya KHARIDA** (confirmed sale) — buyer, product, plan, price, payment reference (Easypaisa TrxID), status paid/delivered |
| `user_activity` | **Har user ki poori history** — signup, first login, har login, first order, har order, har purchase, ek timeline me |

Kaise record hota hai: app khulte hi visit record hoti hai (`App.jsx` → `recordVisit`),
register par signup, login par login history, WhatsApp Order button dabate hi order
(`ProductCard.jsx` → `recordOrder`) — buyer WhatsApp par jaane se PEHLE order Supabase
me save ho jata hai. Node API: `POST /api/track/visit`, `POST /api/track/signup`,
`POST /api/track/login`, `POST /api/orders`, `POST /api/purchases`
(owner paid mark kare), `GET /api/admin/overview`.

**Muse AI Account kis ne kharida?** — `purchases` table me product_name me "Muse" search karein,
ya SQL Editor me ye chalyein:
```sql
select * from public.purchases where product_name ilike '%Muse%' order by purchased_at desc;
```

### Owner (Asad) data kaise dekhe — Supabase Table Editor
1. https://supabase.com → apna project `asad-tools` kholein → left menu **Table Editor**
2. Table chunein: `profiles`, `login_history`, `visitors`, `orders`, `purchases`, `user_activity`
3. **Asad ko sab kuch dikhega** — Table Editor project owner ke liye RLS bypass karta hai.
   Users app se sirf **apni khud ki** rows dekh sakte hain (RLS policies) — doosre buyer ka
   data kabhi nahi dekh sakte.
4. Kisi ek buyer ki poori history: Table Editor me `user_activity` kholein → **Filter** →
   `email` = buyer ki email → **Sort: created_at** — first login, first order, sab orders
   ek hi jagah.
5. Filter / Sort / Search: har table ke upar filter bar hai — date, email, product ya
   status se filter karein; **Export CSV** se poora data download bhi kar sakte hain.
6. SQL Editor me ready queries 003_tracking.sql ke end me likhi hain (Muse buyers,
   aaj ke visitors, ek buyer ki timeline).

### SQL chalane ka order (SQL Editor)
1. `001_init.sql` → 2. `002_seed_products.sql` → 3. `003_tracking.sql`


## Step 1 — Supabase project banao (free)
1. https://supabase.com → Sign up (GitHub/Google se) → **New project**
2. Project name `asad-tools`, password apni marzi ka rakhein (yeh password kahin share na karein)
3. Project khulne ke baad: left menu **SQL Editor** → **New query**
4. `supabase/001_init.sql` ka poora text paste karein → **Run**
5. Phir `supabase/002_seed_products.sql` paste karein → **Run**
6. Phir `supabase/003_tracking.sql` paste karein → **Run** (login/visitors/orders/purchases/activity)
6. Left menu **Settings → API**: `Project URL` aur `anon public` key copy karein
   (service_role key sirf server ke liye hai — kabhi frontend / GitHub me na daalein)

## Step 2 — Google sign-in (optional, REAL — fake nahi)
Real "Continue with Google" ke liye:
1. Google Cloud Console → OAuth Client ID banao (Web application)
2. Supabase Dashboard → **Authentication → Providers → Google** → ON karein,
   Client ID + Client Secret daalein, redirect URL copy kar ke Google Console me daalein
3. Tab tak app Gmail se Register/Login se chalega — Google button yehi samjhata hai.
   **Bina is step ke Google sign-in kaam nahi karega — ye sach hai, fake nahi.**

## Step 3 — Code chalao (Windows CMD)
```cmd
cd C:\Users\%USERNAME%\Downloads\asad-tools-react
cd client
copy .env.example .env
notepad .env
```
`.env` me apni Supabase URL + anon key likhein, save karein, phir:
```cmd
npm install
npm run dev
```
Browser me kholein: **http://localhost:5173**

Backend (doosri CMD window):
```cmd
cd C:\Users\%USERNAME%\Downloads\asad-tools-react\server
copy .env.example .env
notepad .env
npm install
npm run dev
```
Server: **http://localhost:5000** — check: http://localhost:5000/api/health

Build check:
```cmd
cd ..\client
npm run build
```
`dist/` folder banega — yehi deploy hota hai.

## Step 4 — GitHub par upload karo
```cmd
cd C:\Users\%USERNAME%\Downloads\asad-tools-react
git init
git add .
git commit -m "Asad Tools - React Node Supabase"
git branch -M main
git remote add origin https://github.com/USERNAME/asad-tools.git
git push -u origin main
```
Ya GitHub website se: New repo `asad-tools` (Public) → **Upload files** → poora folder drag karein.
**`.env` kabhi upload na karein** — `.gitignore` me hai, is liye git me nahi jayega.
**Koi real password / API key code me nahi hai** — sirf `.env.example` me placeholders hain.

## Step 5 — Live karo (Netlify / Vercel, free)
**Netlify:** New site → Import from GitHub → repo `asad-tools` → Base directory `client` →
Build command `npm run build` → Publish directory `client/dist` → Deploy.
Phir Netlify → **Site settings → Environment variables** me ye daalein:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
**Vercel:** same — Root Directory `client`, Build `npm run build`, Output `dist`.

Backend live karne ke liye (optional): server ko Render / Railway (free tier) par deploy karein,
aur `client/.env` me `VITE_API_URL` us server ka URL likhein.

## Honest limits
- Google sign-in + mail par code: sirf Supabase Google OAuth / email OTP se — Step 2 ke baghair nahi.
- Cloud Verify domain/MX check karta hai, kisi khaas inbox ki ownership nahi — ownership sirf
  Google sign-in / mail code se confirm hoti hai.
- Server ka in-memory fallback sirf dev ke liye hai — restart par wipe ho jata hai. Real data
  Supabase me hai (profiles / products / orders).
