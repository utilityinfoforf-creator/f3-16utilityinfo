Deployment and diagnostics quick guide

1) Ensure Script Properties are set (Apps Script → Project Settings → Script properties):
   - `SPREADSHEET_ID` : The ID of the Google Sheet the app should use (preferred).
   - `API_KEY` : (optional) API key used by the frontend for POST requests.
   - `PAYMENT_NOTIFICATION_EMAIL` : email to receive payment notifications.
   - `WEB_APP_VERSION` : a human-friendly version string.

2) Deploy web app (Apps Script Editor → Deploy → New deployment):
   - Select "Web app".
   - Execute as: Me
   - Who has access: Anyone (or appropriate domain setting).
   - Copy the deployment URL and update `API_BASE` in `script.js`.

3) Quick tests (replace <WEB_APP_URL> and <API_KEY>):
```bash
# version
curl -s '<WEB_APP_URL>?action=getVersion' | jq

# diagnose (returns safe script properties and sheet names)
curl -s '<WEB_APP_URL>?action=diagnose' | jq

# seed sample data (dev only)
curl -s '<WEB_APP_URL>?action=seedSample' | jq

# fetch customer
curl -s '<WEB_APP_URL>?id=CUST001' | jq

# submit transaction (POST) - include API key if configured
curl -s -X POST '<WEB_APP_URL>' \
  -H 'Content-Type: application/json' \
  -d '{"action":"submitTransaction","customerId":"CUST001","transaction":"TXN1234","apiKey":"<API_KEY>"}' | jq
```

4) Triggers and Forms
   - If using Google Forms to write to the spreadsheet, ensure the form is linked to the correct spreadsheet and that an installable trigger `onFormSubmit` exists (Apps Script → Triggers → Add Trigger). Set the function to `onFormSubmit` and event to "From spreadsheet - On form submit".

5) Frontend
   - Update `API_BASE` in `script.js` to the deployed web app URL.
   - If you use `API_KEY`, set the exact same value in Script Properties `API_KEY`.

6) If emails are not being sent
   - Open Apps Script Editor → Executions (or View → Logs) and inspect recent runs for MailApp errors (authorization, quota, invalid recipient).
   - Ensure the script has the mail scope (appsscript.json already includes mail scope).

If you want, I can update `API_BASE` in `script.js` for you if you paste the deployed web app URL and the frontend API key (if used).
