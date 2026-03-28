/**
 * ============================================================
 *  JIVAN TELEHEALTH — Shared Chatbot + Voice Assistant
 *  Include ONCE per page. Works on all pages.
 * ============================================================
 */

(function () {
  /* ── Context per page ─────────────────────────────────── */
  const PAGE = (function () {
    const p = location.pathname.split('/').pop() || 'index.html';
    if (p.includes('call'))   return 'call';
    if (p.includes('health')) return 'health';
    if (p.includes('emg'))    return 'emg';
    if (p.includes('blood'))  return 'blood';
    if (p.includes('awer'))   return 'awer';
    if (p.includes('id'))     return 'id';
    if (p.includes('admin'))  return 'admin';
    return 'home';
  })();

  /* ── Smart replies per page context ──────────────────── */
  const REPLIES = {
    greet: [
      'Hello! 👋 I\'m <strong>Jivan AI</strong>. Type or tap 🎤 to speak.',
      'Hi there! I can help with appointments, records, insurance & more.'
    ],
    appointment: [
      'To book a consultation, visit <a href="call.html" class="jc-link">Find Doctors →</a>. Pick a specialist, choose a time slot and confirm!',
      'Our doctors are available 24/7. <a href="call.html" class="jc-link">Browse specialists →</a>'
    ],
    emergency: [
      '🚨 <strong>Emergency?</strong> Call <a href="tel:108" class="jc-link-red">108</a> immediately or use <a href="emg.html" class="jc-link-red">Emergency page →</a>',
    ],
    records: [
      'Your health records, prescriptions and lab reports are on <a href="health.html" class="jc-link">Health Records →</a>. Login first.',
    ],
    insurance: [
      'We offer life insurance from ₹499/month! Scroll to the Insurance section on <a href="index.html#insurance" class="jc-link">Home →</a>',
    ],
    blood: [
      'Find blood donors by group and city on <a href="blood.html" class="jc-link-red">Blood Donor Finder →</a>',
    ],
    login: [
      'Login at <a href="login.html" class="jc-link">Login →</a>. Demo: aryan@demo.com / patient123',
    ],
    logout: [
      'To logout, click the user icon (top-right) and select Logout.',
    ],
    doctor: [
      'Dr. Vikram Sethi (Neurologist), Dr. Rajesh Varma (Cardiologist) and Dr. Anita Desai (Pediatrician) are available now. <a href="call.html" class="jc-link">Book →</a>',
    ],
    news: [
      'Check our Health News section on the <a href="index.html#news" class="jc-link">Home page →</a> for latest medical updates.',
    ],
    default: [
      'I can help with <strong>appointments</strong>, <strong>emergency</strong>, <strong>health records</strong>, <strong>insurance</strong> or <strong>blood donors</strong>. What do you need?',
      'Try asking: "book a doctor", "emergency", "my records", "insurance plans" or "blood donor".',
    ]
  };

  // Page-specific extras
  const PAGE_HINT = {
    call:   'I see you\'re on the <strong>Book Consultation</strong> page. Select a doctor from the list and choose a time slot to book!',
    health: 'You\'re on your <strong>Health Records</strong> page. You can view prescriptions, lab reports, and book new appointments here.',
    emg:    '🚨 You\'re on the <strong>Emergency</strong> page. In a real emergency, always call <a href="tel:108" class="jc-link-red">108</a> first.',
    blood:  'You\'re on the <strong>Blood Donor Finder</strong>. Search by blood group and city, or register yourself as a donor!',
    awer:   'You\'re on the <strong>Health Awareness</strong> page. Browse articles on govt. schemes, hygiene, diet and mental health.',
    home:   'Welcome to <strong>Jivan TeleHealth</strong>! I can help you navigate to any feature.',
  };

  function getReply(msg) {
    const m = msg.toLowerCase().trim();
    if (!m) return null;
    if (/^(hi|hello|hey|namaste|helo|hai|yo)\b/.test(m)) return pick(REPLIES.greet);
    if (/appoint|book|consult|see a doc|specialist|slot/.test(m)) return pick(REPLIES.appointment);
    if (/emerg|ambulance|108|sos|urgent|accident|critical/.test(m)) return pick(REPLIES.emergency);
    if (/record|prescription|report|lab|history|health file/.test(m)) return pick(REPLIES.records);
    if (/insur|policy|cover|protect|life plan/.test(m)) return pick(REPLIES.insurance);
    if (/blood|donor|donate/.test(m)) return pick(REPLIES.blood);
    if (/login|sign in|signin|account/.test(m)) return pick(REPLIES.login);
    if (/logout|sign out|signout/.test(m)) return pick(REPLIES.logout);
    if (/doctor|dr\.|vikram|rajesh|anita|specialist/.test(m)) return pick(REPLIES.doctor);
    if (/news|update|latest|article/.test(m)) return pick(REPLIES.news);
    if (/this page|where am i|what can i do|help/.test(m)) return PAGE_HINT[PAGE] || pick(REPLIES.default);
    return pick(REPLIES.default);
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ── State ────────────────────────────────────────────── */
  let open = false, greeted = false, listening = false;
  let recognition = null, voiceTimer = null;

  /* ── Build HTML ───────────────────────────────────────── */
  function inject() {
    // Styles
    const style = document.createElement('style');
    style.textContent = `
      #jc-wrap{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9980;display:flex;flex-direction:column;align-items:flex-end;gap:0.75rem;}
      #jc-box{width:22rem;max-height:30rem;background:white;border-radius:1.5rem;box-shadow:0 20px 60px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;border:1px solid #e2e8f0;}
      .dark #jc-box{background:#1e293b;border-color:#334155;}
      #jc-header{background:linear-gradient(135deg,#0ea5e9,#0891b2);padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;}
      #jc-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.65rem;scroll-behavior:smooth;}
      .jc-bot{display:flex;gap:0.5rem;align-items:flex-start;}
      .jc-bot-bubble{background:#f1f5f9;color:#1e293b;border-radius:0 1rem 1rem 1rem;padding:0.65rem 0.9rem;font-size:0.8rem;max-width:85%;line-height:1.5;}
      .dark .jc-bot-bubble{background:#334155;color:#f1f5f9;}
      .jc-user{display:flex;justify-content:flex-end;}
      .jc-user-bubble{background:#0ea5e9;color:white;border-radius:1rem 0 1rem 1rem;padding:0.65rem 0.9rem;font-size:0.8rem;max-width:85%;line-height:1.5;}
      .jc-avatar{width:1.75rem;height:1.75rem;background:#0ea5e9;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:0.65rem;font-weight:700;flex-shrink:0;margin-top:0.1rem;}
      .jc-link{color:#0ea5e9;font-weight:700;text-decoration:underline;}
      .jc-link-red{color:#ef4444;font-weight:700;text-decoration:underline;}
      #jc-quick{padding:0.5rem 0.75rem;display:flex;gap:0.4rem;flex-wrap:wrap;border-top:1px solid #e2e8f0;}
      .dark #jc-quick{border-color:#334155;}
      .jc-qbtn{font-size:0.7rem;padding:0.3rem 0.7rem;border-radius:9999px;border:1.5px solid #0ea5e9;color:#0ea5e9;background:transparent;cursor:pointer;font-weight:600;white-space:nowrap;transition:all .15s;}
      .jc-qbtn:hover{background:#0ea5e9;color:white;}
      #jc-input-row{padding:0.75rem;border-top:1px solid #e2e8f0;display:flex;gap:0.4rem;}
      .dark #jc-input-row{border-color:#334155;}
      #jc-input{flex:1;padding:0.55rem 0.85rem;border:1.5px solid #cbd5e1;border-radius:0.75rem;font-size:0.8rem;outline:none;font-family:inherit;background:white;color:#1e293b;}
      .dark #jc-input{background:#0f172a;border-color:#475569;color:#f1f5f9;}
      #jc-input:focus{border-color:#0ea5e9;}
      #jc-mic{width:2.2rem;height:2.2rem;border-radius:0.65rem;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#f1f5f9;color:#64748b;transition:all .15s;flex-shrink:0;}
      .dark #jc-mic{background:#334155;color:#94a3b8;}
      #jc-mic.active{background:#fee2e2;color:#ef4444;}
      #jc-send{width:2.2rem;height:2.2rem;border-radius:0.65rem;border:none;background:#0ea5e9;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;}
      #jc-send:hover{background:#0284c7;}
      #jc-fab{width:3.5rem;height:3.5rem;border-radius:50%;background:#0ea5e9;border:none;cursor:pointer;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(14,165,233,.4);transition:transform .15s;}
      #jc-fab:hover{transform:scale(1.08);}
      #jc-dot{position:absolute;top:-2px;right:-2px;width:12px;height:12px;background:#22c55e;border-radius:50%;border:2px solid white;}
      @keyframes jc-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      .jc-typing span{display:inline-block;width:5px;height:5px;background:#94a3b8;border-radius:50%;animation:jc-bounce .8s infinite;}
      .jc-typing span:nth-child(2){animation-delay:.15s;}
      .jc-typing span:nth-child(3){animation-delay:.3s;}
    `;
    document.head.appendChild(style);

    // Widget HTML
    const wrap = document.createElement('div');
    wrap.id = 'jc-wrap';
    wrap.innerHTML = `
      <div id="jc-box">
        <div id="jc-header">
          <div style="display:flex;align-items:center;gap:.75rem;">
            <div style="width:2.2rem;height:2.2rem;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;">
              <span class="material-symbols-outlined" style="color:white;font-size:1.25rem;">smart_toy</span>
            </div>
            <div>
              <p style="color:white;font-weight:700;font-size:.875rem;line-height:1.2;">Jivan AI</p>
              <p style="color:rgba(255,255,255,.75);font-size:.7rem;display:flex;align-items:center;gap:.3rem;">
                <span style="width:6px;height:6px;background:#4ade80;border-radius:50%;display:inline-block;"></span>
                Online · Voice enabled
              </p>
            </div>
          </div>
          <button onclick="JivanChat.close()" style="background:rgba(255,255,255,.2);border:none;border-radius:.5rem;padding:.35rem .6rem;color:white;cursor:pointer;font-size:1rem;line-height:1;">✕</button>
        </div>
        <div id="jc-msgs"></div>
        <div id="jc-quick">
          <button class="jc-qbtn" onclick="JivanChat.send('Book a doctor')">📅 Book</button>
          <button class="jc-qbtn" onclick="JivanChat.send('Emergency help')">🚨 Emergency</button>
          <button class="jc-qbtn" onclick="JivanChat.send('My records')">📋 Records</button>
          <button class="jc-qbtn" onclick="JivanChat.send('Insurance plans')">🛡️ Insurance</button>
        </div>
        <div id="jc-input-row">
          <input id="jc-input" type="text" placeholder="Type or speak…" autocomplete="off"
            onkeydown="if(event.key==='Enter')JivanChat.send()"/>
          <button id="jc-mic" onclick="JivanChat.toggleVoice()" title="Voice input">
            <span class="material-symbols-outlined" style="font-size:1.1rem;" id="jc-mic-icon">mic</span>
          </button>
          <button id="jc-send" onclick="JivanChat.send()">
            <span class="material-symbols-outlined" style="font-size:1.1rem;">send</span>
          </button>
        </div>
      </div>
      <button id="jc-fab" onclick="JivanChat.toggle()" aria-label="Chat with Jivan AI" style="position:relative;">
        <span class="material-symbols-outlined" style="font-size:1.5rem;">smart_toy</span>
        <span id="jc-dot"></span>
      </button>
    `;
    document.body.appendChild(wrap);
  }

  /* ── Message helpers ─────────────────────────────────── */
  function botMsg(html) {
    const msgs = document.getElementById('jc-msgs');
    const d = document.createElement('div');
    d.className = 'jc-bot';
    d.innerHTML = `<div class="jc-avatar">AI</div><div class="jc-bot-bubble">${html}</div>`;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function userMsg(text) {
    const msgs = document.getElementById('jc-msgs');
    const d = document.createElement('div');
    d.className = 'jc-user';
    d.innerHTML = `<div class="jc-user-bubble">${text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function typingIndicator() {
    const msgs = document.getElementById('jc-msgs');
    const d = document.createElement('div');
    d.className = 'jc-bot'; d.id = 'jc-typing';
    d.innerHTML = `<div class="jc-avatar" style="background:#94a3b8;">AI</div>
      <div class="jc-bot-bubble jc-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  /* ── Voice ───────────────────────────────────────────── */
  function setMicState(on) {
    listening = on;
    const btn  = document.getElementById('jc-mic');
    const icon = document.getElementById('jc-mic-icon');
    if (!btn) return;
    if (on) { btn.classList.add('active'); icon.textContent = 'mic_off'; btn.title = 'Tap to stop'; }
    else    { btn.classList.remove('active'); icon.textContent = 'mic'; btn.title = 'Voice input'; }
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input requires Chrome or Edge browser.'); return; }

    // Open chat if closed
    if (!open) JivanChat.open();

    recognition = new SR();
    recognition.lang          = 'en-US';   // broadest browser support
    recognition.interimResults = true;
    recognition.continuous     = false;
    recognition.maxAlternatives = 1;

    let final = '';

    recognition.onstart = () => setMicState(true);

    recognition.onresult = (e) => {
      let interim = '';
      final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      const inp = document.getElementById('jc-input');
      if (inp) inp.value = final || interim;
    };

    recognition.onend = () => {
      setMicState(false);
      if (voiceTimer) { clearTimeout(voiceTimer); voiceTimer = null; }
      if (final.trim()) {
        const inp = document.getElementById('jc-input');
        if (inp) inp.value = final.trim();
        JivanChat.send(final.trim());
      }
    };

    recognition.onerror = (e) => {
      setMicState(false);
      if (voiceTimer) { clearTimeout(voiceTimer); voiceTimer = null; }
      const msgs = { 'no-speech':'No speech detected.', 'not-allowed':'Mic access denied — allow it in browser settings.', 'audio-capture':'No microphone found.' };
      const m = msgs[e.error];
      if (m) { const inp = document.getElementById('jc-input'); if (inp) inp.placeholder = m; setTimeout(() => { const i = document.getElementById('jc-input'); if (i) i.placeholder = 'Type or speak…'; }, 3000); }
    };

    voiceTimer = setTimeout(() => { try { recognition.stop(); } catch(e){} }, 9000);
    try { recognition.start(); } catch(e) { setMicState(false); }
  }

  function stopVoice() {
    if (recognition) { try { recognition.stop(); } catch(e){} recognition = null; }
    setMicState(false);
    if (voiceTimer) { clearTimeout(voiceTimer); voiceTimer = null; }
  }

  /* ── Public API ──────────────────────────────────────── */
  window.JivanChat = {
    open() {
      open = true;
      const box = document.getElementById('jc-box');
      box.style.display = 'flex';
      if (!greeted) {
        greeted = true;
        setTimeout(() => { botMsg(pick(REPLIES.greet)); }, 180);
        if (PAGE_HINT[PAGE]) setTimeout(() => { botMsg(PAGE_HINT[PAGE]); }, 900);
      }
      setTimeout(() => { const i = document.getElementById('jc-input'); if(i) i.focus(); }, 300);
    },
    close() {
      open = false;
      document.getElementById('jc-box').style.display = 'none';
      stopVoice();
    },
    toggle() { open ? this.close() : this.open(); },

    send(override) {
      const inp = document.getElementById('jc-input');
      const msg = (override !== undefined ? override : (inp ? inp.value : '')).trim();
      if (!msg) return;
      if (inp) inp.value = '';
      if (!open) this.open();
      userMsg(msg);
      const typing = typingIndicator();
      setTimeout(() => {
        typing.remove();
        const reply = getReply(msg);
        botMsg(reply || pick(REPLIES.default));
      }, 650);
    },

    toggleVoice() {
      if (listening) stopVoice();
      else startVoice();
    }
  };

  // Mount after DOM is ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();

})(); // end IIFE
