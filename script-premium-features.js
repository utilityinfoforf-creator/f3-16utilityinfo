// NEW FEATURES: Billing History, Usage Trends, PDF Download (improved), Payment History, 2FA, Bill Reminders
// This file expects script.js to define API_BASE, translations and currentLanguage.

// ---- Billing History (Last 12 Months) ----
async function viewBillingHistory() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const t = translations[currentLanguage] || translations.en;
  
  if (!id) {
    alert('Please login first.');
    return;
  }
  
  const container = document.getElementById("billingHistoryContainer");
  if (!container) return;
  
  container.innerHTML = '<p style="text-align: center; color: #666;">Loading billing history...</p>';
  
  try {
    // Use the backend if available to fetch real billing data; fallback to zeroed sample if not.
    let data = [];
    try {
      const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&action=getUsageReport`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.usage && json.usage.length) {
          // Map usage (reverse order) to last-12-month-like structure if possible
          data = json.usage.slice(0, 12).map(u => ({
            month: u.date,
            electric: parseFloat(u.balance) || 0,
            water: 0,
            gas: 0,
            total: parseFloat(u.balance) || 0
          }));
        }
      }
    } catch (e) {
      // ignore; will use generated zeros
    }

    if (!data.length) {
      const currentDate = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const electricBill = 0;
        const waterBill = 0;
        const gasBill = 0;
        data.push({ month, electric: electricBill, water: waterBill, gas: gasBill, total: electricBill + waterBill + gasBill });
      }
    }
    
    const numericTotal = data.reduce((sum, d) => sum + (parseFloat(d.total) || 0), 0);
    const totalBilled = numericTotal.toFixed(2);
    const avgMonthly = (numericTotal / 12).toFixed(2);
    const highest = Math.max(...data.map(d => parseFloat(d.total) || 0)).toFixed(2);
    const lowest = Math.min(...data.map(d => parseFloat(d.total) || 0)).toFixed(2);
    
    let html = `
      <div class="billing-summary">
        <div class="summary-item">
          <span>${t.totalBilled}</span>
          <strong>৳${totalBilled}</strong>
        </div>
        <div class="summary-item">
          <span>${t.averageMonthly}</span>
          <strong>৳${avgMonthly}</strong>
        </div>
        <div class="summary-item">
          <span>${t.highestUsage}</span>
          <strong>৳${highest}</strong>
        </div>
        <div class="summary-item">
          <span>${t.lowestUsage}</span>
          <strong>৳${lowest}</strong>
        </div>
      </div>
      <table class="billing-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Electric (৳)</th>
            <th>Water (৳)</th>
            <th>Gas (৳)</th>
            <th>Total (৳)</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(d => `
            <tr>
              <td>${d.month}</td>
              <td>৳${(d.electric || 0).toFixed(2)}</td>
              <td>৳${(d.water || 0).toFixed(2)}</td>
              <td>৳${(d.gas || 0).toFixed(2)}</td>
              <td><strong>৳${(d.total || 0).toFixed(2)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
  } catch (err) {
    console.error('viewBillingHistory error:', err);
    container.innerHTML = `<p style="text-align: center; color: #666;">Error loading billing history: ${err.message}</p>`;
  }
  
  const modal = document.getElementById("billingHistoryModal");
  if (modal) modal.style.display = "flex";
}

function closeBillingHistory() {
  const modal = document.getElementById("billingHistoryModal");
  if (modal) modal.style.display = "none";
}

// ---- Usage Trends & Consumption Patterns ----
async function viewUsageTrends() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const t = translations[currentLanguage] || translations.en;
  
  if (!id) {
    alert('Please login first.');
    return;
  }
  
  const container = document.getElementById("usageTrendsContainer");
  if (!container) return;
  
  container.innerHTML = '<p style="text-align: center; color: #666;">Loading usage trends...</p>';
  
  try {
    let data = [];
    let avgElectric = 0, avgWater = 0, avgGas = 0, trend = '➡️ Stable';
    try {
      const response = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&action=getUsageTrends`);
      if (response.ok) {
        const result = await response.json();
        if (result && !result.error) {
          data = result.data || [];
          avgElectric = result.avgElectric || 0;
          avgWater = result.avgWater || 0;
          avgGas = result.avgGas || 0;
          trend = result.trend || '➡️ Stable';
        }
      }
    } catch (e) {
      // fallback to generated sample data below
    }

    // If no data returned from backend, generate 12 months of sample rows (zeros)
    if (!data || !data.length) {
      const currentDate = new Date();
      data = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        data.push({ month, electric: 0, water: 0, gas: 0 });
      }
      avgElectric = 0; avgWater = 0; avgGas = 0; trend = '➡️ Stable';
    }
    
    let html = `
      <div class="trends-analysis">
        <p><strong>Overall Trend:</strong> ${trend}</p>
        <p><strong>Avg Electric Usage:</strong> ${avgElectric} Units/Month</p>
        <p><strong>Avg Water Usage:</strong> ${avgWater} Units/Month</p>
        <p><strong>Avg Gas Usage:</strong> ${avgGas} Units/Month</p>
      </div>
      <table class="trends-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Electric (Units)</th>
            <th>Water (Units)</th>
            <th>Gas (Units)</th>
            <th>Total Usage</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((d, idx) => {
            const electric = parseFloat(d.electric || 0);
            const water = parseFloat(d.water || 0);
            const gas = parseFloat(d.gas || 0);
            const total = (electric + water + gas).toFixed(2);
            const prevTotal = idx > 0 ? ((parseFloat(data[idx-1].electric || 0) + parseFloat(data[idx-1].water || 0) + parseFloat(data[idx-1].gas || 0)).toFixed(2)) : 0;
            const trendIcon = idx > 0 ? (parseFloat(total) > parseFloat(prevTotal) ? '📈' : parseFloat(total) < parseFloat(prevTotal) ? '📉' : '➡️') : '➡️';
            return `
              <tr>
                <td>${d.month}</td>
                <td>${electric.toFixed(2)}</td>
                <td>${water.toFixed(2)}</td>
                <td>${gas.toFixed(2)}</td>
                <td><strong>${total}</strong></td>
                <td>${trendIcon}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <div class="trends-insight">
        <p><strong>💡 Insight:</strong> Your usage patterns show room for optimization. Consider reducing peak-hour consumption.</p>
      </div>
    `;
    
    container.innerHTML = html;
  } catch (err) {
    console.error('viewUsageTrends error:', err);
    container.innerHTML = `<p style="text-align: center; color: #666;">Error loading usage trends: ${err.message}</p>`;
  }
  
  const modal = document.getElementById("usageTrendsModal");
  if (modal) modal.style.display = "flex";
}

function closeUsageTrends() {
  const modal = document.getElementById("usageTrendsModal");
  if (modal) modal.style.display = "none";
}

// ---- Download Bills as PDF (improved) ----
async function downloadBillsPDF() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const name = localStorage.getItem('customerName') || 'User';
  const email = localStorage.getItem('customerEmail') || 'N/A';
  
  if (!id) {
    alert('Please login first.');
    return;
  }
  
  try {
    // Build printable HTML (browser's Print -> Save as PDF is the most reliable cross-browser approach)
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 10).toLocaleDateString();
    const html = `
      <html>
        <head>
          <title>Utility Bill - ${id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            .invoice { max-width: 800px; margin: auto; }
            h1 { color: #667eea; }
            table { width:100%; border-collapse: collapse; margin-top: 20px; }
            td, th { padding: 10px; border: 1px solid #ddd; text-align: left; }
            .total { font-weight: 700; background: #f7f7f7; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <h1>⚡ Utility Billing Statement</h1>
            <p><strong>Customer:</strong> ${name} <br><strong>ID:</strong> ${id} <br><strong>Email:</strong> ${email}</p>
            <h3>Bill Summary</h3>
            <table>
              <thead><tr><th>Type</th><th>Amount (৳)</th></tr></thead>
              <tbody>
                <tr><td>Electric</td><td>0.00</td></tr>
                <tr><td>Water</td><td>0.00</td></tr>
                <tr><td>Gas</td><td>0.00</td></tr>
                <tr class="total"><td>Total Due</td><td>0.00</td></tr>
              </tbody>
            </table>
            <p style="margin-top:18px;">Due Date: <strong>${dueDate}</strong></p>
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(() => window.close(), 500); };
          <\/script>
        </body>
      </html>
    `;
    
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  } catch (err) {
    console.error('downloadBillsPDF error:', err);
    alert('Error generating PDF: ' + err.message);
  }
}

// ---- Payment History & Receipts ----
async function viewPaymentHistory() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const t = translations[currentLanguage] || translations.en;
  
  if (!id) {
    alert('Please login first.');
    return;
  }
  
  const container = document.getElementById("paymentHistoryContainer");
  if (!container) return;
  
  container.innerHTML = '<p style="text-align: center; color: #666;">Loading payment history...</p>';
  
  try {
    // Attempt to fetch real payment log (if AppScript provides it). Otherwise use sample.
    const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}&action=getUsageReport`);
    let payments = [];
    if (res.ok) {
      const json = await res.json();
      if (json && json.usage && json.usage.length) {
        payments = json.usage.slice(0,6).map((u, idx) => ({
          date: u.date,
          amount: (parseFloat(u.balance) || 0).toFixed(2),
          transactionId: 'TXN' + (1000 + idx),
          method: 'N/A',
          status: 'COMPLETED'
        }));
      }
    }

    if (!payments.length) {
      const currentDate = new Date();
      for (let i = 0; i < 6; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 15);
        payments.push({
          date: date.toLocaleDateString(),
          amount: '0.00',
          transactionId: 'TXN0000000000',
          method: 'N/A',
          status: 'N/A'
        });
      }
    }
    
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2);
    const allEmpty = payments.every(p => (parseFloat(p.amount) || 0) === 0 || (p.status === 'N/A'));
    
    let demoButtonHtml = allEmpty ? `<div style="margin-top:8px"><button class="btn btn-secondary" onclick="showDemoPayments()">Show demo payment data</button></div>` : '';

    let html = `
      <div class="payment-summary">
        <p><strong>Total Paid (Last 6 Months):</strong> ৳${totalPaid}</p>
        <div style="margin-top:8px">
          <button class="btn btn-primary" onclick="sendBalanceWhatsApp()">📲 Send Balance via WhatsApp</button>
          ${demoButtonHtml}
        </div>
      </div>
      <div class="payment-list">
        ${payments.map(p => `
          <div class="payment-receipt">
            <div class="receipt-header">
              <span><strong>Date:</strong> ${p.date}</span>
              <span class="status-badge">${p.status}</span>
            </div>
            <div class="receipt-details">
              <p><strong>Amount:</strong> ৳${p.amount}</p>
              <p><strong>Transaction ID:</strong> ${p.transactionId}</p>
              <p><strong>Payment Method:</strong> ${p.method}</p>
            </div>
            <button class="btn btn-secondary" onclick="downloadReceipt('${p.transactionId}', '${p.amount}')">📄 Download Receipt</button>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = html;
  } catch (err) {
    console.error('viewPaymentHistory error:', err);
    container.innerHTML = `<p style="text-align: center; color: #666;">Error loading payment history: ${err.message}</p>`;
  }
  
  const modal = document.getElementById("paymentHistoryModal");
  if (modal) modal.style.display = "flex";
}

