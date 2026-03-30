// ===== THEME TOGGLE (Light/Dark Mode) =====
function toggleTheme() {
  const html = document.documentElement;
  const isDarkMode = html.classList.contains('dark-mode');

  if (isDarkMode) {
    html.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    updateThemeIcon();
  } else {
    html.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    updateThemeIcon();
  }
}

function updateThemeIcon() {
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    btn.textContent = isDarkMode ? '☀️' : '🌙';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme === 'dark' || (savedTheme === 'auto' && prefersDark) ? 'dark' : 'light';

  if (theme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
  updateThemeIcon();
}

// Initialize theme on page load
initTheme();

// Configuration (override these before this file runs if needed)
const API_BASE = "https://script.google.com/macros/s/AKfycbxWo9aXgi_xv0bKI9r8kbLX7Wc7ouvYmdkSTGdqt5mN2_OHTFcW0usECrhLShGSDX84QQ/exec";

// Client-side API key (must match server Script Properties 'API_KEY').
// IMPORTANT: For production, keep this value secret. If frontend is public, consider a different auth flow.
// Replace 'REPLACE_WITH_YOUR_KEY' with your actual key, or leave blank in development.
const API_KEY = "REPLACE_WITH_YOUR_KEY";

// Pathao links you provided
const PATHAO_LINK_500 = "https://pathaopay.me/@payutility/510?ref=pm8JmHuQBxOM_DDe4LQkSwYGGaiG0p9gb9RFvIpJSyI";
const PATHAO_LINK_1000 = "https://pathaopay.me/@payutility/1010?ref=P6jLYaOWKpmFKAPhjgfMBc0Gq3nzZrUt_V7-su9lZwY";
const PATHAO_AMOUNT_500 = 500;
const PATHAO_AMOUNT_1000 = 1000;

// Fallback behavior: try 'application/json' first; if network/CORS error occurs,
// automatically retry once using 'text/plain' to avoid preflight (some Apps Script setups accept this).
const ENABLE_TEXT_PLAIN_FALLBACK = true;

// --- Translations & language ---
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
    notifications: "🔔 Notifications & Alerts",
    lowBalanceAlert: "Low Balance Warning",
    lowBalanceDesc: "Your balance is below 200 tk",
    outageAlert: "Service Status",
    outageDesc: "All services running normally",
    paymentConfirm: "Payment Confirmation",
    paymentConfirmDesc: "Last payment received successfully",
    reporting: "📊 Reporting & Analytics",
    exportReport: "📑 Export Usage Report",
    printBills: "🖨️ Print Bills",
    comparative: "📊 Monthly Comparison",
    comparativeTitle: "📊 Monthly Comparison Analysis",
    noComparativeData: "No comparative data available yet.",
    analytics: "📊 Data & Analytics",
    billingHistory: "📊 Billing History",
    billingHistoryDesc: "View 12-month billing trends",
    usageTrends: "📈 Usage Trends",
    usageTrendsDesc: "Analyze consumption patterns",
    downloadPDF: "💾 Download Bills (PDF)",
    downloadPDFDesc: "Export bills as PDF",
    paymentHistory: "📅 Payment History",
    paymentHistoryDesc: "View receipts and receipts",
    security: "🔐 Security & Reminders",
    twoFA: "🔐 Two-Factor Authentication",
    twoFADesc: "Enable 2FA for enhanced security",
    billReminders: "📝 Bill Reminders",
    billRemindersDesc: "Get automatic bill notifications",
    totalBilled: "Total Billed",
    averageMonthly: "Average Monthly",
    highestUsage: "Highest Bill",
    lowestUsage: "Lowest Bill",
    twoFAEnabled: "✓ Two-Factor Authentication enabled",
    twoFADisabled: "✓ Two-Factor Authentication disabled",
    remindersEnabled: "✓ Bill Reminders enabled",
    remindersDisabled: "✓ Bill Reminders disabled"
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
    historyError: "আপডেট ইতিহাস পেতে ব্যর্থ। আবার চেষ্টা করুন.",
    notifications: "🔔 বিজ্ঞপ্তি এবং সতর্কতা",
    lowBalanceAlert: "কম ব্যালেন্স সতর্কতা",
    lowBalanceDesc: "আপনার ব্যালেন্স ২০০ টাকার নিচে",
    outageAlert: "সেবা অবস্থা",
    outageDesc: "সব সেবা সাধারণত চলছে",
    paymentConfirm: "পেমেন্ট নিশ্চিতকরণ",
    paymentConfirmDesc: "শেষ পেমেন্ট সফলভাবে গৃহীত",
    reporting: "📊 রিপোর্টিং এবং বিশ্লেষণ",
    exportReport: "📑 ব্যবহার রিপোর্ট রপ্তানি করুন",
    printBills: "🖨️ বিল প্রিন্ট করুন",
    comparative: "📊 মাসিক তুলনা",
    comparativeTitle: "📊 মাসিক তুলনা বিশ্লেষণ",
    noComparativeData: "এখনও কোনও তুলনামূলক ডেটা উপলব্ধ নেই।",
    analytics: "📊 ডেটা এবং বিশ্লেষণ",
    billingHistory: "📊 বিলিং ইতিহাস",
    billingHistoryDesc: "১২ মাসের বিলিং প্রবণতা দেখুন",
    usageTrends: "📈 ব্যবহার প্রবণতা",
    usageTrendsDesc: "খরচের নিদর্শন বিশ্লেষণ করুন",
    downloadPDF: "💾 বিল ডাউনলোড করুন (PDF)",
    downloadPDFDesc: "বিল PDF হিসাবে রপ্তানি করুন",
    paymentHistory: "📅 পেমেন্ট ইতিহাস",
    paymentHistoryDesc: "রশিদ এবং রশিদ দেখুন",
    security: "🔐 নিরাপত্তা এবং অনুস্মারক",
    twoFA: "🔐 দ্বি-ফ্যাক্টর প্রমাণীকরণ",
    twoFADesc: "উন্নত নিরাপত্তার জন্য 2FA সক্ষম করুন",
    billReminders: "📝 বিল অনুস্মারক",
    billRemindersDesc: "স্বয়ংক্রিয় বিল বিজ্ঞপ্তি পান",
    totalBilled: "মোট বিল",
    averageMonthly: "গড় মাসিক",
    highestUsage: "সর্বোচ্চ বিল",
    lowestUsage: "ন্যূনতম বিল",
    twoFAEnabled: "✓ দ্বি-ফ্যাক্টর প্রমাণীকরণ সক্ষম",
    twoFADisabled: "✓ দ্বি-ফ্যাক্টর প্রমাণীকরণ অক্ষম",
    remindersEnabled: "✓ বিল অনুস্মারক সক্ষম",
    remindersDisabled: "✓ বিল অনুস্মারক অক্ষম"
  }
};

