// Configuration (override these before this file runs if needed)
const API_BASE = "https://script.google.com/macros/s/AKfycbxvBjqw2zs8n8xop1V1flLaJFGLK8MfuzSQTDXPdzuByT4v0gtm6yu8ToaYrnAe7qJ7cQ/exec";

// Pathao links you provided
const PATHAO_LINK_500 = "https://pathaopay.me/@payutility/510?ref=pm8JmHuQBxOM_DDe4LQkSwYGGaiG0p9gb9RFvIpJSyI";
const PATHAO_LINK_1000 = "https://pathaopay.me/@payutility/1010?ref=P6jLYaOWKpmFKAPhjgfMBc0Gq3nzZrUt_V7-su9lZwY";
const PATHAO_AMOUNT_500 = 500;
const PATHAO_AMOUNT_1000 = 1000;

// --- Translations & language (unchanged) ---
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
    historyError: "Failed to fetch update history. Please try again."
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
    historyError: "আপডেট ইতিহাস পেতে ব্যর্থ। আবার চেষ্টা করুন।"
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

// ---- Payment steps display (bKash, Nagad, Pathao: only Pay Now block for Pathao) ----
function showSteps(option) {
  const stepsDiv = el('steps');
  if (!stepsDiv) return;

  if (option === 'bkash') {
    stepsDiv.innerHTML = `
      <h3>bKash Payment Steps</h3>
      <div class="step"><p><b>Step 1:</b> Open bKash app and log in</p></div>
      <div class="step"><p><b>Step 2:</b> Tap 'Send Money'</p></div>
      <div class="step"><p><b>Step 3:</b> Enter the number (01727389485)</p></div>
      <div class="step"><p><b>Step 4:</b> Enter amount and reference (your Customer ID)</p></div>
      <div class="step"><p><b>Step 5:</b> Confirm and enter PIN</p></div>
      <div class="step"><p class="note">After payment, paste the transaction ID into the confirmation box below and submit.</p></div>
    `;
  } else if (option === 'nagad') {
    stepsDiv.innerHTML = `
      <h3>Nagad Payment Steps</h3>
      <div class="step"><p><b>Step 1:</b> Open Nagad app and log in</p></div>
      <div class="step"><p><b>Step 2:</b> Tap 'Bill Pay' or 'Payment'</p></div>
      <div class="step"><p><b>Step 3:</b> Enter merchant ID or choose service</p></div>
      <div class="step"><p><b>Step 4:</b> Enter amount and reference (your Customer ID)</p></div>
      <div class="step"><p><b>Step 5:</b> Confirm and enter PIN</p></div>
      <div class="step"><p class="note">After payment, paste the transaction ID into the confirmation box below and submit.</p></div>
    `;
  } else if (option === 'pathao') {
    // Minimalized Pathao block — only "Pay Now" with buttons
    stepsDiv.innerHTML = `
      <h3>Pay Now</h3>
      <div class="step">
        <p style="margin-bottom:8px"><strong>Pathao Pay</strong></p>
        <button class="pay-action" onclick="goToPathaoPay(${PATHAO_AMOUNT_500})">PAY THROUGH PATHAO PAY ${PATHAO_AMOUNT_500} TK</button>
        <button class="pay-action secondary" style="margin-top:8px" onclick="goToPathaoPay(${PATHAO_AMOUNT_1000})">PAY THROUGH PATHAO PAY ${PATHAO_AMOUNT_1000} TK</button>
      </div>
      <div class="step"><p class="note">After payment, paste the transaction ID into the confirmation box below and submit.</p></div>
    `;
  } else {
    stepsDiv.innerHTML = `<p>Payment steps for ${option} not available.</p>`;
  }
}

// Redirect to Pathao link for selected amount (same tab). Append customerId if available.
function goToPathaoPay(amount) {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const msgEl = el('confirmMsg');
  if (msgEl) { msgEl.textContent = ''; msgEl.className = ''; msgEl.style.display = ''; }

  if (!id) {
    showError(msgEl, 'Please login first.');
    return;
  }

  let url;
  if (amount === PATHAO_AMOUNT_1000) url = PATHAO_LINK_1000;
  else url = PATHAO_LINK_500;

  url += (url.indexOf('?') === -1 ? '?' : '&') + 'customerId=' + encodeURIComponent(id);

  // Same-tab navigation. Use window.open(..., '_blank') if you prefer new tab.
  window.location.href = url;
}

// ---- Submit transaction (for payment page) ----
async function submitTransaction() {
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

// ... (rest of script remains unchanged) ...
// The rest of your functions (toggleEmail, logout, history modal, load handler) remain the same
// to keep file concise I did not repeat them here; keep the rest of your original script below this line.
