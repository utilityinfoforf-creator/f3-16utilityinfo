const API_BASE = "https://script.google.com/macros/s/AKfycbxvBjqw2zs8n8xop1V1flLaJFGLK8MfuzSQTDXPdzuByT4v0gtm6yu8ToaYrnAe7qJ7cQ/exec";

// Language translations
const translations = {
  en: {
    welcome: "Welcome, ",
    subtitle: "Your Utility Dashboard",
    warning: "⚠️ If your electric meter balance goes below 200 tk, your line will be cut off.",
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

// Current language
let currentLanguage = "en";

// Language switch function
function switchLanguage(lang) {
  currentLanguage = lang;
  
  // Update button active state
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Update all text elements
  updatePageLanguage();
  
  // Save preference
  localStorage.setItem("preferredLanguage", lang);
}

function updatePageLanguage() {
  const t = translations[currentLanguage];

  // Dashboard labels
  document.getElementById("dashboardSubtitle").innerText = t.subtitle;
  document.getElementById("warningBox").innerText = t.warning;
  document.getElementById("label-electric").innerText = t.electric;
  document.getElementById("label-water").innerText = t.water;
  document.getElementById("label-gas").innerText = t.gas;
  document.getElementById("label-internet").innerText = t.internet;
  document.getElementById("label-internet-bill").innerText = t.internetBill;
  document.getElementById("label-flat").innerText = t.flat;
  document.getElementById("label-updated").innerText = t.lastUpdated;
  
  // Email section
  document.getElementById("label-email").innerText = t.emailNotif;
  document.getElementById("label-email-toggle").innerText = t.emailToggle;
  document.getElementById("emailAddress").placeholder = t.emailPlaceholder;
  
  // Buttons
  document.getElementById("btn-payment").innerText = t.payment;
  document.getElementById("btn-terms").innerText = t.terms;
  document.getElementById("btn-internet").innerText = t.connection;
  document.getElementById("btn-history").innerText = t.history;
  document.getElementById("btn-logout").innerText = t.logout;
  
  // Modal
  document.getElementById("modal-history-title").innerText = t.historyTitle;
}

function setToggleMessage(text, type) {
  const el = document.getElementById("toggleMsg");
  el.className = type === "error" ? "error" : type === "success" ? "success" : "";
  el.innerText = text || "";
}

async function login() {
  const id = document.getElementById("customerId").value.trim();
  setToggleMessage("", "");
  document.getElementById("emailAddress").classList.remove("input-error");

  if (!id) { 
    const errorEl = document.getElementById("error");
    errorEl.innerText = "Enter Customer ID";
    errorEl.style.display = "block";
    return; 
  }

  try {
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`);
    const data = await res.json();

    if (data.error) { 
      const errorEl = document.getElementById("error");
      errorEl.innerText = data.error;
      errorEl.style.display = "block";
      return; 
    }

    document.getElementById("name").innerText = data.name;
    document.getElementById("electricBalance").innerText = data.electricBalance;
    document.getElementById("waterBillDue").innerText = data.waterBillDue;
    document.getElementById("gasBillDue").innerText = data.gasBillDue;
    document.getElementById("internetConnected").innerText = data.internetConnected;
    document.getElementById("internetBillDue").innerText = data.internetBillDue;
    document.getElementById("flatNumber").innerText = data.flatNumber;
    document.getElementById("lastUpdated").innerText = data.lastUpdated;

    if (data.subscribed) document.getElementById("emailToggle").checked = (String(data.subscribed) === "true");
    document.getElementById("emailAddress").value = data.email || "";

    document.getElementById("error").innerText = "";
    document.getElementById("error").style.display = "none";
    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    
    // Update language on login
    updatePageLanguage();
  } catch (err) {
    const errorEl = document.getElementById("error");
    errorEl.innerText = "Network error";
    errorEl.style.display = "block";
  }
}

async function toggleEmail() {
  const id = document.getElementById("customerId").value.trim();
  const enabled = document.getElementById("emailToggle").checked;
  const emailInput = document.getElementById("emailAddress");
  const email = emailInput.value.trim();
  const t = translations[currentLanguage];

  setToggleMessage("", "");
  emailInput.classList.remove("input-error");

  if (enabled && !email) {
    emailInput.classList.add("input-error");
    setToggleMessage(t.emailError, "error");
    document.getElementById("emailToggle").checked = false;
    return;
  }

  try {
    const url = `${API_BASE}?id=${encodeURIComponent(id)}&subscribe=${enabled}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status) {
      setToggleMessage(enabled ? t.emailSuccess : t.emailDisabled, "success");
      const confirmRes = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`);
      const confirmData = await confirmRes.json();
      document.getElementById("emailToggle").checked = (String(confirmData.subscribed) === "true");
      document.getElementById("emailAddress").value = confirmData.email || email;
    } else {
      setToggleMessage("Could not save changes.", "error");
    }
  } catch (err) {
    setToggleMessage("Network error while saving subscription.", "error");
  }
}

function logout() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("login").style.display = "flex";
  document.getElementById("error").innerText = "";
  document.getElementById("error").style.display = "none";
  document.getElementById("customerId").value = "";
  document.getElementById("emailToggle").checked = false;
  document.getElementById("emailAddress").value = "";
  setToggleMessage("", "");
  document.getElementById("emailAddress").classList.remove("input-error");
}

function goToPayment() {
  window.location.href = "payment.html";
}

function goToTerms() {
  window.location.href = "terms.html";
}

function backToDashboard() {
  document.getElementById("dashboard").style.display = "block";
}

async function viewUpdateHistory() {
  const id = document.getElementById("customerId").value.trim();
  const t = translations[currentLanguage];
  
  try {
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&history=true`);
    const data = await res.json();

    const historyContainer = document.getElementById("historyContainer");
    
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

    document.getElementById("historyModal").style.display = "flex";
  } catch (err) {
    alert(t.historyError);
  }
}

function closeUpdateHistory() {
  document.getElementById("historyModal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById("historyModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

// Load saved language preference
window.addEventListener("load", function() {
  const saved = localStorage.getItem("preferredLanguage");
  if (saved && saved !== "en") {
    currentLanguage = saved;
    document.querySelectorAll(".lang-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    document.querySelectorAll(".lang-btn")[saved === "bn" ? 1 : 0].classList.add("active");
  }
});
async function sendVerificationCode() {
  const id = document.getElementById("customerId").value.trim();
  const email = document.getElementById("emailAddress").value.trim();
  const t = translations[currentLanguage];

  if (!id || !email) {
    setToggleMessage(t.emailError, "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}?action=request&customerId=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`);
    const txt = await res.text();
    setToggleMessage(txt, "success");
  } catch (err) {
    setToggleMessage("Network error while sending verification code.", "error");
  }
}

async function verifyEmail() {
  const id = document.getElementById("customerId").value.trim();
  const code = document.getElementById("verificationCode").value.trim();

  if (!id || !code) {
    setToggleMessage("Please enter the verification code.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}?action=confirm&customerId=${encodeURIComponent(id)}&code=${encodeURIComponent(code)}`);
    const txt = await res.text();
    setToggleMessage(txt, txt.includes("✅") ? "success" : "error");

    // Refresh subscription info after verification
    const confirmRes = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`);
    const confirmData = await confirmRes.json();
    document.getElementById("emailToggle").checked = (String(confirmData.subscribed) === "true");
    document.getElementById("emailAddress").value = confirmData.email || "";
  } catch (err) {
    setToggleMessage("Network error while verifying code.", "error");
  }
}