let currentLanguage = "en";

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
function setToggleMessage(text, type) {
  const elMsg = document.getElementById("toggleMsg");
  if (!elMsg) return;
  elMsg.className = type === "error" ? "error" : type === "success" ? "success" : "";
  elMsg.innerText = text || "";
}

// ----- Language functions -----
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
  
  // Notifications & Alerts translations
  setText("label-notifications", t.notifications);
  setText("label-low-balance-alert", t.lowBalanceAlert);
  setText("label-low-balance-desc", t.lowBalanceDesc);
  setText("label-outage-alert", t.outageAlert);
  setText("label-outage-desc", t.outageDesc);
  setText("label-payment-confirm", t.paymentConfirm);
  setText("label-payment-confirm-desc", t.paymentConfirmDesc);
  
  // Reporting translations
  setText("label-reporting", t.reporting);
  setText("btn-export-report", t.exportReport);
  setText("btn-print-bills", t.printBills);
  setText("btn-comparative", t.comparative);
  setText("modal-comparative-title", t.comparativeTitle);
}

// Fetch deployed web app version and display in small bar
async function fetchWebVersion() {
  const el = document.getElementById('webVersion');
  if (!el) return;
  try {
    const res = await fetch(`${API_BASE}?action=getVersion`);
    if (!res.ok) return;
    const json = await res.json();
    const ts = json.timestamp ? new Date(json.timestamp).toLocaleString() : '';
    el.textContent = json.version ? `Web v${json.version}` + (ts ? ` • ${ts}` : '') : '';
  } catch (err) {
    console.warn('Unable to fetch web app version', err);
  }
}

// ----- Login -----
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
      const e = document.getElementById(id);
      if (e) e.innerText = value || "";
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

    sessionStorage.setItem("customerId", id);
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
    console.error("login error", err);
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

