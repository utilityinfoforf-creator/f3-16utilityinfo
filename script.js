ilToggle: "Receive balance updates by email",
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

// Language switch function (updated to accept event)
function switchLanguage(lang, event) {
  currentLanguage = lang;
  
  // Update button active state
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  if (event && event.target) {
    event.target.classList.add("active");
  }

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

    localStorage.setItem("customerId", id);
    localStorage.setItem("customerName", data.name);
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
    
    // Update language on login
    updatePageLanguage();
  } catch (err) {
    const errorEl = document.getElementById("error");
    if (errorEl) {
      errorEl.innerText = "Network error";
      errorEl.style.display = "block";
    }
  }
}

// Check for persistent login
window.addEventListener("load", function() {
  const savedId = localStorage.getItem("customerId");
  if (savedId && document.getElementById("customerId")) {
    document.getElementById("customerId").value = savedId;
    login();
  }
});

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
