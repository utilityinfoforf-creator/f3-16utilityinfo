# 🚀 Quick Reference - Deployment Checklist

## Copy-Paste Ready Commands

### Step 1: Copy AppScript Code
**File to copy:** `APPSCRIPT_COMPLETE.gs`

Go to: Google Sheet → Extensions → Apps Script
Delete all code, paste the entire content of APPSCRIPT_COMPLETE.gs

### Step 2: Initialize (One Time Only)
In Apps Script editor:
1. Select function dropdown → `initializeSpreadsheet`
2. Click ▶ Run
3. Authorize permissions
4. Wait for success message

### Step 3: Deploy
1. Click: **Deploy → New deployment**
2. Type: Select **Web app**
3. Execute as: **Your email**
4. Access: **Anyone, even anonymous**
5. Click **Deploy**
6. **COPY THE URL** (you'll need this!)

**URL Format:**
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Step 4: Update Dashboard
In `script.js` line ~3, change:
```javascript
const API_BASE = "https://script.google.com/macros/s/AKfycbzUQeJKLBRCjQG928fnIdJ7Tlg-JR0072ENK-K2_07NBOxWsH9zs0qd5CrcoQW_Mbz3lA/exec";
```

To:
```javascript
const API_BASE = "YOUR_DEPLOYMENT_URL_HERE";
```

---

## 📊 Data Setup

### Google Sheet - Sheet 1: DashboardData
Add header row (auto-created by script):
```
CustomerID | Name | ElectricBalance | WaterBillDue | GasBillDue | LastUpdated | FlatNumber | InternetConnected | InternetBillDue
```

Add sample data:
```
TEST001 | John Doe | 500 | 200 | 100 | 2026-01-22 | F-101 | Yes | 0
```

### Google Sheet - Sheet 2: FlatLookup
Add header row:
```
CustomerID | FlatNumber
```

Add sample data:
```
TEST001 | F-101
```

---

## ✅ Testing Checklist

- [ ] AppScript deployed
- [ ] Deployment URL copied
- [ ] API_BASE updated in script.js
- [ ] Test data added to Google Sheet
- [ ] Dashboard loads without errors
- [ ] Can login with TEST001
- [ ] Export Report downloads CSV
- [ ] Monthly Comparison shows data
- [ ] Print Bills opens new window

---

## 🎯 File Locations

| File | Location | Purpose |
|---|---|---|
| AppScript Code | APPSCRIPT_COMPLETE.gs | Server-side logic |
| Setup Guide | APPSCRIPT_SETUP_GUIDE.md | Deployment steps |
| Complete Guide | COMPLETE_SETUP_GUIDE.md | Full walkthrough |
| Implementation | IMPLEMENTATION_SUMMARY.md | What's included |
| This File | QUICK_REFERENCE.md | Quick checklist |
| Dashboard | index.html | User interface |
| JavaScript | script.js | Frontend logic |
| Styling | styles.css | Design |

---

## 🔄 API Endpoints Available

After deployment, these URLs work:

```
Login:
GET ?id=TEST001
Returns: Customer data

History:
GET ?id=TEST001&history=true
Returns: Update history

Usage Report:
GET ?id=TEST001&action=getUsageReport
Returns: Usage data for CSV export

Comparison:
GET ?id=TEST001&action=getMonthlyComparison
Returns: 6-month usage comparison

Email Subscribe:
GET ?id=TEST001&subscribe=true&email=user@email.com
Updates: Subscription status

Payment:
POST with action=submitTransaction
Logs: Payment confirmation
```

---

## 🛠️ Troubleshooting

**Issue: "Customer not found"**
- ✅ Add TEST001 to DashboardData sheet
- ✅ Check spelling (case-sensitive)
- ✅ No extra spaces

**Issue: Export/Comparison empty**
- ✅ Update a balance first (creates history)
- ✅ Run initialization function again

**Issue: Deployment URL not working**
- ✅ Use complete URL with `/exec` at end
- ✅ Re-deploy if code changed

**Issue: Features not updating**
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Clear browser cache
- ✅ Check console for errors (F12)

---

## 📝 After Deployment

Your system now has:

✅ **Automatic Data Handling**
- Real-time customer data fetching
- Automatic history tracking
- Email notifications

✅ **Real Reports & Analytics**
- Usage reports from actual history
- Monthly comparisons from real data
- Downloadable CSV exports

✅ **Complete Features**
- 🔐 Secure login
- 📊 Dashboard analytics
- 💌 Email subscriptions
- 🖨️ Invoice printing
- 📋 History tracking
- 💳 Payment logging

---

## 🎉 Next: Add More Customers

Once deployed, add more customers to **DashboardData** sheet:

```
CUST002 | Jane Smith | 1200 | 300 | 150 | 2026-01-22 | F-102 | No | 500
CUST003 | Bob Johnson | 800 | 250 | 120 | 2026-01-22 | F-103 | Yes | 0
```

Also add to **FlatLookup**:

```
CUST002 | F-102
CUST003 | F-103
```

Then test login with each customer ID!

---

## ⚡ Performance Tips

1. **Reduce API calls:** Cache data in localStorage
2. **Faster exports:** Add more history rows upfront
3. **Better analytics:** Update balances regularly
4. **Email speed:** Increase Apps Script timeout to 6 minutes

---

## 🚀 You're Ready!

Everything is set up and connected. Just:

1. Deploy AppScript ✅
2. Add test data ✅
3. Update API URL ✅
4. Test features ✅
5. Add real customers ✅

**Happy deploying!** 🎊
