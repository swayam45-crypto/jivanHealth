/**
 * ============================================================
 *  JIVAN TELEHEALTH — Node.js Express Server (PRODUCTION READY)
 *  Run: node server.js
 *  Open: http://localhost:3000
 * ============================================================
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security Headers ────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── CORS ────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));

// ── Body Parser ─────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.static(__dirname));

// ── Rate Limiter ─────────────────────────────────────────────
const rateLimits = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const key = (req.ip || 'x') + ':' + req.path;
    const now = Date.now();
    const e = rateLimits.get(key) || { count: 0, reset: now + windowMs };
    if (now > e.reset) { e.count = 0; e.reset = now + windowMs; }
    e.count++;
    rateLimits.set(key, e);
    if (e.count > max) return res.status(429).json({ ok: false, msg: 'Too many requests.' });
    next();
  };
}
setInterval(() => { const now = Date.now(); rateLimits.forEach((v,k) => { if (now > v.reset) rateLimits.delete(k); }); }, 300000);

// ── Input Sanitize ───────────────────────────────────────────
function san(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/[<>"']/g, '').trim().slice(0, 500);
}
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const k of Object.keys(req.body)) {
      if (typeof req.body[k] === 'string') req.body[k] = san(req.body[k]);
    }
  }
  next();
});

// ── SSE clients for live notifications ─────────────────────
// Map: doctorId → Set of SSE response objects
const sseClients = new Map();

function notifyDoctor(doctorId, event, data) {
  const clients = sseClients.get(doctorId);
  if (!clients || clients.size === 0) return;
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(res => { try { res.write(msg); } catch(e) { clients.delete(res); } });
}

// SSE endpoint — doctor subscribes for live updates
app.get('/api/events', (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== 'doctor') {
    res.status(401).end();
    return;
  }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send a heartbeat immediately
  res.write('event: connected\ndata: {"ok":true}\n\n');

  if (!sseClients.has(session.userId)) sseClients.set(session.userId, new Set());
  sseClients.get(session.userId).add(res);

  // Heartbeat every 25s to keep connection alive
  const hb = setInterval(() => { try { res.write(': heartbeat\n\n'); } catch(e) { clearInterval(hb); } }, 25000);

  req.on('close', () => {
    clearInterval(hb);
    const set = sseClients.get(session.userId);
    if (set) { set.delete(res); if (set.size === 0) sseClients.delete(session.userId); }
  });
});

// ── Database ─────────────────────────────────────────────────
const DB_FILE = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) return seedDB();
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return seedDB(); }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  return data;
}

function today()    { return new Date().toISOString().split('T')[0]; }
function tomorrow() { return new Date(Date.now() + 86400000).toISOString().split('T')[0]; }

function seedDB() {
  const data = {
    users: [
      {
        id: 'USR001', role: 'patient',
        name: 'Aryan Sharma', email: 'aryan@demo.com', phone: '9876543210',
        password: Buffer.from('patient123').toString('base64'),
        dob: '1995-04-12', gender: 'Male', bloodGroup: 'O+',
        address: 'Bengaluru, Karnataka', allergies: 'Penicillin, Peanuts',
        conditions: 'Migraine', emergencyContact: '9123456789',
        jivanId: 'JIV-293-882-99', createdAt: new Date().toISOString()
      },
      {
        id: 'USR002', role: 'patient',
        name: 'Priya Nair', email: 'priya@demo.com', phone: '9812345001',
        password: Buffer.from('patient123').toString('base64'),
        dob: '1990-07-22', gender: 'Female', bloodGroup: 'A+',
        address: 'Mumbai, Maharashtra', allergies: 'Sulfa drugs',
        conditions: 'Hypertension', emergencyContact: '9123456001',
        jivanId: 'JIV-112-443-77', createdAt: new Date().toISOString()
      },
      {
        id: 'USR003', role: 'patient',
        name: 'Rahul Verma', email: 'rahul@demo.com', phone: '9812345002',
        password: Buffer.from('patient123').toString('base64'),
        dob: '1985-11-03', gender: 'Male', bloodGroup: 'B+',
        address: 'New Delhi', allergies: 'None', conditions: 'Diabetes Type 2',
        emergencyContact: '9123456002',
        jivanId: 'JIV-334-556-11', createdAt: new Date().toISOString()
      },
      {
        id: 'USR004', role: 'patient',
        name: 'Sneha Pillai', email: 'sneha@demo.com', phone: '9812345003',
        password: Buffer.from('patient123').toString('base64'),
        dob: '2000-02-15', gender: 'Female', bloodGroup: 'AB+',
        address: 'Chennai, Tamil Nadu', allergies: 'Aspirin', conditions: 'Asthma',
        emergencyContact: '9123456003',
        jivanId: 'JIV-556-778-22', createdAt: new Date().toISOString()
      },
      // ── DOCTORS ── IDs must match call.html exactly ──────
      {
        id: 'DOC001', role: 'doctor',
        name: 'Dr. Vikram Sethi', email: 'vikram@demo.com', phone: '9812345678',
        password: Buffer.from('doctor123').toString('base64'),
        specialization: 'Neurologist', degree: 'MBBS, MD (Neurology)',
        regNumber: 'REG-12345678', experience: 15,
        subscription: 'premium', fee: 900, rating: 4.9, reviewCount: 98,
        jivanId: 'DOC-001-VIK-SET', createdAt: new Date().toISOString()
      },
      {
        id: 'DOC002', role: 'doctor',
        name: 'Dr. Rajesh Varma', email: 'rajesh@demo.com', phone: '9812345679',
        password: Buffer.from('doctor123').toString('base64'),
        specialization: 'Cardiologist', degree: 'MBBS, DM (Cardiology)',
        regNumber: 'REG-22345678', experience: 12,
        subscription: 'pro', fee: 800, rating: 4.8, reviewCount: 145,
        jivanId: 'DOC-002-RAJ-VAR', createdAt: new Date().toISOString()
      },
      {
        id: 'DOC003', role: 'doctor',
        name: 'Dr. Anita Desai', email: 'anita@demo.com', phone: '9812345680',
        password: Buffer.from('doctor123').toString('base64'),
        specialization: 'Pediatrician', degree: 'MBBS, MD (Pediatrics)',
        regNumber: 'REG-32345678', experience: 10,
        subscription: 'free', fee: 600, rating: 4.7, reviewCount: 210,
        jivanId: 'DOC-003-ANI-DES', createdAt: new Date().toISOString()
      }
    ],
    appointments: [
      {
        id: 'APT001', patientId: 'USR001', patientName: 'Aryan Sharma',
        doctorId: 'DOC001', doctorName: 'Dr. Vikram Sethi', specialty: 'Neurologist',
        date: today(), time: '10:30 AM', type: 'Video',
        status: 'confirmed', notes: 'Follow-up for migraine', fee: 900,
        createdAt: new Date().toISOString()
      },
      {
        id: 'APT002', patientId: 'USR002', patientName: 'Priya Nair',
        doctorId: 'DOC001', doctorName: 'Dr. Vikram Sethi', specialty: 'Neurologist',
        date: today(), time: '02:00 PM', type: 'Video',
        status: 'pending', notes: 'Severe headache episodes', fee: 900,
        createdAt: new Date().toISOString()
      },
      {
        id: 'APT003', patientId: 'USR003', patientName: 'Rahul Verma',
        doctorId: 'DOC001', doctorName: 'Dr. Vikram Sethi', specialty: 'Neurologist',
        date: today(), time: '04:00 PM', type: 'Video',
        status: 'pending', notes: 'Dizziness consultation', fee: 900,
        createdAt: new Date().toISOString()
      },
      {
        id: 'APT004', patientId: 'USR001', patientName: 'Aryan Sharma',
        doctorId: 'DOC002', doctorName: 'Dr. Rajesh Varma', specialty: 'Cardiologist',
        date: today(), time: '11:00 AM', type: 'Video',
        status: 'confirmed', notes: 'Annual heart checkup', fee: 800,
        createdAt: new Date().toISOString()
      },
      {
        id: 'APT005', patientId: 'USR004', patientName: 'Sneha Pillai',
        doctorId: 'DOC001', doctorName: 'Dr. Vikram Sethi', specialty: 'Neurologist',
        date: tomorrow(), time: '09:00 AM', type: 'Video',
        status: 'pending', notes: 'First consultation', fee: 900,
        createdAt: new Date().toISOString()
      }
    ],
    records: [
      {
        id: 'REC001', patientId: 'USR001',
        title: 'CBC Blood Test', type: 'Lab Report',
        doctor: 'Dr. Anita Gupta', hospital: 'City Heart Center',
        date: '2023-10-15', status: 'normal',
        details: 'Hemoglobin: 14.2 g/dL — Normal', createdAt: new Date().toISOString()
      },
      {
        id: 'REC002', patientId: 'USR001',
        title: 'Migraine Prescription', type: 'Prescription',
        doctor: 'Dr. Vikram Sethi', hospital: 'Jivan Neurology Clinic',
        date: '2026-03-15', status: 'active',
        details: 'Sumatriptan 50mg — As needed. Topiramate 25mg — Daily.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'REC003', patientId: 'USR002',
        title: 'BP Monitoring Report', type: 'Lab Report',
        doctor: 'Dr. Rajesh Varma', hospital: 'Heart Care Clinic',
        date: '2024-01-10', status: 'attention',
        details: 'BP: 145/90 mmHg — Slightly elevated.',
        createdAt: new Date().toISOString()
      }
    ],
    donors: [
      { id: 'DNR001', name: 'Ravi Patil',     bloodGroup: 'O+',  city: 'Mumbai',    phone: '9876501234', available: true },
      { id: 'DNR002', name: 'Priya Mehta',    bloodGroup: 'A+',  city: 'Pune',      phone: '9876502345', available: true },
      { id: 'DNR003', name: 'Suresh Nair',    bloodGroup: 'B+',  city: 'Mumbai',    phone: '9876503456', available: false },
      { id: 'DNR004', name: 'Kavita Joshi',   bloodGroup: 'AB+', city: 'Delhi',     phone: '9876504567', available: true },
      { id: 'DNR005', name: 'Amit Verma',     bloodGroup: 'O-',  city: 'Bengaluru', phone: '9876505678', available: true },
      { id: 'DNR006', name: 'Sneha Pillai',   bloodGroup: 'A-',  city: 'Chennai',   phone: '9876506789', available: true },
      { id: 'DNR007', name: 'Rohan Kulkarni', bloodGroup: 'B-',  city: 'Pune',      phone: '9876507890', available: true }
    ],
    emergencies: [], sessions: {}, subscribers: []
  };
  writeDB(data);
  return data;
}

// ── Helpers ──────────────────────────────────────────────────
function makeId(prefix, list) { return prefix + String(list.length + 1).padStart(3, '0'); }
function makeJivanId(role) {
  const r = () => Math.random().toString(36).substr(2,3).toUpperCase();
  return role === 'doctor' ? `DOC-${r()}-${r()}` : `JIV-${Math.floor(100+Math.random()*900)}-${Math.floor(100+Math.random()*900)}-${Math.floor(10+Math.random()*90)}`;
}
function makeToken() { return Math.random().toString(36).substr(2) + Date.now().toString(36); }

function getSession(req) {
  // Accept token from header (normal API) OR query string (SSE cannot use headers)
  const token = req.headers['x-session-token'] || req.query.token;
  if (!token) return null;
  const db = readDB();
  return db.sessions[token] || null;
}
function sanitize(user) { const u = { ...user }; delete u.password; return u; }
function isEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

// ── AUTH ─────────────────────────────────────────────────────
app.post('/api/auth/register', rateLimit(10, 60000), (req, res) => {
  const data = req.body;
  if (!data.email || !isEmail(data.email)) return res.json({ ok: false, msg: 'Invalid email.' });
  if (!data.password || data.password.length < 8) return res.json({ ok: false, msg: 'Password must be 8+ chars.' });
  if (!data.name || data.name.length < 2) return res.json({ ok: false, msg: 'Name required.' });
  const db = readDB();
  if (db.users.find(u => u.email === data.email || u.phone === data.phone))
    return res.json({ ok: false, msg: 'Email or phone already registered.' });
  const id      = makeId(data.role === 'doctor' ? 'DOC' : 'USR', db.users.filter(u => u.role === data.role));
  const jivanId = makeJivanId(data.role);
  const newUser = { ...data, id, jivanId, subscription: data.role === 'doctor' ? 'free' : undefined,
    password: Buffer.from(data.password).toString('base64'), createdAt: new Date().toISOString() };
  delete newUser.confirmPassword;
  db.users.push(newUser);
  const token = makeToken();
  db.sessions[token] = { userId: newUser.id, role: newUser.role, name: newUser.name, jivanId: newUser.jivanId };
  writeDB(db);
  res.json({ ok: true, user: sanitize(newUser), token, session: db.sessions[token] });
});

app.post('/api/auth/login', rateLimit(20, 60000), (req, res) => {
  const { identifier, password, role } = req.body;
  if (!identifier || !password) return res.json({ ok: false, msg: 'All fields required.' });
  const db   = readDB();
  const user = db.users.find(u =>
    (u.email === identifier || u.phone === identifier) &&
    u.password === Buffer.from(password).toString('base64') &&
    u.role === role
  );
  if (!user) return res.json({ ok: false, msg: 'Invalid credentials.' });
  const token = makeToken();
  db.sessions[token] = { userId: user.id, role: user.role, name: user.name, jivanId: user.jivanId };
  writeDB(db);
  res.json({ ok: true, user: sanitize(user), token, session: db.sessions[token] });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers['x-session-token'];
  if (token) { const db = readDB(); delete db.sessions[token]; writeDB(db); }
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const session = getSession(req);
  if (!session) return res.json({ ok: false, msg: 'Not logged in' });
  const db = readDB();
  const user = db.users.find(u => u.id === session.userId);
  if (!user) return res.json({ ok: false, msg: 'User not found' });
  res.json({ ok: true, user: sanitize(user), session });
});

// ── APPOINTMENTS ─────────────────────────────────────────────
app.post('/api/appointments/book', rateLimit(30, 60000), (req, res) => {
  const session = getSession(req);
  if (!session) return res.json({ ok: false, msg: 'Not logged in' });
  const db      = readDB();
  const patient = db.users.find(u => u.id === session.userId);
  const appt    = {
    ...req.body,
    id:          makeId('APT', db.appointments),
    patientId:   session.userId,
    patientName: patient ? patient.name : session.name,
    status:      'pending',
    createdAt:   new Date().toISOString()
  };
  db.appointments.push(appt);
  writeDB(db);

  // 🔔 Push live notification to the doctor's dashboard instantly
  notifyDoctor(appt.doctorId, 'new_appointment', appt);

  res.json({ ok: true, appointment: appt });
});

// Each user (patient/doctor) sees only their own appointments
app.get('/api/appointments/mine', (req, res) => {
  const session = getSession(req);
  if (!session) return res.json({ ok: false, msg: 'Not logged in' });
  const db   = readDB();
  const list = session.role === 'doctor'
    ? db.appointments.filter(a => a.doctorId === session.userId)
    : db.appointments.filter(a => a.patientId === session.userId);
  res.json({ ok: true, appointments: list });
});

app.get('/api/appointments/all', (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== 'doctor') return res.json({ ok: false, msg: 'Unauthorized' });
  const db = readDB();
  res.json({ ok: true, appointments: db.appointments });
});

app.patch('/api/appointments/:id/status', (req, res) => {
  const session = getSession(req);
  if (!session) return res.json({ ok: false, msg: 'Not logged in' });
  const allowed = ['confirmed', 'cancelled', 'completed'];
  if (!allowed.includes(req.body.status)) return res.json({ ok: false, msg: 'Invalid status' });
  const db  = readDB();
  const idx = db.appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.json({ ok: false, msg: 'Not found' });
  if (session.role === 'doctor' && db.appointments[idx].doctorId !== session.userId)
    return res.json({ ok: false, msg: 'Unauthorized' });
  db.appointments[idx].status = req.body.status;
  writeDB(db);

  // 🔔 Notify patient of status change (future: patient SSE)
  // notifyPatient(db.appointments[idx].patientId, 'status_update', db.appointments[idx]);

  res.json({ ok: true, appointment: db.appointments[idx] });
});

// ── RECORDS ──────────────────────────────────────────────────
app.get('/api/records/mine', (req, res) => {
  const session = getSession(req);
  if (!session) return res.json({ ok: false, msg: 'Not logged in' });
  const db = readDB();
  res.json({ ok: true, records: db.records.filter(r => r.patientId === session.userId) });
});

app.post('/api/records/add', rateLimit(20, 60000), (req, res) => {
  const session = getSession(req);
  if (!session) return res.json({ ok: false, msg: 'Not logged in' });
  const db     = readDB();
  const record = { ...req.body, id: makeId('REC', db.records), patientId: session.userId, createdAt: new Date().toISOString() };
  db.records.push(record);
  writeDB(db);
  res.json({ ok: true, record });
});

app.delete('/api/records/:id', (req, res) => {
  const session = getSession(req);
  if (!session) return res.json({ ok: false, msg: 'Not logged in' });
  const db  = readDB();
  const rec = db.records.find(r => r.id === req.params.id);
  if (!rec) return res.json({ ok: false, msg: 'Not found' });
  if (rec.patientId !== session.userId) return res.json({ ok: false, msg: 'Unauthorized' });
  db.records = db.records.filter(r => r.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// ── BLOOD DONORS ─────────────────────────────────────────────
app.get('/api/donors', (req, res) => {
  const { bloodGroup, city } = req.query;
  const db = readDB();
  let list = db.donors;
  if (bloodGroup && bloodGroup !== 'all') list = list.filter(d => d.bloodGroup === bloodGroup);
  if (city && city.trim()) list = list.filter(d => d.city.toLowerCase().includes(city.toLowerCase().trim()));
  res.json({ ok: true, donors: list });
});

app.post('/api/donors/register', rateLimit(10, 60000), (req, res) => {
  const db    = readDB();
  const donor = { ...req.body, id: makeId('DNR', db.donors), available: true, createdAt: new Date().toISOString() };
  db.donors.push(donor);
  writeDB(db);
  res.json({ ok: true, donor });
});

// ── EMERGENCY ─────────────────────────────────────────────────
app.post('/api/emergency/request', rateLimit(5, 60000), (req, res) => {
  const session = getSession(req);
  const db      = readDB();
  const entry   = {
    id:        makeId('EMG', db.emergencies),
    userId:    session ? session.userId : 'guest',
    userName:  session ? session.name  : 'Guest',
    location:  req.body.location || 'Unknown',
    status:    'dispatched',
    unit:      'AMB-' + Math.floor(100 + Math.random() * 900),
    eta:       Math.floor(5 + Math.random() * 10) + ' minutes',
    createdAt: new Date().toISOString()
  };
  db.emergencies.push(entry);
  writeDB(db);
  res.json({ ok: true, request: entry });
});

app.get('/api/emergency/all', (req, res) => {
  const db = readDB();
  res.json({ ok: true, emergencies: db.emergencies });
});

// ── NEWSLETTER ────────────────────────────────────────────────
app.post('/api/subscribe', rateLimit(5, 60000), (req, res) => {
  const { email } = req.body;
  if (!email || !isEmail(email)) return res.json({ ok: false, msg: 'Valid email required' });
  const db = readDB();
  if (!db.subscribers.includes(email)) db.subscribers.push(email);
  writeDB(db);
  res.json({ ok: true });
});

// ── DOCTORS (public list, sorted by subscription) ─────────────
app.get('/api/doctors', (req, res) => {
  const db    = readDB();
  const order = { premium: 0, pro: 1, free: 2 };
  const docs  = db.users.filter(u => u.role === 'doctor').map(sanitize)
    .sort((a, b) => (order[a.subscription] ?? 2) - (order[b.subscription] ?? 2));
  res.json({ ok: true, doctors: docs });
});

app.patch('/api/doctors/subscription', (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== 'doctor') return res.json({ ok: false, msg: 'Unauthorized' });
  if (!['free','pro','premium'].includes(req.body.plan)) return res.json({ ok: false, msg: 'Invalid plan' });
  const db  = readDB();
  const idx = db.users.findIndex(u => u.id === session.userId);
  if (idx === -1) return res.json({ ok: false, msg: 'Not found' });
  db.users[idx].subscription = req.body.plan;
  writeDB(db);
  res.json({ ok: true, user: sanitize(db.users[idx]) });
});

// ── USERS ─────────────────────────────────────────────────────
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json({ ok: true, users: db.users.map(sanitize) });
});

// ── Static ────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use((req, res) => res.status(404).json({ ok: false, msg: 'Not found' }));

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n  ✅  Jivan TeleHealth Server Ready!');
  console.log(`  🌐  http://localhost:${PORT}`);
  console.log('  🔔  Live booking notifications: ENABLED (SSE)');
  console.log('\n  Demo logins:');
  console.log('  Patient → aryan@demo.com   / patient123');
  console.log('  Doctor  → vikram@demo.com  / doctor123\n');
});
