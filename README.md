# 🛂 PassportEase — Online Passport Application Portal

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://passport-ease.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive, modern passport application system built with **vanilla HTML, CSS, and JavaScript**, backed by **Supabase** for real-time cloud data persistence. Features a 5-step verification pipeline, multi-step form wizard, role-based authentication (User / Admin / Police), AI Chatbot, Internationalization, and a complete design system — deployable on Vercel in one click.

---

## 🌐 Live URLs (after Vercel deployment)

| Page | URL |
|------|-----|
| Home | `https://passport-ease.vercel.app/` |
| Apply | `https://passport-ease.vercel.app/html/apply` |
| Track | `https://passport-ease.vercel.app/html/track` |
| Login | `https://passport-ease.vercel.app/html/login` |
| Admin | `https://passport-ease.vercel.app/html/admin-login` |
| Police | `https://passport-ease.vercel.app/html/police-login` |

---

## 🌟 Demo Credentials

| Portal | Username | Password | Notes |
|--------|----------|----------|-------|
| **User** | Any email | Any password | Register via Sign Up |
| **Admin** | `admin` | `admin123` | Manages applications & documents |
| **Police** | `police` | `police123` | Select any city at login |

---

## 🔄 5-Step Verification Pipeline

```text
[1] Submitted ──▶ [2] Documents Verified ──▶ [3] Police Verified ──▶ [4] Admin Approved ──▶ [5] Passport Issued
                         │                            │
                   ❌ Docs Failed              ❌ Rejected
                  (User re-uploads)
```

| Step | Status | Actor | Description |
|------|--------|-------|-------------|
| 1 | **Submitted** | User | 7-step form submitted with docs & appointment |
| 2 | **Documents Verified / Failed** | Admin | Granular per-document approve/reject with feedback |
| 3 | **Police Verified** | Police | Aadhaar criminal DB check + background clearance |
| 4 | **Admin Approved** | Admin | Final approval gate before issuance |
| 5 | **Passport Issued** | Admin | Unique passport number auto-generated |

---

## 📁 Project Structure

```text
Passport-Ease/
├── index.html                  # Root landing page (hero, features, stats, map, fee calc)
│
├── html/                       # All other pages
│   ├── login.html              # User login & signup (Email / Phone OTP / Google)
│   ├── admin-login.html        # Admin login portal
│   ├── admin.html              # Admin dashboard
│   ├── apply.html              # 7-step application wizard
│   ├── track.html              # Application tracking & document re-upload
│   ├── police-login.html       # Police officer login with city assignment
│   └── police.html            # Police verification dashboard
│
├── css/
│   └── styles.css              # Complete CSS design system (variables, themes, components)
│
├── js/
│   ├── shared.js               # Supabase client, PE.* API, theme, toast, utilities
│   ├── login.js                # Auth logic (signup/login, OTP simulation, Google)
│   ├── apply.js                # Wizard, validation, auto-save draft, renewal auto-fill
│   ├── track.js                # Status tracker, document re-upload, PDF generation
│   ├── admin.js                # Admin dashboard, granular doc verification, user mgmt
│   ├── police.js               # Criminal DB simulation, police approve/reject
│   ├── chatbot.js              # AI support chatbot UI & logic
│   └── i18n.js                 # Site-wide multilingual translation framework
│
├── assets/
│   └── india_map.png           # India administrative map (PSK location visual)
│
├── vercel.json                 # Vercel routing, clean URLs, security headers, caching
├── robots.txt                  # SEO: allow crawlers, block admin/police portals
├── sitemap.xml                 # XML sitemap for search engines
├── .gitignore
└── README.md
```

---

## 🗄️ Supabase Database Schema

> Run `supabase_setup.sql` in **Supabase Dashboard → SQL Editor → New Query**

| Table | Purpose |
|-------|---------|
| `pe_store` | Key-value store: theme, booked slots, ID counter, drafts |
| `pe_applications` | All passport applications (indexed by status, city, user) |
| `pe_users` | Registered citizen accounts |
| `pe_complaints` | Helpdesk feedback & complaints |

