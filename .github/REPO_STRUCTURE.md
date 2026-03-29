# Repository Structure

## 📁 Project Layout

### Frontend (Client-side)
```
├── index.html                 # Main login & dashboard page
├── form.html                  # Utility form submission
├── payment.html               # Payment processing UI
├── connection.html            # Connection settings
├── login.html                 # Login page
├── meter.html                 # Meter readings page
├── speedtest.html             # Speed test page
├── terms.html                 # Terms & conditions
├── dashboard-static.html      # Static GitHub Pages dashboard
├── script.js                  # Frontend JavaScript logic
└── styles.css                 # Global CSS styling
```

### Backend (Apps Script)
```
└── apps-script/
    └── Code.gs                # Complete Google Apps Script backend
```

### Data & Configuration
```
├── data.json                  # Static data for GitHub dashboard
├── _config.yml                # GitHub Pages configuration
├── CNAME                       # Domain configuration
├── package.json               # Dependencies
└── .clasp.json                # Clasp (Apps Script CLI) config
```

### Documentation
```
├── README.md                  # Quick start guide
├── MASTER_GUIDE.md            # Complete implementation guide
├── ARCHITECTURE_OVERVIEW.md   # System architecture & diagrams
├── FEATURES_SUMMARY.txt       # Feature list
├── IMPLEMENTATION_SUMMARY.md  # Implementation details
├── QUICK_REFERENCE.md         # Quick answers & troubleshooting
└── STATIC_DASHBOARD_GUIDE.md  # Static dashboard setup guide
```

### GitHub Actions
```
└── .github/
    └── workflows/             # Auto-export automation (optional)
```

## 🚀 Key Files

| File | Purpose |
|------|---------|
| `index.html` | Primary user interface |
| `apps-script/Code.gs` | Backend server (Google Apps Script) |
| `data.json` | Static data snapshot |
| `dashboard-static.html` | Low-dependency viewer |
| `script.js` | All frontend logic |
| `styles.css` | UI styling |

## 📖 Start Here

1. **Setup**: See `MASTER_GUIDE.md`
2. **Quick answers**: Check `QUICK_REFERENCE.md`
3. **Architecture**: Read `ARCHITECTURE_OVERVIEW.md`
4. **Deploy**: Use `.clasp.json` + `Code.gs`

## ✅ What Was Kept

- All HTML pages (full UI)
- Frontend logic & styling
- Complete Apps Script code
- Essential documentation
- Configuration files
- Static dashboard backup

## ❌ What Was Deleted

- `APPSCRIPT_COMPLETE.gs` (duplicate)
- `script-premium-features.js` (old, unused)
- `styles.css.backup` (backup)
- `upgrade file .txt` (junk)
- `workspace-problems.txt` (junk)
- Redundant deployment docs
