# AppScript Setup Guide - Complete

## 📋 What's Included in This Script

This complete AppScript handles:
- ✅ Auto-creates all required sheets
- ✅ Customer login & dashboard data
- ✅ Form submissions (updates DashboardData)
- ✅ Payment confirmation & logging
- ✅ Email notifications & subscriptions
- ✅ Update history tracking
- ✅ **NEW**: Usage Report export
- ✅ **NEW**: Monthly comparison analytics
- ✅ Email verification

---

## 🚀 Step-by-Step Setup

### Step 1: Copy This Script to Your Google Sheet

1. Go to your Google Sheet
2. Click **Extensions → Apps Script**
3. Delete all existing code
4. Paste the complete code from `APPSCRIPT_COMPLETE.gs`
5. Save the project

### Step 2: Run Initialization Function (First Time Only)

1. In the Apps Script editor, select function dropdown (top)
2. Choose `initializeSpreadsheet`
3. Click **▶ Run**
4. Click **Review Permissions** and authorize
5. Wait for success message in the logs

**This will auto-create:**
- ✅ DashboardData (with headers)
- ✅ FlatLookup (with headers)
- ✅ BalanceHistory (auto-created when needed)
- ✅ Subscriptions (auto-created when needed)
- ✅ EmailVerification (auto-created when needed)
- ✅ PaymentLog (auto-created when needed)

### Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Select type: **Web app**
3. Set "Execute as": **Your email address**
4. Set "Who has access": **Anyone, even anonymous**
5. Click **Deploy**
6. Copy the **Deployment URL** (you'll need this)

### Step 4: Update Your HTML File

In `script.js`, update the API endpoint:

```javascript
const API_BASE = "YOUR_DEPLOYMENT_URL_HERE";
```

Replace `YOUR_DEPLOYMENT_URL_HERE` with the URL from Step 3.

### Step 5: Add Sample Data (Manual)

Open your Google Sheet and manually add 1-2 customer rows to **DashboardData**:

| CustomerID | Name | ElectricBalance | WaterBillDue | GasBillDue | LastUpdated | FlatNumber | InternetConnected | InternetBillDue |
|---|---|---|---|---|---|---|---|---|
| CUST001 | John Doe | 500 | 200 | 150 | 2026-01-22 | F-101 | Yes | 0 |
| CUST002 | Jane Smith | 1200 | 300 | 200 | 2026-01-22 | F-102 | No | 500 |

Also add to **FlatLookup**:

| CustomerID | FlatNumber |
|---|---|
| CUST001 | F-101 |
| CUST002 | F-102 |

---

## ✅ New Features Now Working

### 📑 Export Usage Report
- Fetches all balance history for customer
- Returns CSV with real data
- Downloads automatically

### 📊 Monthly Comparison
- Gets last 6 months of usage
- Calculates trends (up/down)
- Shows electric, water, gas breakdown

### 🔔 Notifications & Alerts
- Auto-sends balance update emails (if subscribed)
- Logs all transactions
- Tracks all balance changes

---

## 🔍 Testing

### Test Login
```
Customer ID: CUST001
```

### Test Export Report
Click "📑 Export Usage Report" → Downloads CSV

### Test Monthly Comparison
Click "📊 Monthly Comparison" → Shows 6-month analysis

### Test Payment
1. Make payment (any transaction ID)
2. Check PaymentLog sheet for entry
3. Check email inbox for confirmation

---

## 📝 Automatic Sheets Created

| Sheet Name | Purpose | Auto-Created |
|---|---|---|
| DashboardData | Main customer data | Manual (use step 2) |
| FlatLookup | Customer ↔ Flat mapping | Manual (use step 2) |
| BalanceHistory | Balance change tracking | Auto (first update) |
| Subscriptions | Email subscriptions | Auto (first toggle) |
| EmailVerification | 2FA codes | Auto (first request) |
| PaymentLog | Payment history | Auto (first payment) |

---

## 🐛 Troubleshooting

### "Customer not found"
- Ensure CustomerID is in DashboardData
- Check for extra spaces or wrong formatting
- Make sure both DashboardData and FlatLookup exist

### Export Report is empty
- Customer must have history records
- Try updating a balance first
- Check BalanceHistory sheet has data

### Emails not sending
- Enable Gmail API in Apps Script
- Check email address is correct
- Ensure account has send email permission

### Monthly Comparison shows no data
- Need at least 1 balance update logged
- Data appears after first form submission
- BalanceHistory sheet must have entries

---

## 🔗 API Endpoints

Your Web App now supports:

```
GET ?id=CUST001
→ Returns customer dashboard data

GET ?id=CUST001&history=true
→ Returns balance history

GET ?id=CUST001&action=getUsageReport
→ Returns usage report data

GET ?id=CUST001&action=getMonthlyComparison
→ Returns 6-month comparison

POST with action=submitTransaction
→ Logs payment confirmation

GET ?id=CUST001&subscribe=true&email=test@example.com
→ Subscribe to email updates
```

---

## ✨ You're All Set!

Everything is now:
- ✅ Auto-configured
- ✅ Auto-creates sheets
- ✅ Handles all new features
- ✅ Sends emails automatically
- ✅ Tracks all data

**Just deploy and test!** 🎉
