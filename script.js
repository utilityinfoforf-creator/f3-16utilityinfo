// Configuration (override these before this file runs if needed)
// Fixed dashboard script with API_BASE set to the provided Google Apps Script web app URL.
// Replace or redeploy the GAS if you change the web app URL.
const API_BASE = "https://script.google.com/macros/s/AKfycbxvBjqw2zs8n8xop1V1flLaJFGLK8MfuzSQTDXPdzuByT4v0gtm6yu8ToaYrnAe7qJ7cQ/exec";

// Pathao checkout base (preferably your server endpoint that creates a single-use Pathao checkout URL)
const PATHAOPAY_BASE = typeof PATHAOPAY_BASE !== 'undefined' ? PATHAOPAY_BASE : 'https://payments.example.com/pathaopay';

const translations = {
  en: {
    welcome: "Welcome, ",
    subtitle: "Your Utility Dashboard",
    warning: "⚠️ Your electric meter line will be cut if balance falls below 200.",
    electric: "Electric Balance",
    water: "Water Bill Due",
    gas: "Gas Bill Due",
    internet: "Internet Connected",
    internetBill: "Internet Bill Due",
    flat: "Flat Number",
    lastUpdated: "Last Updated",
    emailNotif: "📧 Email Notifications",
    emailToggle: "Receive balance updates by email",
    emailPlaceholder: "Enter your email address",
    payment: "💳 Make Payment",
    terms: "📋 Terms & Conditions",
    connection: "🌐 Request Internet Connection",
    history: "📋 Update History",
    logout: "🚪 Logout",
    historyTitle: "📋 Update History",
    noHistory: "No update history available yet.",
    emailError: "Please enter your email address to subscribe.",
    emailSuccess: "Email updates enabled",
    emailDisabled: "Email updates disabled",
    historyError: "Failed to fetch update history. Please try again.",
    pathaoModalTitle: "Pathao Pay — Choose Amount",
    pathaoModalSubtitle: "Select a fixed payment amount to continue:"
  },
  bn: {
    welcome: "স্বাগতম, ",
    subtitle: "আপনার ইউটিলিটি ড্যাশবোর্ড",
    warning: "⚠️ আপনার বিদ্যুৎ মিটার ব্যালেন্স ২০০ টাকার নিচে গেলে আপনার লাইন কাটা হবে।",
    electric: "বিদ্যুৎ ব্যালেন্স",
    water: "পানির বিল বকেয়া",
    gas: "গ্যাস বিল বকেয়া",
    internet: "ইন্টারনেট সংযুক্ত",
    internetBill: "ইন্টারনেট বিল বকেয়া",
    flat: "ফ্ল্যাট নম্বর",
    lastUpdated: "শেষ আপডেট",
    emailNotif: "📧 ইমেইল বিজ্ঞপ্তি",
    emailToggle: "ইমেইলের মাধ্যমে ব্যালেন্স আপডেট পান",
    emailPlaceholder: "আপনার ইমেইল ঠিকানা প্রবেশ করুন",
    payment: "💳 পেমেন্ট করুন",
    terms: "📋 শর্তাবলী",
    connection: "🌐 ইন্টারনেট সংযোগ অনুরোধ করুন",
    history: "📋 আপডেট ইতিহাস",
    logout: "🚪 লগ আউট",
    historyTitle: "📋 আপডেট ইতিহাস",
    noHistory: "এখনও কোনও আপডেট ইতিহাস উপলব্ধ নেই।",
    emailError: "আপনার ইমেইল ঠিকানা প্রবেশ করুন।",
    emailSuccess: "ইমেইল আপডেট সক্ষম",
    emailDisabled: "ইমেইল আপডেট অক্ষম",
    historyError: "আপডেট ইতিহাস পেতে ব্যর্থ। আবার চেষ্টা করুন।",
    pathaoModalTitle: "Pathao Pay — পরিমাণ নির্বাচন করুন",
    pathaoModalSubtitle: "চালিয়ে যেতে একটি নির্দিষ্ট পরিমাণ নির্বাচন করুন:"
  }
};

let currentLanguage = "en";

function switchLanguage(lang, event) {
  currentLanguage = lang;
  document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.remove("active"));
  if (event && event.target) event.target.classList.add("active");
  updatePageLanguage();
  localStorage.setItem("preferredLanguage", lang);
}