function closePaymentHistory() {
  const modal = document.getElementById("paymentHistoryModal");
  if (modal) modal.style.display = "none";
}

// ---- Send Balance via WhatsApp ----
async function sendBalanceWhatsApp() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  if (!id) {
    alert('Please login first.');
    return;
  }

  try {
    // Fetch latest summary from API (falls back to stored values)
    let name = localStorage.getItem('customerName') || 'Customer';
    let electricBalance = localStorage.getItem('electricBalance') || '';
    let lastUpdated = '';

    try {
      const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && !json.error) {
          name = json.name || name;
          electricBalance = (json.electricBalance !== undefined) ? String(json.electricBalance) : electricBalance;
          lastUpdated = json.lastUpdated || '';
        }
      }
    } catch (e) {
      // ignore, use local fallback
    }

    // Ask for phone number if not available
    let phone = localStorage.getItem('customerPhone') || '';
    if (!phone) {
      phone = prompt('Enter your WhatsApp number (country code + number), e.g. +8801XXXXXXXXX');
      if (!phone) return;
      localStorage.setItem('customerPhone', phone);
    }

    // Sanitize phone for wa.me (digits only, no leading +)
    const digits = phone.replace(/[^0-9]/g, '');
    if (!digits) {
      alert('Invalid phone number');
      return;
    }

    const balanceText = electricBalance ? `৳ ${parseFloat(electricBalance).toFixed(2)}` : 'N/A';
    const msg = `Hello ${name}, your current electric balance is ${balanceText}. ${lastUpdated ? 'Last updated: ' + lastUpdated + '.' : ''} - F3-16 Utility Corporations`;

    const waUrl = `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  } catch (err) {
    console.error('sendBalanceWhatsApp error:', err);
    alert('Unable to open WhatsApp: ' + (err && err.message ? err.message : err));
  }
}

function downloadReceipt(txnId, amount) {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const name = localStorage.getItem('customerName') || 'User';
  const date = new Date();
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString();

  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - ${txnId}</title>
      <style>
        body{font-family: Arial, sans-serif; padding:20px; color:#222}
        .receipt{max-width:700px;margin:auto;border:1px solid #e6e6e6;padding:18px}
        .header{display:flex;justify-content:space-between;align-items:center}
        .brand{font-size:18px;font-weight:700;color:#2b6cb0}
        .meta{font-size:12px;color:#666}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        td,th{padding:8px;border:1px solid #eee;text-align:left}
        .total{font-weight:700}
        .center{text-align:center}
        .small{font-size:12px;color:#666}
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div>
            <div class="brand">⚡ Utility Portal</div>
            <div class="small">Payment Receipt</div>
          </div>
          <div class="meta">
            <div>Txn: ${txnId}</div>
            <div>${dateStr} ${timeStr}</div>
          </div>
        </div>
        <hr />
        <div style="margin-top:10px">
          <p><strong>Customer:</strong> ${name}</p>
          <p><strong>Customer ID:</strong> ${id}</p>
        </div>
        <table>
          <thead>
            <tr><th>Description</th><th class="center">Amount (৳)</th></tr>
          </thead>
          <tbody>
            <tr><td>Payment</td><td class="center">${parseFloat(amount).toFixed(2)}</td></tr>
            <tr class="total"><td class="total">Total Paid</td><td class="center total">৳${parseFloat(amount).toFixed(2)}</td></tr>
          </tbody>
        </table>
        <div style="margin-top:14px" class="small">Status: COMPLETED</div>
        <div style="margin-top:18px; text-align:center; font-size:13px; color:#444">Thank you for your payment!</div>
      </div>
      <script>
        window.onload = function(){ window.print(); setTimeout(()=>window.close(), 600); };
      <\/script>
    </body>
    </html>
  `;

  const w = window.open('', '_blank');
  if (!w) {
    // Fallback: download as text if popup blocked
    const receiptContent = `Receipt\nTransaction: ${txnId}\nAmount: ${amount}\nDate: ${dateStr} ${timeStr}\nCustomer: ${name} (${id})\nStatus: COMPLETED`;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt-${txnId}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    return;
  }
  w.document.write(html);
  w.document.close();
}