All tables have **Row Level Security (RLS)** enabled with public anon policies for demo use.

### Supabase Configuration (`js/shared.js`)
```js
const SUPABASE_URL     = 'https://ycpivhefrggsjrpdmfxe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KGS_gOQ8gYLeAOnE97J0fw_hnRtrNwR';
```

---

## 🎯 Features

### 👤 User Portal
- **7-Step Application Wizard** — Application Type → Personal → Family → Contact → Documents → Appointment → Review
- **Passport Renewal** — Auto-fills form from existing application data
- **6 Document Uploads** — Photo, Aadhaar, PAN, DOB Proof, Address Proof, Signature (max 2MB, Base64 preview)
- **Watermarked Security** — Semi-transparent world map overlay on all uploaded documents
- **Document Re-upload** — Re-upload only rejected documents individually without restarting
- **Appointment Booking** — 16 daily slots (9 AM – 5 PM) with anti-collision slot locking
- **Fee Calculator** — Floating widget for dynamic fee calculation (type × pages × scheme)
- **AI Chatbot** — Integrated assistant to guide users across the portal (24/7)
- **Multilingual** — Site-wide language switching via `i18n.js`
- **Accessibility Bar** — Font-size controls (A− / A / A+), skip to content, screen reader link

### 🔧 Admin Portal
- **Live Dashboard Stats** — Submitted / Verified / Rejected / Issued counts
- **Granular Doc Verification** — Approve/reject each document individually with failure reasons
- **User Management** — View all registered citizen accounts
- **Helpdesk Manager** — View all submitted complaints & feedback

### 🛡️ Police Portal
- **City-Based Filtering** — Officer only sees applications from their assigned PSK city
- **Criminal DB Simulation** — Aadhaar lookup against flagged records
  - Flagged: `1111 1111 1111` · `2222 2222 2222` · `3333 3333 3333` · `9999 9999 9999`
- **Verification Modal** — Full applicant details + criminal check result + doc preview

### ⚙️ System
- **Supabase Backend** — Real-time cloud persistence with graceful localStorage fallback
- **Role-Based Auth** — `pe_session` in localStorage; protected pages redirect unauthorised users
- **Dark / Light Mode** — Persistent theme, saved to Supabase `pe_store`
- **Glassmorphism UI** — Premium design with gradients, micro-animations, and vibrant palette

---

## 🚀 Deploy on Vercel

1. Push this repo to GitHub (already done ✅)
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import `sahil-kau5hik/Passport-Ease`
3. Framework: **Other** — no build command needed
4. Click **Deploy**

Clean URL redirects are pre-configured in `vercel.json`:
```
/login        → /html/login
/apply        → /html/apply
/track        → /html/track
/admin        → /html/admin
/police       → /html/police
```

---

## 🗃️ Local Development

```bash
# Clone the repo
git clone https://github.com/sahil-kau5hik/Passport-Ease.git
cd Passport-Ease

# Serve locally (no build step needed)
npx serve .
# or
npx live-server .
```

Then open `http://localhost:3000` in your browser.

---

## 📊 Data Flow

```
User Action (Browser)
      │
      ▼
shared.js (PE.saveApplication / PE.saveUser / PE.saveComplaint)
      │
      ├──▶ Supabase REST API (pe_applications / pe_users / pe_complaints)
      │         └── Real-time cloud storage ✅
      │
      └──▶ localStorage (fallback if Supabase unreachable)
                  └── Graceful degradation ✅
```

---

## 🔒 Security Notes

- The `SUPABASE_ANON_KEY` used here is a **publishable key** — safe to expose in frontend code
- Admin/Police portals are blocked from search engine indexing via `robots.txt`
- In production, replace plain-text passwords with **Supabase Auth** (magic links / OTP)
- RLS policies currently allow all anon access — tighten per-user in production

---

*Built with ❤️ — Vanilla HTML, CSS, JavaScript. Backend: Supabase. Hosting: Vercel. No frameworks. No npm.*