function updatePageLanguage() {
  const t = translations[currentLanguage] || translations.en;
  const setText = (id, text, prop = "innerText") => {
    const el = document.getElementById(id);
    if (el) el[prop] = text || "";
  };

  setText("dashboardSubtitle", t.subtitle);
  setText("warningBox", t.warning);
  setText("label-electric", t.electric);
  setText("label-water", t.water);
  setText("label-gas", t.gas);
  setText("label-internet", t.internet);
  setText("label-internet-bill", t.internetBill);
  setText("label-flat", t.flat);
  setText("label-updated", t.lastUpdated);

  setText("label-email", t.emailNotif);
  setText("label-email-toggle", t.emailToggle);
  setText("emailAddress", t.emailPlaceholder, "placeholder");

  setText("btn-payment", t.payment);
  setText("btn-terms", t.terms);
  setText("btn-internet", t.connection);
  setText("btn-history", t.history);
  setText("btn-logout", t.logout);

  setText("modal-history-title", t.historyTitle);

  // Pathao modal translations (if modal exists on page)
  setText("pathaoModalTitle", t.pathaoModalTitle);
  setText("pathaoModalSubtitle", t.pathaoModalSubtitle);
}

function setToggleMessage(text, type) {
  const el = document.getElementById("toggleMsg");
  if (!el) return;
  el.className = type === "error" ? "error" : type === "success" ? "success" : "";
  el.innerText = text || "";
}

// ----- Helpers for DOM/UI -----
function el(id) { return document.getElementById(id); }
function showError(targetEl, msg) {
  if (!targetEl) return;
  targetEl.style.display = '';
  targetEl.className = 'error';
  targetEl.textContent = msg;
}
function showSuccess(targetEl, msg) {
  if (!targetEl) return;
  targetEl.style.display = '';
  targetEl.className = 'success';
  targetEl.textContent = msg;
}

// ---- Login ----
async function login() {
  const idEl = document.getElementById("customerId");
  if (!idEl) return;
  const id = idEl.value.trim();

  setToggleMessage("", "");
  const emailInput = document.getElementById("emailAddress");
  if (emailInput) emailInput.classList.remove("input-error");

  if (!id) {
    const errorEl = document.getElementById("error");
    if (errorEl) {
      errorEl.innerText = "Enter Customer ID";
      errorEl.style.display = "block";
    }
    return;
  }

  try {
    // Using GET because GAS web app commonly expects query params; adjust to your backend.
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();

    if (data.error) {
      const errorEl = document.getElementById("error");
      if (errorEl) {
        errorEl.innerText = data.error;
        errorEl.style.display = "block";
      }
      return;
    }

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.innerText = value || "";
    };

    setText("name", data.name || "");
    setText("electricBalance", data.electricBalance || "");
    setText("waterBillDue", data.waterBillDue || "");
    setText("gasBillDue", data.gasBillDue || "");
    setText("internetConnected", data.internetConnected || "");
    setText("internetBillDue", data.internetBillDue || "");
    setText("flatNumber", data.flatNumber || "");
    setText("lastUpdated", data.lastUpdated || "");

    const emailToggleEl = document.getElementById("emailToggle");
    if (emailToggleEl) emailToggleEl.checked = (String(data.subscribed) === "true");
    if (emailInput) emailInput.value = data.email || "";

    // Persist minimal identity locally for UX (not a secure auth)
    localStorage.setItem("customerId", id);
    localStorage.setItem("customerName", data.name || "");
    localStorage.setItem("customerEmail", data.email || "");

    const errorEl = document.getElementById("error");
    if (errorEl) {
      errorEl.innerText = "";
      errorEl.style.display = "none";
    }
    const loginEl = document.getElementById("login");
    if (loginEl) loginEl.style.display = "none";
    const dashEl = document.getElementById("dashboard");
    if (dashEl) dashEl.style.display = "block";

    updatePageLanguage();
  } catch (err) {
    const errorEl = document.getElementById("error");
    if (errorEl) {
      errorEl.innerText = "Network error";
      errorEl.style.display = "block";
    }
  }
}

