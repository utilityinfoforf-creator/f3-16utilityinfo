# Complete Setup Guide - Utility Dashboard with Real Data

## 📦 What You Now Have

### Files Created:
1. **APPSCRIPT_COMPLETE.gs** - Full AppScript with all features
2. **APPSCRIPT_SETUP_GUIDE.md** - Step-by-step deployment guide
3. **script.js** (UPDATED) - Frontend now fetches real data from AppScript
4. **index.html** - Already has all UI components
5. **styles.css** - Already has all styling

---

## 🎯 Quick Start (5 Minutes)

### ✅ Step 1: Copy AppScript Code
1. Go to your Google Sheet
2. Click **Extensions → Apps Script**
3. Delete existing code
4. **Copy the entire code from `APPSCRIPT_COMPLETE.gs`**
5. Save (Ctrl+S)

### ✅ Step 2: Initialize Sheets
1. At the top, select **`initializeSpreadsheet`** from the function dropdown
2. Click **▶ Run**
3. Authorize permissions
4. See "✅ All sheets initialized" in logs

### ✅ Step 3: Deploy as Web App
1. Click **Deploy → New deployment**
2. Select type: **Web app**
3. "Execute as": Your email
4. "Who has access": **Anyone, even anonymous**
5. Click **Deploy**
6. **Copy the URL** (important!)

### ✅ Step 4: Update Your Dashboard
In your HTML file location, update `script.js` line 3:

```javascript
const API_BASE = "PASTE_YOUR_DEPLOYMENT_URL_HERE";
```

Example:
```javascript
const API_BASE = "https://script.google.com/macros/s/AKfycbz...../exec";
```

### ✅ Step 5: Add Test Data
Go to Google Sheet and add data to **DashboardData** sheet:

| CustomerID | Name | ElectricBalance | WaterBillDue | GasBillDue | LastUpdated | FlatNumber | InternetConnected | InternetBillDue |
|---|---|---|---|---|---|---|---|---|
| TEST001 | John Doe | 500 | 200 | 100 | 2026-01-22 | F-101 | Yes | 0 |

Also add to **FlatLookup** sheet:

| CustomerID | FlatNumber |
|---|---|
| TEST001 | F-101 |

---

## ✨ Features Now Live

### 1. 🔐 Login System
- Uses CustomerID from DashboardData
- Shows all customer details
- Stores session data

### 2. 📊 Notifications & Alerts
- Shows balance status
- Service status updates
- Payment confirmations

### 3. 📑 Export Usage Report
- **Fetches real data** from BalanceHistory sheet
- Downloads as CSV file
- Includes all balance changes

### 4. 🖨️ Print Bills
- Professional invoice format
- Includes customer details
- Print-ready HTML

### 5. 📈 Monthly Comparison
- **Fetches real data** from BalanceHistory sheet
- Shows last 6 months
- Calculates trends (📈 up, 📉 down, ➡️ stable)

### 6. 💌 Email Notifications
- Auto-sends balance updates (when subscribed)
- Sends payment confirmations
- Email verification codes

### 7. 📋 Update History
- Tracks all balance changes
- Shows date and description
- Modal view with details

---

## 🔍 Testing Your Setup

### Test 1: Login
1. Open your dashboard
2. Enter: `TEST001`
3. Click Login
4. You should see John Doe's details

### Test 2: Export Report
1. After login, click "📑 Export Usage Report"
2. Should download `usage-report-TEST001-2026-01-22.csv`
3. Open CSV - shows your usage history

### Test 3: Monthly Comparison
1. After login, click "📊 Monthly Comparison"
2. Modal opens with 6-month table
3. Shows electric, water, gas usage
4. Shows trend arrows

### Test 4: Payment Confirmation
1. Go to Payment page
2. Enter any transaction ID
3. Click Submit
4. Should see success message
5. Check PaymentLog sheet

---

## 📁 AppScript Auto-Creates These Sheets

- ✅ **DashboardData** - Customer info (you create manually)
- ✅ **FlatLookup** - Customer-Flat mapping (you create manually)
- ✅ **BalanceHistory** - Balance changes (auto-created)
- ✅ **Subscriptions** - Email subscribers (auto-created)
- ✅ **EmailVerification** - 2FA codes (auto-created)
- ✅ **PaymentLog** - Payment history (auto-created)

---

## 🔗 API Endpoints Now Available

Your AppScript supports these queries:

```
✅ GET ?id=CUST001
   Returns: customer dashboard data

✅ GET ?id=CUST001&history=true
   Returns: all balance history records

✅ GET ?id=CUST001&action=getUsageReport
   Returns: usage data for CSV export

✅ GET ?id=CUST001&action=getMonthlyComparison
   Returns: last 6 months of usage

✅ GET ?id=CUST001&subscribe=true&email=user@email.com
   Updates: email subscription status

✅ POST with action=submitTransaction
   Logs: payment confirmation
```

---

## ⚙️ How Real Data Flows

### For Export Report:
1. User clicks "📑 Export Usage Report"
2. Frontend calls: `API_BASE?id=CUST001&action=getUsageReport`
3. AppScript queries **BalanceHistory** sheet
4. Returns all balance records for that customer
5. Frontend converts to CSV
6. User downloads file

### For Monthly Comparison:
1. User clicks "📊 Monthly Comparison"
2. Frontend calls: `API_BASE?id=CUST001&action=getMonthlyComparison`
3. AppScript queries **BalanceHistory** sheet
4. Groups by month, calculates totals
5. Returns last 6 months
6. Frontend displays in table with trends

---

## 🚨 Common Issues & Fixes

### "Customer not found"
- ✅ Check CustomerID in DashboardData sheet
- ✅ Ensure exact match (case-sensitive)
- ✅ No extra spaces

### Export Report is empty
- ✅ Update a balance first (triggers history log)
- ✅ Check BalanceHistory sheet exists
- ✅ Check CustomerID matches exactly

### Monthly Comparison shows no data
- ✅ Need at least 1 balance update
- ✅ Updates create history records
- ✅ History shows up in comparison after first update

### Deployment URL not working
- ✅ Re-deploy after code changes
- ✅ Use "New deployment" not "Update"
- ✅ Copy full URL including `/exec`

### Emails not sending
- ✅ Enable Gmail API in Apps Script
- ✅ Check recipient email is correct
- ✅ Check spam folder

---

## 📝 Next Steps

1. ✅ Deploy AppScript code
2. ✅ Run `initializeSpreadsheet` function
3. ✅ Get deployment URL
4. ✅ Update API_BASE in script.js
5. ✅ Add test customer data
6. ✅ Test each feature
7. ✅ Add more customers as needed

---

## 🎉 You're All Set!

Everything is now connected and working with **real data** from your Google Sheet!

- ✅ Auto-creates sheets
- ✅ Fetches real customer data
- ✅ Exports real usage reports
- ✅ Shows real monthly trends
- ✅ Sends real emails
- ✅ Logs all transactions

**Start testing now!** 🚀