// ===== submitTransaction (robust, logs, retries with text/plain fallback) =====
async function submitTransaction(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();
  console.log("submitTransaction called");

  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const txnEl = el('transactionNumber');
  const msgEl = el('confirmMsg');
  const btn = el('btn-submit-payment');

  if (msgEl) { msgEl.textContent = ''; msgEl.className = ''; msgEl.style.display = ''; }

  if (!id) {
    showError(msgEl, 'Please login first.');
    console.warn('submitTransaction: no customer id in storage');
    return;
  }
  const txn = txnEl ? txnEl.value.trim() : '';
  if (!txn) {
    showError(msgEl, 'Please enter Transaction Number.');
    console.warn('submitTransaction: no transaction entered');
    return;
  }
  if (!/^[A-Za-z0-9\-]{3,60}$/.test(txn)) {
    showError(msgEl, 'Invalid transaction number format.');
    console.warn('submitTransaction: invalid transaction format', txn);
    return;
  }

  if (btn) { btn.disabled = true; btn.dataset.origText = btn.innerText; btn.innerText = 'Submitting...'; }

  const payload = { action: 'submitTransaction', customerId: id, transaction: txn };
  // Attach API key if configured
  if (API_KEY && API_KEY !== "REPLACE_WITH_YOUR_KEY") {
    payload.apiKey = API_KEY;
  }

  // Helper to parse response text/JSON and return { ok, status, bodyText, json }
  async function parseResponse(res) {
    const status = res.status;
    let bodyText = '';
    try { bodyText = await res.text(); } catch (e) { bodyText = ''; }
    let json = null;
    try { json = JSON.parse(bodyText); } catch (e) { /* not JSON */ }
    return { ok: res.ok, status, bodyText, json };
  }

  // Try fetch with application/json first
  try {
    console.log('submitTransaction -> POST (application/json) to', API_BASE, 'payload:', payload);
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit'
    });

    const parsed = await parseResponse(res);
    console.log('submitTransaction -> response', parsed.status, parsed.bodyText, parsed.json);

    if (!res.ok) {
      // If CORS/preflight issue or server error and fallback is enabled, try text/plain
      if (ENABLE_TEXT_PLAIN_FALLBACK) {
        console.warn('submitTransaction: primary request failed or non-ok. Attempting text/plain fallback.');
        return await submitTransaction_textPlainFallback(payload, btn, txnEl, msgEl);
      } else {
        const errMsg = (parsed.json && (parsed.json.error || parsed.json.message)) || parsed.bodyText || `Request failed (${parsed.status})`;
        showError(msgEl, errMsg);
        return;
      }
    }

    // Success or JSON reply handling
    if (parsed.json) {
      const data = parsed.json;
      if (data.status && /success|✅|Payment confirmation submitted/i.test(String(data.status))) {
        showSuccess(msgEl, data.status);
        if (txnEl) txnEl.value = '';
      } else if (data.error) {
        showError(msgEl, data.error);
      } else {
        showSuccess(msgEl, data.message || JSON.stringify(data));
      }
    } else {
      // Not JSON - server returned text
      if (/success|✅/i.test(parsed.bodyText)) {
        showSuccess(msgEl, parsed.bodyText);
        if (txnEl) txnEl.value = '';
      } else {
        showError(msgEl, parsed.bodyText || 'Unknown server response');
      }
    }
  } catch (err) {
    console.error('submitTransaction exception (application/json):', err);
    // If network/CORS, try text/plain fallback if enabled
    if (ENABLE_TEXT_PLAIN_FALLBACK) {
      console.warn('submitTransaction: attempting text/plain fallback due to exception.');
      try {
        await submitTransaction_textPlainFallback(payload, btn, txnEl, msgEl);
      } catch (fbErr) {
        console.error('submitTransaction fallback also failed:', fbErr);
        showError(msgEl, 'Network or CORS error. Check console for details.');
      }
    } else {
      showError(msgEl, 'Network error. Please try again.');
    }
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = btn.dataset.origText || 'Submit Payment Confirmation'; }
  }
}