// ---- Submit transaction (for payment page) ----
async function submitTransaction() {
  // Uses POST to avoid putting transaction data in URL; GAS may need configuration to accept POST JSON.
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const txnEl = el('transactionNumber');
  const msgEl = el('confirmMsg');
  const btn = el('btn-submit-payment');

  if (msgEl) { msgEl.textContent = ''; msgEl.className = ''; msgEl.style.display = ''; }

  if (!id) {
    showError(msgEl, 'Please login first.');
    return;
  }
  const txn = txnEl ? txnEl.value.trim() : '';
  if (!txn) {
    showError(msgEl, 'Please enter Transaction Number.');
    return;
  }
  if (!/^[A-Za-z0-9\-]{3,60}$/.test(txn)) {
    showError(msgEl, 'Invalid transaction number format.');
    return;
  }

  if (btn) { btn.disabled = true; btn.dataset.origText = btn.innerText; btn.innerText = 'Submitting...'; }

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submitTransaction', customerId: id, transaction: txn })
    });

    if (!res.ok) {
      let errMsg = `Request failed (${res.status})`;
      try {
        const body = await res.json();
        errMsg = body.error || body.message || errMsg;
      } catch (e) {}
      showError(msgEl, errMsg);
      return;
    }

    let data;
    try { data = await res.json(); } catch (e) { data = null; }
    if (data) {
      if (data.status && /success/i.test(data.status)) {
        showSuccess(msgEl, data.status);
        if (txnEl) txnEl.value = '';
      } else if (data.error) {
        showError(msgEl, data.error);
      } else {
        showSuccess(msgEl, data.message || JSON.stringify(data));
      }
    } else {
      const txt = await res.text();
      if (/success/i.test(txt)) showSuccess(msgEl, txt);
      else showError(msgEl, txt);
    }
  } catch (err) {
    console.error('submitTransaction error', err);
    showError(msgEl, 'Network error. Please try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = btn.dataset.origText || 'Submit Payment Confirmation'; }
  }
}

// ---- Email subscription toggle ----
async function toggleEmail() {
  const id = (document.getElementById("customerId") || {}).value || "";
  const emailToggleEl = document.getElementById("emailToggle");
  const enabled = emailToggleEl ? emailToggleEl.checked : false;
  const emailInput = document.getElementById("emailAddress");
  const email = emailInput ? emailInput.value.trim() : "";
  const t = translations[currentLanguage] || translations.en;

  setToggleMessage("", "");
  if (emailInput) emailInput.classList.remove("input-error");

  if (enabled && !email) {
    if (emailInput) emailInput.classList.add("input-error");
    setToggleMessage(t.emailError, "error");
    if (emailToggleEl) emailToggleEl.checked = false;
    return;
  }

  try {
    // Using GET to GAS; if your GAS expects POST adjust accordingly.
    const url = `${API_BASE}?id=${encodeURIComponent(id)}&subscribe=${enabled}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();

    if (data.status) {
      setToggleMessage(enabled ? t.emailSuccess : t.emailDisabled, "success");
      const confirmRes = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`);
      const confirmData = await confirmRes.json();
      const emailToggleEl2 = document.getElementById("emailToggle");
      if (emailToggleEl2) emailToggleEl2.checked = (String(confirmData.subscribed) === "true");
      if (emailInput) emailInput.value = confirmData.email || email;
    } else {
      setToggleMessage("Could not save changes.", "error");
    }
  } catch (err) {
    setToggleMessage("Network error while saving subscription.", "error");
  }
}

// ---- Logout / Navigation ----
function logout() {
  const dashboard = document.getElementById("dashboard");
  if (dashboard) dashboard.style.display = "none";
  const loginEl = document.getElementById("login");
  if (loginEl) loginEl.style.display = "flex";
  const errorEl = document.getElementById("error");
  if (errorEl) {
    errorEl.innerText = "";
    errorEl.style.display = "none";
  }
  const idEl = document.getElementById("customerId");
  if (idEl) idEl.value = "";
  const emailToggleEl = document.getElementById("emailToggle");
  if (emailToggleEl) emailToggleEl.checked = false;
  const emailInput = document.getElementById("emailAddress");
  if (emailInput) emailInput.value = "";
  setToggleMessage("", "");
  if (emailInput) emailInput.classList.remove("input-error");

  // Clear stored identity (optional)
  localStorage.removeItem("customerId");
  localStorage.removeItem("customerName");
  localStorage.removeItem("customerEmail");
  sessionStorage.removeItem("customerId");
}

