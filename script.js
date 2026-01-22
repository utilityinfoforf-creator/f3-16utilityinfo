// Configuration (override these before this file runs if needed)
const API_BASE = "https://script.google.com/macros/s/AKfycbzUQeJKLBRCjQG928fnIdJ7Tlg-JR0072ENK-K2_07NBOxWsH9zs0qd5CrcoQW_Mbz3lA/exec";

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
    noComparativeData: "No comparative data available yet."
  },
  bn: {
    welcome: "স্বাগতম, ",
    subtitle: "আপনার ইউটিলিটি ড্যাশবোর্ড",
    warning: "⚠️ আপনার বিদ্যুৎ মিটার ব্যালেন্স ২০০ টাকার নিচে গেলে আপনার লাইন কাটা হবে।",
    electric: "বিদ্যুৎ ব্যালেন্স",
    water: "পান��র বিল বকেয়া",
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
    noComparativeData: "এখনও কোনও তুলনামূলক ডেটা উপলব্ধ নেই।"
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
      if (data.status && /success/i.test(String(data.status))) {
        showSuccess(msgEl, data.status);
        if (txnEl) txnEl.value = '';
      } else if (data.error) {
        showError(msgEl, data.error);
      } else {
        showSuccess(msgEl, data.message || JSON.stringify(data));
      }
    } else {
      // Not JSON - server returned text
      if (/success/i.test(parsed.bodyText)) {
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
      if (json.status && /success/i.test(String(json.status))) {
        showSuccess(msgEl, json.status);
        if (txnEl) txnEl.value = '';
      } else if (json.error) {
        showError(msgEl, json.error);
      } else {
        showSuccess(msgEl, json.message || JSON.stringify(json));
      }
    } else {
      if (/success/i.test(bodyText)) {
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
      historyContainer.innerHTML = `<p style="text-align: center; color: #666;">${t.noHistory}</p>`;
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
function exportUsageReport() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const name = localStorage.getItem('customerName') || 'User';
  
  if (!id) {
    alert('Please login first.');
    return;
  }
  
  // Sample data - replace with actual data from API
  const csv = `Customer ID,Customer Name,Bill Type,Amount,Date\n${id},${name},Electric,0.00,${new Date().toLocaleDateString()}\n${id},${name},Water,0.00,${new Date().toLocaleDateString()}\n${id},${name},Gas,0.00,${new Date().toLocaleDateString()}`;
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `usage-report-${id}-${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
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
function viewComparativeAnalysis() {
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
  
  // Sample data - replace with actual API call
  const currentDate = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
  }
  
  const analysisData = [
    { month: months[0], electric: Math.random() * 1500, water: Math.random() * 500, gas: Math.random() * 300 },
    { month: months[1], electric: Math.random() * 1500, water: Math.random() * 500, gas: Math.random() * 300 },
    { month: months[2], electric: Math.random() * 1500, water: Math.random() * 500, gas: Math.random() * 300 },
    { month: months[3], electric: Math.random() * 1500, water: Math.random() * 500, gas: Math.random() * 300 },
    { month: months[4], electric: Math.random() * 1500, water: Math.random() * 500, gas: Math.random() * 300 },
    { month: months[5], electric: Math.random() * 1500, water: Math.random() * 500, gas: Math.random() * 300 }
  ];
  
  if (analysisData && analysisData.length > 0) {
    comparativeContainer.innerHTML = `
      <table class="comparative-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Electric (₹)</th>
            <th>Water (₹)</th>
            <th>Gas (₹)</th>
            <th>Total (₹)</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          ${analysisData.map((data, idx) => {
            const total = (data.electric + data.water + data.gas).toFixed(2);
            const trend = idx > 0 ? (total > (analysisData[idx-1].electric + analysisData[idx-1].water + analysisData[idx-1].gas).toFixed(2) ? '📈' : '📉') : '➡️';
            return `
              <tr>
                <td>${data.month}</td>
                <td>₹${data.electric.toFixed(2)}</td>
                <td>₹${data.water.toFixed(2)}</td>
                <td>₹${data.gas.toFixed(2)}</td>
                <td><strong>₹${total}</strong></td>
                <td>${trend}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <div class="analysis-summary">
        <p><strong>💡 Summary:</strong> Your average monthly usage is increasing. Consider reducing consumption to save on bills.</p>
      </div>
    `;
  } else {
    comparativeContainer.innerHTML = `<p style="text-align: center; color: #666;">${t.noComparativeData}</p>`;
  }
  
  const modal = document.getElementById("comparativeModal");
  if (modal) modal.style.display = "flex";
}

function closeComparativeAnalysis() {
  const modal = document.getElementById("comparativeModal");
  if (modal) modal.style.display = "none";
}

window.login = login;
window.showSteps = showSteps;
window.goToPathaoPay = goToPathaoPay;
window.submitTransaction = submitTransaction;
window.toggleEmail = toggleEmail;
window.logout = logout;
window.viewUpdateHistory = viewUpdateHistory;
window.closeUpdateHistory = closeUpdateHistory;
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