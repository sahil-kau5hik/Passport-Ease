# 🛂 PassportEase — Online Passport Application Portal

A comprehensive, modern passport application system built with **vanilla HTML, CSS, and JavaScript**. Features a robust 5-step verification pipeline, multi-step form wizard, role-based authentication (User / Admin / Police), AI Chatbot, Internationalization, Accessibility controls, and a complete aesthetic design system.

---

## 🌟 Live Demo Credentials

| Portal | Username | Password | Notes |
|--------|----------|----------|-------|
| **User** | Any email | Any password | Create via Sign Up |
| **Admin** | `admin` | `admin123` | Manages applications & verifies documents |
| **Police** | `police` | `police123` | Verifies candidates against criminal database |

---

## 🔄 5-Step Verification Pipeline

```text
┌──────────┐    ┌────────────────┐    ┌────────────────────┐    ┌────────────────────┐    ┌────────────────┐
│ SUBMITTED│───▶│ ADMIN APPROVED │───▶│ DOCUMENTS VERIFIED │───▶│ POLICE VERIFIED    │───▶│ PASSPORT ISSUED│
└──────────┘    └────────────────┘    └────────────────────┘    └────────────────────┘    └────────────────┘
     ↓                  ↓                       ↓                        ↓
  ❌ REJECTED       ❌ REJECTED            ❌ REJECTED             ❌ REJECTED
```

| Step | Action | Who | Description |
|------|--------|-----|-------------|
| 1 | **Submitted** | User | Application submitted after filling 7-step form |
| 2 | **Admin Approved** | Admin | Admin reviews applicant info and approves |
| 3 | **Documents Verified** | Admin | Admin verifies all uploaded documents. Specific feedback provided on rejections. |
| 4 | **Police Verified** | Police | Police checks Aadhaar against criminal database, verifies candidate |
| 5 | **Passport Issued** | System | Auto-generated passport number (e.g., J1234567) upon police clearance |

---

## 📁 Project Structure (18 files)

```text
sahil/
├── index.html           # Landing page with hero, features, stats, fee calculator
├── login.html           # User Login / Signup (Email, Phone OTP, Google)
├── login.js             # Authentication logic
├── admin-login.html     # Admin login portal
├── police-login.html    # Police officer login with city assignment
├── apply.html           # 7-step application wizard (Fresh & Renewal)
├── apply.js             # Wizard logic, validation, drafts, renewal auto-fill
├── track.html           # Application status tracking & re-upload portal
├── track.js             # Tracking logic, document re-upload, PDF generation
├── admin.html           # Admin dashboard (stats, table, management)
├── admin.js             # Admin logic (granular doc verification, user management)
├── police.html          # Police verification dashboard
├── police.js            # Criminal DB check, approve/reject, passport gen
├── chatbot.js           # AI Support Chatbot logic & UI
├── i18n.js              # Site-wide internationalization (Multilingual support)
├── shared.js            # Shared utilities (theme, toast, status mapping)
├── styles.css           # Complete CSS design system & accessibility styles
└── README.md            # This file
```

---

## 🎯 Features

### User Portal & Core Experience
- **7-Step Application Wizard**: Application Type (Fresh/Renewal) → Personal → Family → Contact → Documents → Appointment → Review
- **Passport Renewal**: Users can auto-fill data based on previous/existing applications.
- **6 Document Uploads**: Photo, Aadhaar, PAN, DOB Proof, Address Proof, Signature.
- **Watermarked Security**: Applies a semi-transparent world map overlay to all uploaded documents for enhanced security and branding.
- **Granular Re-uploading**: Seamless UI for re-uploading individual documents if rejected by the Admin, avoiding full restarts.
- **Appointment Booking**: Date picker + 16 time slots (9 AM – 5 PM) with collision prevention.
- **Fee Calculator Widget**: Floating component to compute estimated passport fees dynamically based on type, pages, and scheme (Tatkaal/Normal).
- **AI Support Chatbot**: Integrated artificial intelligence assistant to guide users across the portal.
- **Multilingual Support**: Switch seamlessly between languages natively using the integrated `i18n.js` framework.
- **Accessibility Controls**: Top bar with functional, site-wide font-size adjustments (`A-`, `A`, `A+`) and high accessibility features.
- **Helpdesk System**: Real-time user feedback and complaint submission modal.

### Admin Portal
- **Dashboard Stats**: Real-time total, submitted, verified, and rejected counts.
- **Granular Document Verification**: Reject individual documents (e.g., blurry photo) with precise localized feedback while approving the rest.
- **User & Helpdesk Management**: Native section to oversee system users and process helpdesk tracker records.
- **Detail View**: Complete applicant information modal with robust UI parsing.

### Police Portal
- **City-Based Assignment**: Police officer logs in with assigned city, only sees apps from that specific PSK.
- **Criminal Database Check**: Simulated Aadhaar lookup against criminal records.
  - Flagged Aadhaar numbers: `1111 1111 1111`, `2222 2222 2222`, `3333 3333 3333`, `9999 9999 9999`
- **Verification Modal**: Full applicant details + criminal check result + document preview.
- **Passport Issuance**: Auto-generates unique passport number upon clearance.

### Authentication & System
- **Role-Based Auth**: Protected routes for User, Admin, and Police levels.
- **Session Management**: `pe_session` in localStorage with role-based routing.
- **Dark/Light Mode**: Persistent theme toggle.
- **Glassmorphism UI**: High aesthetic, modern, and vibrant design with cohesive interactions and micro-animations.

---

## 🗄️ localStorage Data Models

| Key | Purpose |
|-----|---------|
| `pe_theme` | Light/Dark mode preference |
| `pe_session` | Current user session (role, name, city) |
| `pe_draft` | Auto-saved form data |
| `pe_draft_docs` | Auto-saved document Base64 data |
| `pe_applications` | All submitted applications |
| `pe_booked_slots` | Booked appointment slots by date |
| `pe_id_counter` | Sequential application ID counter |
| `pe_users` | Registered user accounts |
| `pe_complaints` | Recorded helpdesk feedback/complaints |

---

## 🚀 Getting Started

1. Open `index.html` in any modern browser, or serve with:
   ```bash
   npx serve .
   ```

2. **User Flow**: Login (or create account) → Select Language / Use Chatbot / Calculate Fee → Apply (Fresh/Renewal) → Track & Re-upload (if needed)

3. **Admin Flow**: Admin Login → Approve Applications → Verify Docs (Granular) → Manage Users & Helpdesk

4. **Police Flow**: Police Login (select city) → Verify Backgrounds → Issue Passport

---

*Built with ❤️ — Vanilla HTML, CSS, JavaScript. No frameworks. No dependencies.*