// Helper: fallback POST using Content-Type: text/plain to avoid preflight
async function submitTransaction_textPlainFallback(payload, btn, txnEl, msgEl) {
  try {
    console.log('submitTransaction_textPlainFallback -> POST (text/plain) to', API_BASE, 'payload:', payload);
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
      credentials: 'omit'
    });
    const bodyText = await res.text();
    let json = null;
    try { json = JSON.parse(bodyText); } catch (e) { /* not JSON */ }

    console.log('submitTransaction_textPlainFallback -> response', res.status, bodyText, json);

    if (!res.ok) {
      const errMsg = (json && (json.error || json.message)) || bodyText || `Request failed (${res.status})`;
      showError(msgEl, errMsg);
      return;
    }

    if (json) {
      if (json.status && /success|✅/i.test(String(json.status))) {
        showSuccess(msgEl, json.status);
        if (txnEl) txnEl.value = '';
      } else if (json.error) {
        showError(msgEl, json.error);
      } else {
        showSuccess(msgEl, json.message || JSON.stringify(json));
      }
    } else {
      if (/success|✅/i.test(bodyText)) {
        showSuccess(msgEl, bodyText);
        if (txnEl) txnEl.value = '';
      } else {
        showError(msgEl, bodyText || 'Unknown server response');
      }
    }
  } catch (err) {
    console.error('submitTransaction_textPlainFallback exception:', err);
    throw err;
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = btn.dataset.origText || 'Submit Payment Confirmation'; }
  }
}

// ---- Email subscription toggle ----
async function toggleEmail() {
  const id = (document.getElementById("customerId") || {}).value || sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || "";
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
    const url = `${API_BASE}?id=${encodeURIComponent(id)}&subscribe=${enabled}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();

    if (data.status) {
      setToggleMessage(enabled ? t.emailSuccess : t.emailDisabled, "success");
      const confirmRes = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`);
      const confirmData = await confirmRes.json();
      if (emailToggleEl) emailToggleEl.checked = (String(confirmData.subscribed) === "true");
      if (emailInput) emailInput.value = confirmData.email || email;
    } else {
      setToggleMessage("Could not save changes.", "error");
    }
  } catch (err) {
    console.error('toggleEmail error', err);
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

  // Clear stored identity
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
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const t = translations[currentLanguage] || translations.en;

  if (!id) {
    alert('Please login first');
    return;
  }

  const historyContainer = document.getElementById("historyContainer");
  if (!historyContainer) return;

  // Show loading message
  historyContainer.innerHTML = '<p style="text-align: center; color: #666;">Loading update history...</p>';

  try {
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&history=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    if (data.history && data.history.length > 0) {
      historyContainer.innerHTML = data.history.map(item => `
        <div class="history-item">
          <div class="history-date">📅 ${item.date || 'N/A'}</div>
          <div class="history-balance">💰 Balance: <strong>${item.balance || 'N/A'}</strong></div>
          <div class="history-description">${item.description || 'Update'}</div>
        </div>
      `).join('');
    } else {
      historyContainer.innerHTML = `<p style="text-align: center; color: #666;">${t.noHistory}</p><div style="text-align:center;margin-top:8px;"><button class="btn btn-secondary" onclick="showDemoHistory()">Show demo history</button></div>`;
    }
  } catch (err) {
    console.error('viewUpdateHistory error:', err);
    
    // Show helpful message for CORS errors
    historyContainer.innerHTML = `
      <div style="text-align: center; color: #666; padding: 20px;">
        <p style="margin-bottom: 10px;">⚠️ Update history feature is currently unavailable.</p>
        <p style="font-size: 13px; color: #999;">Please contact support if you need assistance.</p>
      </div>
    `;
  }

  const modal = document.getElementById("historyModal");
  if (modal) modal.style.display = "flex";
}

function closeUpdateHistory() {
  const modal = document.getElementById("historyModal");
  if (modal) modal.style.display = "none";
}

// Client-side demo history (no server changes)
function showDemoHistory() {
  const historyContainer = document.getElementById("historyContainer");
  if (!historyContainer) return;
  const now = new Date();
  const demo = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 5 + i);
    demo.push({ date: d.toLocaleDateString(), balance: (Math.random() * 1200 - 200).toFixed(2), description: 'Auto update' });
  }
  historyContainer.innerHTML = demo.map(item => `
    <div class="history-item">
      <div class="history-date">📅 ${item.date}</div>
      <div class="history-balance">💰 Balance: <strong>${item.balance}</strong></div>
      <div class="history-description">${item.description}</div>
    </div>
  `).join('');
}
window.showDemoHistory = showDemoHistory;