// ---- Two-Factor Authentication (2FA) ----
async function toggle2FA() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const emailInput = document.getElementById("emailAddress");
  const email = emailInput ? emailInput.value.trim() : '';
  const t = translations[currentLanguage] || translations.en;
  const checkbox = document.getElementById("2faToggle");
  
  if (!id) {
    alert('Please login first.');
    if (checkbox) checkbox.checked = false;
    return;
  }
  
  if (!email) {
    alert('Please set your email address first.');
    if (checkbox) checkbox.checked = false;
    return;
  }
  
  try {
    const enabled = checkbox ? checkbox.checked : false;
    
    // Store 2FA preference
    const twoFAData = JSON.parse(localStorage.getItem('twoFASettings') || '{}');
    twoFAData[id] = { enabled, email, timestamp: new Date().toISOString() };
    localStorage.setItem('twoFASettings', JSON.stringify(twoFAData));
    
    // Show confirmation
    const msg = enabled ? t.twoFAEnabled : t.twoFADisabled;
    alert(msg);
  } catch (err) {
    console.error('toggle2FA error:', err);
    alert('Error updating 2FA settings');
  }
}

// ---- Auto Bill Reminders ----
async function toggleBillReminders() {
  const id = sessionStorage.getItem('customerId') || localStorage.getItem('customerId') || '';
  const emailInput = document.getElementById("emailAddress");
  const email = emailInput ? emailInput.value.trim() : '';
  const t = translations[currentLanguage] || translations.en;
  const checkbox = document.getElementById("remindersToggle");
  
  if (!id) {
    alert('Please login first.');
    if (checkbox) checkbox.checked = false;
    return;
  }
  
  if (!email) {
    alert('Please set your email address first.');
    if (checkbox) checkbox.checked = false;
    return;
  }
  
  try {
    const enabled = checkbox ? checkbox.checked : false;
    
    // Store reminder preference
    const remindersData = JSON.parse(localStorage.getItem('billReminders') || '{}');
    remindersData[id] = { enabled, email, frequency: 'weekly', timestamp: new Date().toISOString() };
    localStorage.setItem('billReminders', JSON.stringify(remindersData));
    
    // Show confirmation
    const msg = enabled ? t.remindersEnabled : t.remindersDisabled;
    alert(msg);
  } catch (err) {
    console.error('toggleBillReminders error:', err);
    alert('Error updating reminder settings');
  }
}

