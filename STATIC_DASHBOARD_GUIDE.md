# Static Dashboard Setup Guide

## Overview
The static dashboard is a GitHub-friendly read-only viewer that works with data exported from Google Sheets. It requires no backend infrastructure and can be hosted on GitHub Pages.

## Features
- ✅ View customer utility data
- ✅ Display usage trends & charts
- ✅ Generate reports
- ✅ Export history as CSV
- ✅ Responsive design
- ✅ No authentication required

## Files

### `dashboard-static.html`
Main dashboard viewer. Access with customer data via `data.json`.

### `data.json`
Customer data file. Updated by exporting from Google Sheets.

### Sample Data Structure
```json
{
  "customers": [
    {
      "id": "C001",
      "name": "Customer Name",
      "flatNumber": "3A",
      "electricBalance": "1500",
      "waterBillDue": "800",
      "history": [/* array of transactions */],
      "usageTrends": {/* trend data */},
      "monthlyComparison": {/* comparison data */}
    }
  ],
  "lastExported": "2026-03-28",
  "metadata": {}
}
```

## Setup Instructions

### Step 1: Deploy Apps Script Export Function
1. In Google Apps Script console, add the export function (already added to `Code.gs`)
2. Deploy as Web App
3. Note the deployment URL

### Step 2: Generate data.json
Use the web app endpoint to fetch data:
```
https://your-deployment-url/usercontent.googleusercontent.com/...?action=export
```

Save the response as `data.json` in the root directory.

### Step 3: Host on GitHub Pages
1. Enable GitHub Pages in repository settings
2. Choose `main` branch as source
3. Files are automatically served at `https://yourusername.github.io/repo-name/`

### Step 4: Access Dashboard
Open: `https://yourusername.github.io/repo-name/dashboard-static.html`

## Usage

### Load Customer Data
1. Open `dashboard-static.html`
2. Enter a Customer ID
3. Click "Load Data"
4. View all dashboards and charts

### Export Report
Click "📥 Export to CSV" to download balance history as CSV file.

## Updating Data

### Manual Update
1. Run the export in Apps Script: `exportDashboardDataAsJSON()`
2. Copy JSON response
3. Update `data.json` file in repo

### Automated Update (CI/CD)
Create a GitHub Action to automatically export data daily:

```yaml
name: Export Utility Data
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Fetch data from Apps Script
        run: |
          curl -s "YOUR_DEPLOYMENT_URL?action=export" > data.json
      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "action@github.com"
          git add data.json
          git commit -m "Update utility data" || echo "No changes"
          git push
```

## Features Detail

### Usage Trends
Displays 12-month historical data with charts for:
- Electric consumption (kWh)
- Water usage (units)
- Gas usage (units)

### Monthly Comparison
Shows last 6 months side-by-side comparison with totals.

### Balance History
Complete transaction log with dates and descriptions.

### Export to CSV
Downloads balance history as Excel-compatible CSV file.

## Data Format

Each customer must include:
```javascript
{
  id: "CustomerID",
  name: "Full Name",
  flatNumber: "Unit Number",
  electricBalance: "Current balance in Taka",
  waterBillDue: "Amount due",
  gasBillDue: "Amount due",
  internetBillDue: "Amount due",
  internetConnected: "Yes/No",
  lastUpdated: "Date string",
  history: [
    {date: "string", balance: "amount", description: "string"}
  ],
  usageTrends: {
    data: [{month, electric, water, gas}],
    avgElectric: "number",
    avgWater: "number",
    avgGas: "number",
    trend: "📈 Increasing or 📉 Decreasing"
  },
  monthlyComparison: {
    months: [{month, electric, water, gas, total}]
  }
}
```

## Troubleshooting

**"Customer not found"** → Check Customer ID spelling in data.json

**Charts not showing** → Ensure data.json is in valid JSON format

**No history data** → History array is empty in data.json

## Security Notes
- This is a read-only viewer
- No sensitive data transmission
- Customer IDs visible in URL (consider access control if needed)
- All data is client-side visible

## Browser Compatibility
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- IE: ❌ (use modern browser)

---

For backend features (form submission, payments, email), see `APPSCRIPT_COMPLETE.gs`
