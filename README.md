# 🏥 Jivan TeleHealth Connect

> **Next-generation telemedicine platform** — consult doctors via video call, manage health records, request emergency ambulance, find blood donors, and access government health schemes — all from one platform.

<div align="center">

![Jivan TeleHealth](https://img.shields.io/badge/Jivan-TeleHealth-0ea5e9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek0xMyAxN2gtMnYtNmgydjZ6bTAtOGgtMlY3aDJ2MnoiLz48L3N2Zz4=)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Demo Credentials](#-demo-credentials)
- [API Reference](#-api-reference)
- [Pages & Modules](#-pages--modules)
- [Doctor Subscription Plans](#-doctor-subscription-plans)
- [Security](#-security)
- [Database Schema](#-database-schema)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Jivan TeleHealth Connect** is a full-stack healthcare web platform designed for the Indian market. It bridges the gap between patients and doctors through telemedicine, provides access to government health schemes, and offers critical emergency services — all with a clean, mobile-first interface that works in both light and dark mode.

The platform is built entirely with vanilla HTML/CSS/JS on the frontend and a Node.js/Express backend, making it lightweight, fast, and easy to deploy anywhere.

---

## 🚀 Live Demo

```
http://localhost:3000
```

> Run `node server.js` and open your browser to get started instantly.

### Demo Quick-Login

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| 👨‍⚕️ Doctor (Premium) | `vikram@demo.com` | `doctor123` | `/admin.html` |
| 🧑‍⚕️ Doctor (Pro) | `rajesh@demo.com` | `doctor123` | `/admin.html` |
| 🧑 Patient | `aryan@demo.com` | `patient123` | `/health.html` |
| 🧑 Patient | `priya@demo.com` | `patient123` | `/health.html` |

---

## ✨ Features

### 👨‍⚕️ For Patients
| Feature | Description |
|---------|-------------|
| 🎥 **Video Consultation** | Book instant or scheduled video calls with specialist doctors |
| 📋 **Health Records** | Centralised digital records — prescriptions, lab reports, history |
| 🪪 **Unique Patient ID** | Jivan ID card for cashless treatment at any affiliated hospital |
| 🚨 **Emergency Ambulance** | One-tap ambulance dispatch with live ETA tracking |
| 🩸 **Blood Donor Finder** | Search donors by blood group and city in real-time |
| 📚 **Health Awareness** | Full-content articles on govt. schemes, hygiene, diet, mental health |
| 🛡️ **Life Insurance** | Curated insurance plans with lead capture for advisor follow-up |
| 🤖 **AI Chatbot + Voice** | Voice-enabled AI assistant on every page |

### 👨‍⚕️ For Doctors
| Feature | Description |
|---------|-------------|
| 📅 **Live Dashboard** | Real-time appointment schedule with SSE push notifications |
| 🔔 **Instant Booking Alerts** | Notified the moment a patient books — no refresh needed |
| ✅ **Appointment Management** | Confirm, cancel, or join video calls from the dashboard |
| 👥 **Patient Records** | View all registered patients with health profiles |
| ⭐ **Subscription Plans** | Free / Pro / Premium tiers — higher plan = higher search ranking |
| 📊 **Schedule View** | Today's schedule, full calendar, pending actions |

### 🔒 Security & Infrastructure
| Feature | Description |
|---------|-------------|
| 🛡️ **Security Headers** | CSP, X-Frame-Options, X-XSS-Protection, Referrer-Policy |
| ⚡ **Rate Limiting** | Per-IP, per-route limits (in-memory, auto-cleaned) |
| 🧹 **Input Sanitisation** | All request bodies sanitised before DB writes |
| 🔐 **Auth Guards** | Session-token auth; doctors only see their own appointments |
| 📡 **SSE Live Updates** | Server-Sent Events for real-time booking notifications |

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** — Semantic, accessible markup
- **Tailwind CSS** (CDN) — Utility-first responsive styling
- **Vanilla JavaScript** (ES2020) — No framework dependencies
- **Material Symbols** — Google's icon library
- **Web Speech API** — Voice input for the AI chatbot
- **Server-Sent Events (SSE)** — Real-time push from server to browser

### Backend
- **Node.js** (v18+) — Runtime
- **Express.js** (v4) — HTTP framework
- **JSON file-based DB** — Zero-dependency persistence via `db.json`
- **CORS** — Cross-origin resource sharing middleware

### Design System
- **Color Palette:** Primary `#0ea5e9` (sky blue) · Secondary `#14b8a6` (teal) · Emergency `#ef4444` (red)
- **Typography:** Public Sans (patients) · Inter (doctor dashboard)
- **Dark Mode:** Class-based Tailwind dark mode with `localStorage` persistence, zero flash

---

## 📁 Project Structure

```
jivan-telehealth/
│
├── 🖥️  server.js              # Express server — all API routes, SSE, security
├── 🔌  jivan-backend.js       # Browser API client — Auth, Appointments, Records…
├── 🤖  chatbot-voice.js       # Shared AI chatbot + voice assistant (all pages)
├── 🔑  nav-auth.js            # Shared nav auth — logout dropdown on every page
├── 💾  db.json                # File-based database (auto-seeded on first run)
│
├── 📄  index.html             # Home page — hero, doctors, news, insurance, chatbot
├── 📄  login.html             # Login — patient / doctor role toggle
├── 📄  register.html          # Registration — patient & doctor sign-up
│
├── 📄  health.html            # Patient dashboard — records, appointments, stats
├── 📄  call.html              # Find doctors — search, filter, book consultation
├── 📄  admin.html             # Doctor dashboard — schedule, live notifications
│
├── 📄  awer.html              # Health Awareness Hub — 10 full-content articles
├── 📄  blood.html             # Blood Donor Finder — search & register
├── 📄  emg.html               # Emergency page — ambulance dispatch
├── 📄  id.html                # Patient ID card — printable Jivan ID
│
└── 📄  README.md              # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v8 or higher (comes with Node.js)
- A modern browser (Chrome, Edge, or Firefox)

### Installation

```bash
# 1. Clone or download the project
git clone https://github.com/your-username/jivan-telehealth.git
cd jivan-telehealth

# 2. Install dependencies
npm install express cors

# 3. Start the server
node server.js

# 4. Open in browser
# http://localhost:3000
```

> **That's it.** No build step, no bundler, no environment variables needed.  
> The database (`db.json`) is auto-created with demo data on first run.

### Custom Port

```bash
PORT=8080 node server.js
```

---

## 🔑 Demo Credentials

### Patients
| Name | Email | Password | Blood Group | Conditions |
|------|-------|----------|-------------|------------|
| Aryan Sharma | `aryan@demo.com` | `patient123` | O+ | Migraine |
| Priya Nair | `priya@demo.com` | `patient123` | A+ | Hypertension |
| Rahul Verma | `rahul@demo.com` | `patient123` | B+ | Diabetes Type 2 |
| Sneha Pillai | `sneha@demo.com` | `patient123` | AB+ | Asthma |

### Doctors
| Name | Email | Password | Specialisation | Subscription |
|------|-------|----------|----------------|--------------|
| Dr. Vikram Sethi | `vikram@demo.com` | `doctor123` | Neurologist | ⭐ Premium |
| Dr. Rajesh Varma | `rajesh@demo.com` | `doctor123` | Cardiologist | 🔵 Pro |
| Dr. Anita Desai | `anita@demo.com` | `doctor123` | Pediatrician | ⚪ Free |

---

## 📡 API Reference

Base URL: `http://localhost:3000/api`

All protected routes require the header: `x-session-token: <token>`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new patient or doctor | ❌ |
| `POST` | `/auth/login` | Login and receive session token | ❌ |
| `POST` | `/auth/logout` | Invalidate session token | ✅ |
| `GET`  | `/auth/me` | Get current user profile | ✅ |

### Appointments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/appointments/book` | Book a consultation | ✅ Patient |
| `GET`  | `/appointments/mine` | Get your appointments (role-filtered) | ✅ |
| `GET`  | `/appointments/all` | Get all appointments | ✅ Doctor |
| `PATCH`| `/appointments/:id/status` | Update status (confirmed/cancelled/completed) | ✅ Doctor |

### Health Records

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`  | `/records/mine` | Get patient's health records | ✅ |
| `POST` | `/records/add` | Add a new health record | ✅ |
| `DELETE`| `/records/:id` | Delete a record (owner only) | ✅ |

### Doctors & Subscriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`  | `/doctors` | List doctors (sorted by subscription tier) | ❌ |
| `PATCH`| `/doctors/subscription` | Update subscription plan | ✅ Doctor |

### Blood Bank

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`  | `/donors?bloodGroup=O+&city=Mumbai` | Search donors | ❌ |
| `POST` | `/donors/register` | Register as donor | ❌ |

### Emergency & Other

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/emergency/request` | Request ambulance dispatch | ❌ |
| `GET`  | `/emergency/all` | List all emergency requests | ❌ |
| `POST` | `/subscribe` | Newsletter subscription | ❌ |
| `GET`  | `/events` | SSE stream for live notifications | ✅ Doctor |

---

## 📄 Pages & Modules

### `index.html` — Home Page
The public-facing landing page. Includes:
- **Hero section** with CTAs for booking and emergency
- **Services grid** — 6 feature cards linking to all modules
- **Doctors section** — top 4 doctors with booking CTA
- **Health Awareness preview** — links to full articles
- **Emergency section** — 108, ambulance, blood centre
- **Health News** — 6 live news cards with full-content modals
- **Life Insurance** — 3 plans (Term, Combo, ULIP) with lead capture
- **AI Chatbot** with voice input (bottom-right floating button)
- Dark mode, mobile-responsive drawer nav

### `admin.html` — Doctor Dashboard
Protected page (doctor login required). Features:
- **Stats bar** — patients today, pending, confirmed, total
- **Today's Schedule** — live-updating list with confirm/join/cancel
- **All Appointments** — searchable full table
- **Patient Records** — all registered patients
- **Subscription** — upgrade plan with live state
- **SSE connection** — instant notification when patient books
- Live toast + bell icon for new bookings

### `call.html` — Find & Book Doctors
- Doctor cards sorted by subscription (Premium first, then Pro, then Free)
- Search by name or specialty
- Filter by specialty dropdown
- Calendar day picker + time slot selection
- Booking confirmation modal
- Patient's upcoming appointments shown after login

### `health.html` — Patient Dashboard
- Health stats (appointments, records, upcoming)
- Health records list (lab reports, prescriptions)
- Add / delete records
- Appointment history with status badges
- Links to booking and ID card

### `awer.html` — Health Awareness Hub
- **10 full-content articles** with category filters
- Article modal with complete prose, step-by-step guides, callout boxes
- Categories: Govt. Schemes · Hygiene · Diet · Mental Health · Emergency First Aid · News
- PM-JAY guide, State Schemes comparison, WHO handwashing, Monsoon guide, Dietary advice, Stress & Sleep guides, CPR & First Aid
- Newsletter subscription (calls `/api/subscribe`)

### `blood.html` — Blood Donor Finder
- Search donors by blood group and city
- Live results from server API
- Register as a donor (name, blood group, city, phone)
- 9 pre-seeded demo donors across Mumbai, Pune, Delhi, Bengaluru, Chennai

### `emg.html` — Emergency Services
- One-tap ambulance request with location
- Live ETA and unit assignment from server
- 108 and NDRF emergency numbers
- Hospital directory and blood centre links

### `id.html` — Patient ID Card
- Digital Jivan ID card (printable)
- Shows name, blood group, DOB, gender, allergies warning
- Copy ID to clipboard
- Full health profile below card

---

## ⭐ Doctor Subscription Plans

Doctors can upgrade their plan from the Dashboard → Subscription section.

| Plan | Price | Search Rank | Badge | Features |
|------|-------|-------------|-------|----------|
| **Free** | ₹0/month | 3rd (last) | None | Accept appointments, basic profile |
| **Pro** | ₹999/month | 2nd | 🔵 Pro | Priority listing, Pro badge, analytics |
| **Premium** | ₹2,499/month | 1st (featured) | ⭐ Premium | Top position, featured badge, max visibility |

> Patients see Premium doctors first, Pro doctors second, Free doctors last — incentivising upgrade.

---

## 🔒 Security

### Headers (applied on every response)
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Rate Limiting (per IP, per route)
| Route | Limit |
|-------|-------|
| `/api/auth/register` | 10 req / minute |
| `/api/auth/login` | 20 req / minute |
| `/api/appointments/book` | 30 req / minute |
| `/api/emergency/request` | 5 req / minute |
| `/api/subscribe` | 5 req / minute |

### Input Sanitisation
All string fields in request bodies are sanitised before being written to the database — `< > " '` characters are escaped.

### Auth Guards
- Session token required for all protected routes
- Doctors can only view/update **their own** appointments
- Patients can only delete **their own** records
- Appointment status updates are validated against allowed values

### Passwords
Stored as Base64-encoded strings in the JSON database. **For production**, replace with `bcrypt` hashing.

> ⚠️ **Production Note:** This project uses a JSON file as its database and Base64 password encoding for simplicity. Before deploying to a public server, replace `db.json` with a real database (PostgreSQL, MongoDB) and use `bcrypt` for password hashing.

---

## 💾 Database Schema

The `db.json` file is auto-seeded on first run. Structure:

```json
{
  "users": [
    {
      "id": "USR001",
      "role": "patient",
      "name": "Aryan Sharma",
      "email": "aryan@demo.com",
      "phone": "9876543210",
      "password": "<base64>",
      "dob": "1995-04-12",
      "gender": "Male",
      "bloodGroup": "O+",
      "address": "Bengaluru, Karnataka",
      "allergies": "Penicillin, Peanuts",
      "conditions": "Migraine",
      "emergencyContact": "9123456789",
      "jivanId": "JIV-293-882-99",
      "createdAt": "ISO timestamp"
    },
    {
      "id": "DOC001",
      "role": "doctor",
      "name": "Dr. Vikram Sethi",
      "specialization": "Neurologist",
      "subscription": "premium",
      "fee": 900,
      "rating": 4.9,
      "jivanId": "DOC-001-VIK-SET"
    }
  ],
  "appointments": [
    {
      "id": "APT001",
      "patientId": "USR001",
      "patientName": "Aryan Sharma",
      "doctorId": "DOC001",
      "doctorName": "Dr. Vikram Sethi",
      "date": "YYYY-MM-DD",
      "time": "10:30 AM",
      "type": "Video",
      "status": "confirmed",
      "fee": 900
    }
  ],
  "records": [],
  "donors": [],
  "emergencies": [],
  "sessions": {},
  "subscribers": []
}
```

---

## 🗺️ Roadmap

### Phase 2 — Planned
- [ ] Real-time video calling via WebRTC / Jitsi integration
- [ ] Payment gateway integration (Razorpay / PhonePe)
- [ ] OTP-based login (Twilio / MSG91)
- [ ] PostgreSQL database migration
- [ ] Push notifications (Firebase FCM)
- [ ] E-prescription PDF generation
- [ ] Doctor profile pages with reviews
- [ ] Admin super-dashboard for platform management

### Phase 3 — Future
- [ ] Mobile apps (React Native)
- [ ] ABHA (Ayushman Bharat Health Account) integration
- [ ] AI-powered symptom checker
- [ ] Lab test booking integration
- [ ] Pharmacy integration for medicine delivery
- [ ] Multi-language support (Hindi, Marathi, Tamil, Telugu)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and test
node server.js

# 4. Commit with a descriptive message
git commit -m "feat: add real-time video calling via WebRTC"

# 5. Push and open a Pull Request
git push origin feature/your-feature-name
```

### Coding Standards
- Use `async/await` for all asynchronous operations
- Sanitise all user inputs before DB operations
- Add `escHtml()` when rendering user data in HTML
- Follow existing naming conventions (`camelCase` for JS, `kebab-case` for HTML IDs)

---

## 📞 Support & Contact

- 📧 **Email:** support@jivantelehealth.in
- 📞 **Helpline:** +91 1800-JIVAN-01
- 🌐 **Website:** https://jivantelehealth.in
- 🚨 **Medical Emergency:** Call **108** (do not contact us for emergencies)

---

## 📄 License

```
MIT License

Copyright (c) 2026 Jivan TeleHealth Connect

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

Made with ❤️ for India's healthcare ecosystem

**Jivan TeleHealth Connect** · Connecting patients with care, anywhere.

</div>
