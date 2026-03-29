# Quick Reference: Static Dashboard

## 🚀 Getting Started (5 minutes)

### For End Users
1. Open `/dashboard-static.html` or visit GitHub Pages link
2. Enter your Customer ID
3. Click "Load Data"
4. View all utility information

### For Developers

**Requirements:**
- `data.json` file with customer data
- Modern web browser
- No backend needed!

**File Structure:**
```
root/
├── dashboard-static.html   ← Open this
├── data.json              ← Update this with customer data
└── styles.css             ← (optional) customize styling
```

---

## 📊 Features Available

| Feature | Description |
|---------|-------------|
| **Balance View** | Current electric, water, gas, internet balances |
| **Usage Trends** | 12-month historical usage with line charts |
| **Monthly Comparison** | Last 6 months side-by-side bar chart |
| **Balance History** | Transaction log with dates & descriptions |
| **Export to CSV** | Download history for Excel/Sheets |
| **Responsive** | Works on mobile, tablet, desktop |

---

## 🔄 Data Source Formats

### Basic Structure (Required)
```json
{
  "customers": [
    {
      "id": "C001",
      "name": "Customer Name",
      "flatNumber": "3A",
      "electricBalance": "1500",
      "waterBillDue": "800",
      "gasBillDue": "600",
      "internetBillDue": "1200",
      "internetConnected": "Yes",
      "lastUpdated": "2026-03-28 10:30 AM"
    }
  ]
}
```

### With History (Optional)
```json
{
  "customers": [{
    ...basic fields...,
    "history": [
      {
        "date": "2026-03-28",
        "balance": "1500",
        "description": "Balance update"
      }
    ]
  }]
}
```

### With Trends (Optional)
```json
{
  "customers": [{
    ...basic fields...,
    "usageTrends": {
      "data": [
        {"month": "Jan", "electric": 400, "water": 110, "gas": 78}
      ],
      "avgElectric": "490.25",
      "avgWater": "129.17",
      "avgGas": "89.67"
    }
  }]
}
```

---

## 🎨 Customization

### Change Colors
Edit CSS in `dashboard-static.html`:
```css
.stat-card.electric { border-left: 4px solid #YOUR_COLOR; }
.stat-card.water { border-left: 4px solid #YOUR_COLOR; }
```

### Change Title
Edit line in `dashboard-static.html`:
```html
<h1>⚡ F3-16 Utility Dashboard</h1>
```

### Add More Utilities
1. Add stat-value in HTML
2. Add chart canvas
3. Update JavaScript to display data

---

## 🚢 Deployment

### GitHub Pages
1. Enable in repository settings
2. Select `main` branch as source
3. Access at `https://username.github.io/repo-name/dashboard-static.html`

### Self-Hosted
1. Copy `dashboard-static.html` and `data.json`
2. Upload to any web server
3. Access at your domain

### Local Development
```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Or use any other server (Node, Ruby, PHP, etc.)
```

---

## 🔌 Integration with Apps Script

### Export Data
```javascript
// In Apps Script console
var data = exportDashboardDataAsJSON();
copy(JSON.stringify(data));
```

### Get Export URL
```
https://your-deployment.scripts.googleusercontent.com/macros/d/YOUR_ID/usercontent?action=export
```

### Save to data.json
```bash
curl "YOUR_URL?action=export" > data.json
```

---

## ❌ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Customer not found" | Check Customer ID spelling in data.json |
| Charts empty | Verify `usageTrends.data` exists in data.json |
| Page blank | Check browser console (F12) for errors |
| No history | Ensure `history` array in data.json |
| Slow loading | data.json too large? Compress or split customers |

---

## 💾 Data.json Management

### Auto-Update (GitHub Actions)
1. Create GitHub secret: `APPS_SCRIPT_EXPORT_URL`
2. Use workflow: `.github/workflows/export-utility-data.yml`
3. Automatically exports daily at 2 AM UTC

### Manual Update
```bash
# Get data from Apps Script
curl "YOUR_URL?action=export" > data.json

# Commit to repo
git add data.json
git commit -m "Update utility data"
git push
```

### Backup Data
```bash
# Create timestamped backup
cp data.json "data_$(date +%Y%m%d_%H%M%S).json"
```

---

## 📱 Mobile Optimization

- Responsive grid layout ✅
- Touch-friendly buttons ✅
- Readable on 4" screens ✅
- No backend calls ✅

Test on mobile:
```bash
# Use Chrome DevTools (F12) → Device Toolbar
# Or use phone to access live URL
```

---

## 🔒 Security & Privacy

- ✅ No data sent to servers
- ✅ All processing client-side
- ✅ HTTPS recommended for GitHub Pages
- ✅ Customer IDs visible in URL (consider usage context)
- ✅ No authentication required

---

## 📚 Full Docs

- [Static Dashboard Guide](STATIC_DASHBOARD_GUIDE.md)
- [Backend Setup](DEPLOY_AND_DIAGNOSE.md)
- [Master Documentation](MASTER_GUIDE.md)

---

**Last Updated**: 2026-03-29
