# Utility Dashboard (Local Development)

Quick start to test the dashboard locally and the premium features (Billing History, Usage Trends, Payment History & Receipts, Monthly Comparison).

Run a simple static server from the project root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/index.html in your browser
```

Notes:
- The UI has offline fallbacks: if the Google Apps Script backend is unreachable the pages will show generated sample data so you can test modals and downloads.
- `Download Receipt` opens a printable receipt in a new tab and triggers the browser Print dialog (Save as PDF).
- `Download PDF` for bills uses the same Print -> Save as PDF approach.

Endpoints:
- Live data requires the Apps Script web app configured in `API_BASE` inside `script.js`.

If you want, I can:
- Add a local JSON mock and point the fetch calls to it for an offline demo, or
- Run a quick browser smoke-test (I can start the local server and keep it running).
