# F3-16 Utility Dashboard

**Production Dashboard**: [View Dashboard](https://f3-16utilityinfo.github.io/dashboard-static.html)

## 🏢 Project Overview
A comprehensive utility management system for apartment buildings with real-time balance tracking, usage analytics, and payment processing.

## 📊 Features

### Backend (Google Apps Script)
- **Form Submission**: Automated data collection from Google Forms
- **Payment Processing**: Transaction tracking and confirmation emails
- **Email Notifications**: Real-time balance updates to subscribers
- **Email Verification**: Secure subscription management
- **Data Export**: JSON export for static dashboard
- **Analytics**: Usage trends and monthly comparisons

### Frontend (Static Dashboard)
- **View Balances**: Electric, water, gas, and internet bills
- **Usage Analytics**: 12-month trends and comparisons
- **Export Reports**: Download history as CSV
- **Responsive Design**: Works on desktop, tablet, mobile
- **Zero Configuration**: Just host on GitHub Pages

## 🚀 Quick Start

### For Users
1. Go to [Live Dashboard](https://f3-16utilityinfo.github.io/dashboard-static.html)
2. Enter your Customer ID
3. Click "Load Data"
4. View your utility information

### For Developers

**Static Dashboard Only:**
```bash
# Clone repository
git clone https://github.com/yourusername/f3-16utilityinfo.git

# Open dashboard
open dashboard-static.html
```

**Full Setup with Backend:**
See [Deployment Guide](DEPLOY_AND_DIAGNOSE.md)

## 📁 Repository Structure

```
├── dashboard-static.html      # Main viewer (static)
├── data.json                  # Customer data (auto-updated)
├── apps-script/               # Google Apps Script backend
│   ├── Code.gs               # Main backend logic
│   └── READ_ONLY_HELPERS.gs  # Utility functions
├── STATIC_DASHBOARD_GUIDE.md # Setup instructions
├── DEPLOY_AND_DIAGNOSE.md    # Backend deployment
└── README.md                 # This file
```

## 🔄 Data Flow

```
Google Sheets (Master Data)
    ↓
Google Apps Script (Processing)
    ↓
?action=export (JSON endpoint)
    ↓
data.json (Static file)
    ↓
dashboard-static.html (Client-side display)
```

## ⚙️ Configuration

### Auto-Export Setup
Configure a GitHub Action to auto-export data daily:

1. Create `.github/workflows/export-data.yml`
2. Add your Apps Script deployment URL
3. Push to repository

See [STATIC_DASHBOARD_GUIDE.md](STATIC_DASHBOARD_GUIDE.md#automated-update-cicd) for full setup.

## 🔐 Security

- **Backend**: Protected by optional API key
- **Frontend**: Read-only, no data transmission
- **Email**: Verified with one-time codes
- **Data**: Stored only in Google Sheets

## 📱 Supported Utilities
- ⚡ Electric balance & usage
- 💧 Water bills & usage
- 🔥 Gas bills & usage
- 🌐 Internet connectivity & bills

## 🛠️ Tech Stack

**Backend:**
- Google Apps Script
- Google Sheets
- Gmail API

**Frontend:**
- HTML5
- CSS3
- JavaScript (Vanilla)
- Chart.js (Charts)

**Hosting:**
- GitHub Pages (Static files)
- Google Cloud (Backend)

## 📖 Documentation

- [Static Dashboard Guide](STATIC_DASHBOARD_GUIDE.md) - Setup & usage
- [Deployment Guide](DEPLOY_AND_DIAGNOSE.md) - Backend deployment
- [Features Summary](FEATURES_SUMMARY.txt) - Complete feature list
- [Master Guide](MASTER_GUIDE.md) - In-depth documentation

## 💡 Usage Examples

### View Customer Data
```bash
curl "https://your-app.herokuapp.com?id=C001"
```

### Export All Data
```bash
curl "https://your-app.herokuapp.com?action=export" > data.json
```

### Submit Payment
```bash
curl -X POST "https://your-app.herokuapp.com" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "submitTransaction",
    "customerId": "C001",
    "transaction": "TXN123456"
  }'
```

## 🐛 Troubleshooting

**Dashboard not loading?**
- Check that `data.json` exists
- Verify Customer ID is correct
- Check browser console for errors

**Data not updating?**
- Run export in Apps Script
- Check GitHub Pages build status
- Verify GitHub Action is enabled

**No charts showing?**
- Ensure usage data exists in sheets
- Check data.json format
- Try refreshing page

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Commit: `git commit -m "Add feature"`
4. Push and open a PR

## 📞 Support

For issues or questions:
- Check documentation first
- Review existing GitHub Issues
- Create new Issue with details

## 📄 License

This project is maintained by F3-16 Utility Corporations.

---

**Last Updated**: 2026-03-29
**Status**: Production Ready ✅