function goToPayment() { window.location.href = "payment.html"; }
function goToTerms() { window.location.href = "terms.html"; }
function backToDashboard() {
  const dash = document.getElementById("dashboard");
  if (dash) dash.style.display = "block";
}

// ---- Update history modal ----
async function viewUpdateHistory() {
  const id = (document.getElementById("customerId") || {}).value.trim();
  const t = translations[currentLanguage] || translations.en;

  try {
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&history=true`);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();

    const historyContainer = document.getElementById("historyContainer");
    if (!historyContainer) return;

    if (data.history && data.history.length > 0) {
      historyContainer.innerHTML = data.history.map(item => `
        <div class="history-item">
          <div class="history-date">📅 ${item.date || 'N/A'}</div>
          <div class="history-balance">💰 Balance: <strong>${item.balance || 'N/A'}</strong></div>
          <div class="history-description">${item.description || 'Update'}</div>
        </div>
      `).join('');
    } else {
      historyContainer.innerHTML = `<p style="text-align: center; color: #666;">${t.noHistory}</p>`;
    }

    const modal = document.getElementById("historyModal");
    if (modal) modal.style.display = "flex";
  } catch (err) {
    alert(t.historyError);
  }
}

function closeUpdateHistory() {
  const modal = document.getElementById("historyModal");
  if (modal) modal.style.display = "none";
}

window.addEventListener("click", function(event) {
  const modal = document.getElementById("historyModal");
  if (modal && event.target === modal) modal.style.display = "none";
});

// ---- Pathao Pay modal & helpers (REPLACED): creates modal on demand and ensures visibility ----
function ensurePathaoModalExists() {
  if (document.getElementById('pathaoModal')) return;

  // Minimal styles for overlay/modal; added only once
  if (!document.getElementById('pathaoModalStyles')) {
    var style = document.createElement('style');
    style.id = 'pathaoModalStyles';
    style.textContent = `
      #pathaoModal { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); z-index: 2147483647; }
      #pathaoModal .pathao-modal { background: #fff; padding: 1rem; border-radius: 8px; width: 360px; max-width: 94%; box-shadow: 0 8px 24px rgba(0,0,0,0.2); border: 2px solid #000; }
      #pathaoModal .pathao-modal h3 { margin: 0 0 .5rem 0; }
      #pathaoModal .pathao-amounts { display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.5rem; }
      #pathaoModal .pathao-amounts button { flex:1 1 48%; padding:.6rem; cursor:pointer; background:#000; color:#fff; border:2px solid #000; border-radius:6px; font-weight:700; }
      #pathaoModal .pathao-close { position: absolute; right: 12px; top: 12px; border: none; background: transparent; font-size: 1.2rem; cursor:pointer; }
      @media (max-width:480px) {
        #pathaoModal .pathao-modal { width: 92%; padding: .75rem; }
        #pathaoModal .pathao-amounts button { flex-basis: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  var overlay = document.createElement('div');
  overlay.id = 'pathaoModal';
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML = `
    <div class="pathao-modal" role="dialog" aria-modal="true" aria-labelledby="pathaoModalTitle">
      <button class="pathao-close" type="button" aria-label="Close">✕</button>
      <h3 id="pathaoModalTitle">${translations[currentLanguage].pathaoModalTitle}</h3>
      <p id="pathaoModalSubtitle">${translations[currentLanguage].pathaoModalSubtitle}</p>
      <div class="pathao-amounts" id="pathaoAmounts">
        <button type="button" data-amount="500">500 ৳</button>
        <button type="button" data-amount="1000">1000 ৳</button>
        <button type="button" data-amount="1500">1500 ৳</button>
        <button type="button" data-amount="2000">2000 ৳</button>
      </div>
      <div style="margin-top:.75rem; text-align:right;">
        <button type="button" id="pathaoCancelBtn" style="padding:.5rem .75rem;border-radius:6px;border:2px solid #000;background:#f0f0f0;cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Attach handlers
  overlay.querySelector('.pathao-close').addEventListener('click', closePathaoModal);
  overlay.querySelector('#pathaoCancelBtn').addEventListener('click', closePathaoModal);
  Array.from(overlay.querySelectorAll('#pathaoAmounts button')).forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var amount = e.currentTarget.getAttribute('data-amount');
      openPathaoPayment(amount);
    });
  });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closePathaoModal();
  });
}

function showPathaoModal() {
  console.log('showPathaoModal called');
  ensurePathaoModalExists();
  var modal = document.getElementById('pathaoModal');
  if (!modal) return console.error('Failed to create pathaoModal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  var first = modal.querySelector('#pathaoAmounts button');
  if (first) first.focus();
}

function closePathaoModal() {
  var modal = document.getElementById('pathaoModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

function openPathaoPayment(amount) {
  console.log('openPathaoPayment', amount);
  var parsed = Number(amount);
  if (isNaN(parsed) || parsed <= 0) {
    var err = document.getElementById('confirmMsg') || document.getElementById('error');
    if (err) { err.className = 'error'; err.textContent = 'Invalid amount selected.'; }
    return;
  }

  var id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  var errorEl = document.getElementById('error') || document.getElementById('confirmMsg');

  if (!id) {
    if (errorEl) { errorEl.className = 'error'; errorEl.textContent = 'Please login before proceeding to Pathao Pay.'; }
    closePathaoModal();
    if (el('login')) el('login').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // Preferred: request server to create checkout session. Quick fallback:
  var params = new URLSearchParams({ amount: parsed, customerId: id });
  var checkoutUrl = PATHAOPAY_BASE + '/checkout?'+params.toString();

  var width = 640, height = 800;
  var left = (screen.width/2)-(width/2);
  var top = (screen.height/2)-(height/2);
  var popup = window.open(checkoutUrl, 'pathao_pay_window', 'width='+width+',height='+height+',left='+left+',top='+top+',resizable=yes,scrollbars=yes');

  if (!popup) {
    // popup blocked -> redirect
    window.location.href = checkoutUrl;
  } else {
    var t = setInterval(function() {
      if (popup.closed) {
        clearInterval(t);
        var msg = el('confirmMsg');
        if (msg) {
          msg.className = 'success';
          msg.textContent = 'Payment window closed. If your payment completed, submit the transaction number here.';
        }
      }
    }, 1000);
  }

  closePathaoModal();
}

// ---- showSteps hook for pages that display payment steps ----
function showSteps(option) {
  const stepsDiv = el('steps');
  if (!stepsDiv) return;

  if (option === 'pathaopay') {
    showPathaoModal();
    return;
  }

  if (option === 'bkash') {
    stepsDiv.innerHTML = `
      <h3>bKash Payment Steps</h3>
      <div class="step"><p><b>Step 1:</b> Open bKash app and log in</p></div>
      <div class="step"><p><b>Step 2:</b> Tap 'Send Money'</p></div>
      <div class="step"><p><b>Step 3:</b> Enter the number (01727389485)</p></div>
      <div class="step"><p><b>Step 4:</b> Enter amount and reference (your Customer ID)</p></div>
      <div class="step"><p><b>Step 5:</b> Confirm and enter PIN</p></div>
    `;
  } else if (option === 'nagad') {
    stepsDiv.innerHTML = `
      <h3>Nagad Payment Steps</h3>
      <div class="step"><p><b>Step 1:</b> Open Nagad app and log in</p></div>
      <div class="step"><p><b>Step 2:</b> Tap 'Bill Pay' or 'Payment'</p></div>
      <div class="step"><p><b>Step 3:</b> Enter merchant ID or choose service</p></div>
      <div class="step"><p><b>Step 4:</b> Enter amount and reference (your Customer ID)</p></div>
      <div class="step"><p><b>Step 5:</b> Confirm and enter PIN</p></div>
    `;
  } else {
    stepsDiv.innerHTML = `<p>Payment steps for ${option} not available.</p>`;
  }
}

// ---- Keyboard handlers / misc ----
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = el('pathaoModal');
    if (modal && modal.style.display !== 'none') closePathaoModal();
  }
});

window.addEventListener("load", function() {
  const savedLang = localStorage.getItem("preferredLanguage");
  if (savedLang) {
    currentLanguage = savedLang;
    document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.remove("active"));
    const langBtns = document.querySelectorAll(".lang-btn");
    if (langBtns.length > 0) langBtns[savedLang === "bn" ? 1 : 0].classList.add("active");
  }
  updatePageLanguage();

  const savedId = localStorage.getItem("customerId");
  if (savedId && document.getElementById("customerId")) {
    document.getElementById("customerId").value = savedId;
    // call login to hydrate dashboard
    login();
  }
});