window.addEventListener("click", function(event) {
  const modal = document.getElementById("historyModal");
  if (modal && event.target === modal) modal.style.display = "none";
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = el('historyModal');
    if (modal && modal.style.display !== 'none') closeUpdateHistory();
  }
});

// Ensure functions used by inline onclick or other scripts are available globally
// ---- Export Usage Report (CSV) ----
async function exportUsageReport() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const name = localStorage.getItem('customerName') || 'User';
  
  if (!id) {
    alert('Please login first.');
    return;
  }
  
  try {
    // Fetch usage report from AppScript
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&action=getUsageReport`);
    if (!res.ok) throw new Error('Failed to fetch usage report');
    const data = await res.json();
    
    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }
    
    // Build CSV from usage data
    let csv = `Customer ID,Customer Name,Date,Balance,Description\n`;
    
    if (data.usage && data.usage.length > 0) {
      data.usage.forEach(item => {
        csv += `${id},${data.customerName || name},${item.date},${item.balance},${item.description}\n`;
      });
    } else {
      csv += `${id},${data.customerName || name},${new Date().toLocaleDateString()},0.00,No data available\n`;
    }
    
    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `usage-report-${id}-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export usage report error:', err);
    alert('Failed to export report: ' + err.message);
  }
}

// ---- Print Bills ----
function printBills() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const name = localStorage.getItem('customerName') || 'User';
  const email = localStorage.getItem('customerEmail') || 'N/A';
  
  if (!id) {
    alert('Please login first.');
    return;
  }
  
  const printContent = `
    <html>
      <head>
        <title>Bill Invoice - ${id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .invoice { background: white; padding: 30px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 28px; }
          .customer-info { margin: 20px 0; }
          .bill-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .bill-items th { background: #f0f0f0; border: 1px solid #000; padding: 10px; text-align: left; }
          .bill-items td { border: 1px solid #e0e0e0; padding: 10px; }
          .total-row { font-weight: bold; background: #f9f9f9; }
          .footer { text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>⚡ Utility Bill Invoice</h1>
          </div>
          <div class="customer-info">
            <p><strong>Customer ID:</strong> ${id}</p>
            <p><strong>Customer Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <table class="bill-items">
            <thead>
              <tr>
                <th>Bill Type</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Electric</td>
                <td>₹0.00</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>Pending</td>
              </tr>
              <tr>
                <td>Water</td>
                <td>₹0.00</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>Pending</td>
              </tr>
              <tr>
                <td>Gas</td>
                <td>₹0.00</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>Pending</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Total Due</td>
                <td>₹0.00</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>This is an automated bill. Please contact support for disputes.</p>
            <p>Payment ID Reference: ${id}</p>
          </div>
        </div>
        <script>
          window.print();
          setTimeout(() => window.close(), 500);
        <\/script>
      </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
}

// ---- Comparative Analysis (Month-to-Month) ----
async function viewComparativeAnalysis() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const t = translations[currentLanguage] || translations.en;
  
  if (!id) {
    alert('Please login first.');
    return;
  }
  
  const comparativeContainer = document.getElementById("comparativeContainer");
  if (!comparativeContainer) return;
  
  // Show loading message
  comparativeContainer.innerHTML = '<p style="text-align: center; color: #666;">Loading comparative analysis...</p>';
  
  try {
    // Fetch monthly comparison from AppScript
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&action=getMonthlyComparison`);
    if (!res.ok) throw new Error('Failed to fetch comparison data');
    const data = await res.json();
    
    if (data.error) {
      comparativeContainer.innerHTML = `<p style="text-align: center; color: #666;">Error: ${data.error}</p>`;
      return;
    }
    
    const analysisData = data.months || [];
    
    if (analysisData && analysisData.length > 0) {
      comparativeContainer.innerHTML = `
        <table class="comparative-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Electric (৳)</th>
              <th>Water (৳)</th>
              <th>Gas (৳)</th>
              <th>Total (৳)</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            ${analysisData.map((data, idx) => {
              const total = (parseFloat(data.electric || 0) + parseFloat(data.water || 0) + parseFloat(data.gas || 0)).toFixed(2);
              const prevTotal = idx > 0 ? (parseFloat(analysisData[idx-1].electric || 0) + parseFloat(analysisData[idx-1].water || 0) + parseFloat(analysisData[idx-1].gas || 0)).toFixed(2) : 0;
              const trend = idx > 0 ? (total > prevTotal ? '📈' : total < prevTotal ? '📉' : '➡️') : '➡️';
              return `
                <tr>
                  <td>${data.month}</td>
                  <td>৳${parseFloat(data.electric || 0).toFixed(2)}</td>
                  <td>৳${parseFloat(data.water || 0).toFixed(2)}</td>
                  <td>৳${parseFloat(data.gas || 0).toFixed(2)}</td>
                  <td><strong>৳${total}</strong></td>
                  <td>${trend}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="analysis-summary">
          <p><strong>💡 Summary:</strong> Showing your last ${analysisData.length} months of utility usage. Monitor your consumption patterns to optimize costs.</p>
        </div>
      `;
    } else {
      comparativeContainer.innerHTML = `<p style="text-align: center; color: #666;">${t.noComparativeData}</p>`;
    }
  } catch (err) {
    console.error('viewComparativeAnalysis error:', err);
    comparativeContainer.innerHTML = `
      <div style="text-align: center; color: #666; padding: 20px;">
        <p style="margin-bottom: 10px;">⚠️ Unable to load comparative analysis.</p>
        <p style="font-size: 13px; color: #999;">Error: ${err.message}</p>
      </div>
    `;
  }
  
  const modal = document.getElementById("comparativeModal");
  if (modal) modal.style.display = "flex";
}

function closeComparativeAnalysis() {
  const modal = document.getElementById("comparativeModal");
  if (modal) modal.style.display = "none";
}

// ---- Billing History Modal ----
async function viewBillingHistory() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const t = translations[currentLanguage] || translations.en;

  if (!id) {
    alert('Please login first');
    return;
  }

  const billingContainer = document.getElementById("billingHistoryContainer");
  if (!billingContainer) return;

  billingContainer.innerHTML = '<p style="text-align: center; color: #666;">Loading billing history...</p>';

  try {
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&history=true`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    if (data.history && data.history.length > 0) {
      const historyHTML = `
        <div class="billing-history-table">
          <table>
            <thead>
              <tr>
                <th>📅 Date</th>
                <th>💰 Balance (৳)</th>
                <th>📝 Description</th>
              </tr>
            </thead>
            <tbody>
              ${data.history.map(item => `
                <tr>
                  <td>${item.date || 'N/A'}</td>
                  <td class="balance-cell">${item.balance || '0'}</td>
                  <td>${item.description || 'Balance Update'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="billing-summary" style="margin-top: 20px; padding: 15px; background: var(--bg-secondary); border-radius: 8px;">
            <p><strong>📊 Total Records:</strong> ${data.history.length}</p>
            <p><strong>💡 Tip:</strong> Monitor your balance to avoid service interruption.</p>
          </div>
        </div>
      `;
      billingContainer.innerHTML = historyHTML;
    } else {
      billingContainer.innerHTML = `
        <div style="text-align: center; padding: 30px;">
          <p style="color: #666;">No billing history available yet.</p>
          <button class="btn btn-secondary" onclick="showDemoBillingHistory()" style="margin-top: 10px;">Show Demo Data</button>
        </div>
      `;
    }
  } catch (err) {
    console.error('viewBillingHistory error:', err);
    billingContainer.innerHTML = `
      <div style="text-align: center; color: #666; padding: 20px;">
        <p style="margin-bottom: 10px;">⚠️ Unable to load billing history.</p>
        <p style="font-size: 13px; color: #999;">${err.message}</p>
        <button class="btn btn-secondary" onclick="showDemoBillingHistory()" style="margin-top: 10px;">Show Demo Data</button>
      </div>
    `;
  }

  const modal = document.getElementById("billingHistoryModal");
  if (modal) modal.style.display = "flex";
}

function showDemoBillingHistory() {
  const billingContainer = document.getElementById("billingHistoryContainer");
  if (!billingContainer) return;

  const demo = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1 + (i * 2));
    const balance = (2000 - (i * 150) + Math.random() * 200).toFixed(2);
    demo.push({
      date: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      balance: balance,
      description: `Monthly update - Balance: ৳${balance}`
    });
  }

  const historyHTML = `
    <div class="billing-history-table">
      <table>
        <thead>
          <tr>
            <th>📅 Date</th>
            <th>💰 Balance (৳)</th>
            <th>📝 Description</th>
          </tr>
        </thead>
        <tbody>
          ${demo.map(item => `
            <tr>
              <td>${item.date}</td>
              <td class="balance-cell">${item.balance}</td>
              <td>${item.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="billing-summary" style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
        <p style="color: #856404;"><strong>📊 Demo Data:</strong> This is sample billing history for demonstration purposes.</p>
      </div>
    </div>
  `;
  billingContainer.innerHTML = historyHTML;
}

function closeBillingHistory() {
  const modal = document.getElementById("billingHistoryModal");
  if (modal) modal.style.display = "none";
}

// ---- Payment History Modal ----
async function viewPaymentHistory() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const t = translations[currentLanguage] || translations.en;

  if (!id) {
    alert('Please login first');
    return;
  }

  const paymentContainer = document.getElementById("paymentHistoryContainer");
  if (!paymentContainer) return;

  paymentContainer.innerHTML = '<p style="text-align: center; color: #666;">Loading payment history...</p>';

  try {
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&action=getPaymentHistory`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    if (data.payments && data.payments.length > 0) {
      const paymentHTML = `
        <div class="payment-history-section">
          <div class="payment-stats">
            <div class="stat">
              <span class="stat-label">Total Payments</span>
              <span class="stat-value">${data.totalPayments}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Last Payment</span>
              <span class="stat-value">${data.lastPayment || 'N/A'}</span>
            </div>
          </div>

          <table class="payment-table">
            <thead>
              <tr>
                <th>📅 Date & Time</th>
                <th>🏷️ Transaction ID</th>
                <th>🏢 Flat</th>
                <th>✅ Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.payments.map(payment => `
                <tr>
                  <td>${payment.timestamp}</td>
                  <td class="transaction-id">${payment.transactionNumber}</td>
                  <td>${payment.flatNumber}</td>
                  <td><span class="status-badge confirmed">✅ ${payment.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="payment-actions" style="margin-top: 20px; padding: 15px; background: var(--bg-secondary); border-radius: 8px;">
            <p><strong>💡 Need a receipt?</strong> Click on any transaction ID to download the receipt.</p>
            <button class="btn btn-secondary" onclick="downloadPaymentReceipt()" style="margin-top: 10px;">📥 Download All Receipts</button>
          </div>
        </div>
      `;
      paymentContainer.innerHTML = paymentHTML;
    } else {
      paymentContainer.innerHTML = `
        <div style="text-align: center; padding: 30px;">
          <p style="color: #666; font-size: 16px;">📭 No payment history available yet.</p>
          <p style="color: #999; font-size: 13px; margin-top: 8px;">Your payments will appear here once you make a payment.</p>
          <button class="btn btn-secondary" onclick="showDemoPaymentHistory()" style="margin-top: 10px;">Show Demo Data</button>
        </div>
      `;
    }
  } catch (err) {
    console.error('viewPaymentHistory error:', err);
    paymentContainer.innerHTML = `
      <div style="text-align: center; color: #666; padding: 20px;">
        <p style="margin-bottom: 10px;">⚠️ Unable to load payment history.</p>
        <p style="font-size: 13px; color: #999;">${err.message}</p>
        <button class="btn btn-secondary" onclick="showDemoPaymentHistory()" style="margin-top: 10px;">Show Demo Data</button>
      </div>
    `;
  }

  const modal = document.getElementById("paymentHistoryModal");
  if (modal) modal.style.display = "flex";
}

function showDemoPaymentHistory() {
  const paymentContainer = document.getElementById("paymentHistoryContainer");
  if (!paymentContainer) return;

  const demo = [
    { timestamp: "2026-03-15 14:30", transactionID: "TXN2026031501", flatNumber: "3A", status: "Confirmed" },
    { timestamp: "2026-02-20 10:45", transactionID: "TXN2026022001", flatNumber: "3A", status: "Confirmed" },
    { timestamp: "2026-01-25 16:20", transactionID: "TXN2026012501", flatNumber: "3A", status: "Confirmed" },
    { timestamp: "2025-12-28 09:15", transactionID: "TXN2025122801", flatNumber: "3A", status: "Confirmed" }
  ];

  const paymentHTML = `
    <div class="payment-history-section">
      <div class="payment-stats">
        <div class="stat">
          <span class="stat-label">Total Payments</span>
          <span class="stat-value">${demo.length}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Last Payment</span>
          <span class="stat-value">${demo[0].timestamp}</span>
        </div>
      </div>

      <table class="payment-table">
        <thead>
          <tr>
            <th>📅 Date & Time</th>
            <th>🏷️ Transaction ID</th>
            <th>🏢 Flat</th>
            <th>✅ Status</th>
          </tr>
        </thead>
        <tbody>
          ${demo.map(payment => `
            <tr>
              <td>${payment.timestamp}</td>
              <td class="transaction-id">${payment.transactionID}</td>
              <td>${payment.flatNumber}</td>
              <td><span class="status-badge confirmed">✅ ${payment.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="payment-actions" style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
        <p style="color: #856404;"><strong>📊 Demo Data:</strong> This is sample payment history for demonstration purposes.</p>
      </div>
    </div>
  `;
  paymentContainer.innerHTML = paymentHTML;
}

function closePaymentHistory() {
  const modal = document.getElementById("paymentHistoryModal");
  if (modal) modal.style.display = "none";
}

function downloadPaymentReceipt() {
  alert('📥 Receipt download functionality - please contact support');
}

window.showDemoPaymentHistory = showDemoPaymentHistory;

window.login = login;
window.showSteps = showSteps;
window.goToPathaoPay = goToPathaoPay;
window.submitTransaction = submitTransaction;
window.toggleEmail = toggleEmail;
window.logout = logout;
window.viewUpdateHistory = viewUpdateHistory;
window.closeUpdateHistory = closeUpdateHistory;
window.viewBillingHistory = viewBillingHistory;
window.closeBillingHistory = closeBillingHistory;
window.showDemoBillingHistory = showDemoBillingHistory;
window.viewPaymentHistory = viewPaymentHistory;
window.closePaymentHistory = closePaymentHistory;
window.downloadPaymentReceipt = downloadPaymentReceipt;
window.exportUsageReport = exportUsageReport;
window.printBills = printBills;
window.viewComparativeAnalysis = viewComparativeAnalysis;
window.closeComparativeAnalysis = closeComparativeAnalysis;
window.backToDashboard = backToDashboard;
window.switchLanguage = switchLanguage;

// On load: language, auto-login if saved, and prefill transaction if returned via URL
window.addEventListener("load", function() {
  const savedLang = localStorage.getItem("preferredLanguage");
  if (savedLang) {
    currentLanguage = savedLang;
    document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.remove("active"));
    const langBtns = document.querySelectorAll(".lang-btn");
    if (langBtns.length > 0) langBtns[savedLang === "bn" ? 1 : 0].classList.add("active");
  }
  updatePageLanguage();

  // Fetch and display deployed web app version (if API exposes it)
  try { fetchWebVersion(); } catch (e) { console.warn('fetchWebVersion failed', e); }

  const savedId = localStorage.getItem("customerId");
  if (savedId && document.getElementById("customerId")) {
    document.getElementById("customerId").value = savedId;
    login();
  }

  // If opened with ?transaction=...&customerId=... prefill the transaction field and auto-login if customerId provided.
  const params = new URLSearchParams(window.location.search);
  const tx = params.get('transaction');
  const cid = params.get('customerId');
  if (cid && document.getElementById('customerId')) {
    document.getElementById('customerId').value = cid;
    sessionStorage.setItem('customerId', cid);
    localStorage.setItem('customerId', cid);
    // hide login and show dashboard UI if present
    const loginEl = document.getElementById('login');
    if (loginEl) loginEl.style.display = 'none';
    const dashEl = document.getElementById('dashboard');
    if (dashEl) dashEl.style.display = 'block';
  }
  if (tx && document.getElementById('transactionNumber')) {
    document.getElementById('transactionNumber').value = tx;
    const msgEl = document.getElementById('confirmMsg');
    if (msgEl) showSuccess(msgEl, 'Transaction reference has been prefilled. Verify the transaction ID and press "Submit Payment Confirmation".');
    // clear query params from URL
    if (history.replaceState) {
      history.replaceState(null, '', window.location.pathname);
    }
  }

  // Bind submit button safely (in case HTML used inline onclick previously)
  (function bindSubmitButton() {
    const btn = document.getElementById('btn-submit-payment');
    if (!btn) return;
    // remove inline onclick to avoid double-calls
    try { btn.onclick = null; } catch (e) {}
    btn.removeEventListener('click', submitTransaction);
    btn.addEventListener('click', submitTransaction);
    console.log('submitTransaction event listener bound to #btn-submit-payment');
  })();
});