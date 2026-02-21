/**
 * Read-only Apps Script helpers (safe to store in GitHub).
 * This file intentionally excludes any MailApp calls or functions that
 * perform write operations to avoid storing secrets or triggering side-effects.
 *
 * Paste this into your Apps Script project or keep in the repo for reference.
 */

/** Return Spreadsheet object. Prefers Script Property SPREADSHEET_ID. */
function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (err) {
      throw new Error('Unable to open spreadsheet by SPREADSHEET_ID: ' + err.message);
    }
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('No spreadsheet available. Set Script Property SPREADSHEET_ID or run as a container-bound script.');
}

/** Read header row and map sheet rows to objects */
function getSheetDataObjects_(sheetName) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { error: 'Sheet not found: ' + sheetName, rows: [] };
  var values = sheet.getDataRange().getValues();
  if (!values || values.length === 0) return { headers: [], rows: [] };
  var headers = values[0].map(function(h){ return String(h||'').trim(); });
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c] || ('col' + (c+1))] = row[c];
    }
    rows.push(obj);
  }
  return { headers: headers, rows: rows };
}

/** List sheet names in the bound spreadsheet */
function listAvailableSheets_() {
  var ss = getSpreadsheet_();
  return ss.getSheets().map(function(s){ return s.getName(); });
}

/** Lightweight JSON/JSONP + CORS response helper */
function jsonWithCORS_(obj, e) {
  var json = JSON.stringify(obj || {});
  if (e && e.parameter && e.parameter.callback) {
    var cb = e.parameter.callback;
    var out = ContentService.createTextOutput(cb + '(' + json + ');');
    out.setMimeType(ContentService.MimeType.JAVASCRIPT);
    return out;
  } else {
    var out = ContentService.createTextOutput(json);
    out.setMimeType(ContentService.MimeType.JSON);
    return out;
  }
}

/** Return safe Script Properties for diagnostics (no secrets). */
function getScriptProperties_() {
  var props = PropertiesService.getScriptProperties().getProperties();
  var safe = {};
  ['WEB_APP_VERSION','PAYMENT_NOTIFICATION_EMAIL','API_KEY','SPREADSHEET_ID'].forEach(function(k){
    if (props[k]) safe[k] = props[k];
  });
  return safe;
}

/** Resolve logical sheet name from Script Properties with defaults */
function getSheetName_(key) {
  var props = PropertiesService.getScriptProperties();
  var defaults = {
    'DASHBOARD_SHEET': 'DashboardData',
    'FLATLOOKUP_SHEET': 'FlatLookup',
    'HISTORY_SHEET': 'BalanceHistory',
    'SUBSCRIPTIONS_SHEET': 'Subscriptions',
    'VERIFICATION_SHEET': 'EmailVerification',
    'USAGE_SHEET': 'UsageData',
    'PAYMENTLOG_SHEET': 'PaymentLog'
  };
  return props.getProperty(key) || defaults[key] || key;
}
