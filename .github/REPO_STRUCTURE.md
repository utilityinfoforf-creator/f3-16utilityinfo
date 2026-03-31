# Repository Structure

## 📁 Project Layout

### Frontend (Client-side)
```
pages/
├── main/
│   └── index.html                 # Main login & dashboard page
├── analytics/
│   ├── billing-history.html       # Billing history page
│   ├── payment-history.html       # Payment history page
│   ├── usage-trends.html          # 12-month usage trends
│   └── usage-report.html          # Monthly comparison report
└── other/
    ├── about.html                 # About & updates page
    ├── connection.html            # Connection settings
    ├── form.html                  # Utility form submission
    ├── login.html                 # Login page
    ├── meter.html                 # Meter readings page
    ├── payment.html               # Payment processing UI
    └── dashboard-static.html      # Static GitHub Pages dashboard
```

### Backend (Apps Script)
```
apps-script/
└── Code.gs                # Complete Google Apps Script backend
```

### Assets (CSS, JS, Data)
```
assets/
├── styles.css             # Global CSS styling
├── script.js              # Frontend JavaScript logic
├── articles.json          # Article data for About page
└── data.json              # Static data for GitHub dashboard
```

### Configuration
```
config/
├── .clasp.json            # Clasp (Apps Script CLI) config
├── _config.yml            # GitHub Pages configuration
├── CNAME                  # Domain configuration
└── package.json           # Dependencies
```

### Documentation
```
docs/
├── README.md              # Quick start guide
├── MASTER_GUIDE.md        # Complete implementation guide
├── ARCHITECTURE_OVERVIEW.md # System architecture & diagrams
├── FEATURES_SUMMARY.txt   # Feature list
├── IMPLEMENTATION_SUMMARY.md # Implementation details
├── QUICK_REFERENCE.md     # Quick answers & troubleshooting
└── STATIC_DASHBOARD_GUIDE.md # Static dashboard setup guide
```

### GitHub Actions
```
.github/
└── workflows/             # Auto-export automation (optional)
```

## 🚀 Key Files

| File | Purpose |
|------|---------|
| `pages/main/index.html` | Primary user interface |
| `apps-script/Code.gs` | Backend server (Google Apps Script) |
| `assets/data.json` | Static data snapshot |
| `assets/script.js` | All frontend logic |
| `assets/styles.css` | UI styling |

## 📖 Start Here

1. **Setup**: See `docs/MASTER_GUIDE.md`
2. **Quick answers**: Check `docs/QUICK_REFERENCE.md`
3. **Architecture**: Read `docs/ARCHITECTURE_OVERVIEW.md`
4. **Deploy**: Use `config/.clasp.json` + `apps-script/Code.gs`

## ✅ What Was Kept

- All HTML pages (full UI)
- Frontend logic & styling
- Complete Apps Script code
- Essential documentation
- Configuration files
- Static dashboard backup
- Article data for About page

## ❌ What Was Deleted

- `APPSCRIPT_COMPLETE.gs` (duplicate)
- `script-premium-features.js` (old, unused)
- `styles.css.backup` (backup)
- `upgrade file .txt` (junk)
- `workspace-problems.txt` (junk)
- Redundant deployment docs