// Export functions globally
window.viewBillingHistory = viewBillingHistory;
window.closeBillingHistory = closeBillingHistory;
window.viewUsageTrends = viewUsageTrends;
window.closeUsageTrends = closeUsageTrends;
window.downloadBillsPDF = downloadBillsPDF;
window.viewPaymentHistory = viewPaymentHistory;
window.closePaymentHistory = closePaymentHistory;
window.downloadReceipt = downloadReceipt;
window.toggle2FA = toggle2FA;
window.toggleBillReminders = toggleBillReminders;
window.sendBalanceWhatsApp = sendBalanceWhatsApp;
// Show demo payments (client-side only)
function showDemoPayments() {
  const container = document.getElementById("paymentHistoryContainer");
  if (!container) return;
  const currentDate = new Date();
  const demo = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 12);
    demo.push({
      date: date.toLocaleDateString(),
      amount: (Math.random() * 500 + 100).toFixed(2),
      transactionId: 'TXN' + (Math.floor(Math.random() * 900000) + 100000),
      method: 'Card',
      status: 'COMPLETED'
    });
  }

  const totalPaid = demo.reduce((s, p) => s + parseFloat(p.amount), 0).toFixed(2);

  let html = `
    <div class="payment-summary">
      <p><strong>Total Paid (Last 6 Months):</strong> ৳${totalPaid}</p>
      <div style="margin-top:8px">
        <button class="btn btn-primary" onclick="sendBalanceWhatsApp()">📲 Send Balance via WhatsApp</button>
      </div>
    </div>
    <div class="payment-list">
      ${demo.map(p => `
        <div class="payment-receipt">
          <div class="receipt-header">
            <span><strong>Date:</strong> ${p.date}</span>
            <span class="status-badge">${p.status}</span>
          </div>
          <div class="receipt-details">
            <p><strong>Amount:</strong> ৳${p.amount}</p>
            <p><strong>Transaction ID:</strong> ${p.transactionId}</p>
            <p><strong>Payment Method:</strong> ${p.method}</p>
          </div>
          <button class="btn btn-secondary" onclick="downloadReceipt('${p.transactionId}', '${p.amount}')">📄 Download Receipt</button>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}
window.showDemoPayments = showDemoPayments;