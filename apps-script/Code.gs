/***** Google Apps Script - Server side for Utility Dashboard *****
   Deploy as a Web App:
     Execute as: Me
     Who has access: Anyone, even anonymous
*****/

/***** INITIALIZE ALL SHEETS ON FIRST RUN *****/
function initializeSpreadsheet() {
  var ss = getSpreadsheet_();
  
  // Create DashboardData sheet if it doesn't exist
  if (!ss.getSheetByName("DashboardData")) {
    var dashSheet = ss.insertSheet("DashboardData");
    dashSheet.appendRow(["CustomerID", "Name", "ElectricBalance", "WaterBillDue", "GasBillDue", "LastUpdated", "FlatNumber", "InternetConnected", "InternetBillDue"]);
    Logger.log("✅ DashboardData sheet created");
  }
  
  // Create FlatLookup sheet if it doesn't exist
  if (!ss.getSheetByName("FlatLookup")) {
    var flatSheet = ss.insertSheet("FlatLookup");
    flatSheet.appendRow(["CustomerID", "FlatNumber"]);
    Logger.log("✅ FlatLookup sheet created");
  }
  
  // These will auto-create when needed, but we can pre-create them
  getOrCreateHistorySheet_(ss);
  getOrCreateSubsSheet_(ss);
  getOrCreateVerificationSheet_();
  getOrCreateUsageSheet_(ss);
  
  Logger.log("✅ All sheets initialized successfully");
}

/**
 * Web app version - update when deploying a new release
 */
var WEB_APP_VERSION = '1.0.0';


/***** FORM SUBMISSION: updates DashboardData *****/
function onFormSubmit(e) {
  var ss = getSpreadsheet_();
  // Ensure dashboard exists
  var dashSheet = ss.getSheetByName("DashboardData");
  if (!dashSheet) {
    dashSheet = ss.insertSheet("DashboardData");
    dashSheet.appendRow(["CustomerID", "Name", "ElectricBalance", "WaterBillDue", "GasBillDue", "LastUpdated", "FlatNumber", "InternetConnected", "InternetBillDue"]);
  }
  var lookupSheet = ss.getSheetByName("FlatLookup");

  // Prefer e.values for form submit; fallback to namedValues or range
  var values = (e && e.values) ? e.values
             : (e && e.namedValues) ? (function(){
                 var nv = e.namedValues;
                 var arr = [];
                 // Best-effort mapping: Timestamp, CustomerID, Name, ElectricBalance, WaterBillDue, GasBillDue
                 arr.push(nv.Timestamp ? nv.Timestamp[0] : (nv['Timestamp'] ? nv['Timestamp'][0] : new Date()));
                 arr.push(nv.CustomerID ? nv.CustomerID[0] : (nv['Customer ID'] ? nv['Customer ID'][0] : ""));
                 arr.push(nv.Name ? nv.Name[0] : "");
                 arr.push(nv.ElectricBalance ? nv.ElectricBalance[0] : 0);
                 arr.push(nv.WaterBillDue ? nv.WaterBillDue[0] : 0);
                 arr.push(nv.GasBillDue ? nv.GasBillDue[0] : 0);
                 return arr;
               })()
             : (e && e.range && typeof e.range.getValues === 'function') ? e.range.getValues()[0]
             : null;

  if (!values) {
    Logger.log("onFormSubmit: no form values provided");
    return;
  }

  var timestamp = values[0];
  var customerId = String(values[1] || '').trim();
  var name = values[2] || "";
  var electricBalance = values[3] || "0";
  var waterBillDue = values[4] || "0";
  var gasBillDue = values[5] || "0";

  var formattedTime = Utilities.formatDate(timestamp instanceof Date ? timestamp : new Date(), Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a");

  // Lookup FlatNumber
  var flatNumber = "";
  if (lookupSheet) {
    var lookupData = lookupSheet.getDataRange().getValues();
    for (var j = 1; j < lookupData.length; j++) {
      if (String(lookupData[j][0]).trim() === customerId) {
        flatNumber = lookupData[j][1] || "";
        break;
      }
    }
  }

  // Ensure header exists
  if (dashSheet.getLastRow() === 0) {
    dashSheet.appendRow(["CustomerID", "Name", "ElectricBalance", "WaterBillDue", "GasBillDue", "LastUpdated", "FlatNumber", "InternetConnected", "InternetBillDue"]);
  }

  // Upsert into DashboardData
  var data = dashSheet.getDataRange().getValues();
  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === customerId) {
      dashSheet.getRange(i + 1, 2).setValue(name);
      dashSheet.getRange(i + 1, 3).setValue(electricBalance);
      dashSheet.getRange(i + 1, 4).setValue(waterBillDue);
      dashSheet.getRange(i + 1, 5).setValue(gasBillDue);
      dashSheet.getRange(i + 1, 6).setValue(formattedTime);
      dashSheet.getRange(i + 1, 7).setValue(flatNumber);
      found = true;
      break;
    }
  }
  if (!found) {
    dashSheet.appendRow([customerId, name, electricBalance, waterBillDue, gasBillDue, formattedTime, flatNumber, "Unknown", "0"]);
  }

  try {
    logBalanceChange_(ss, customerId, electricBalance);
  } catch (err) {
    Logger.log("onFormSubmit: error logging balance change: " + (err && err.message ? err.message : err));
  }
}

/***** WEB APP: GET *****/
function doGet(e) {
  var ss = getSpreadsheet_();
  var dashSheet = ss.getSheetByName("DashboardData");
  if (!dashSheet) {
    return jsonWithCORS_({ error: "DashboardData sheet not found. Please run initializeSpreadsheet() or contact admin." }, e);
  }
  var subsSheet = getOrCreateSubsSheet_(ss);

  var id = (e.parameter.id || '').trim();
  var action = (e.parameter.action || '').trim();
  var subscribe = e.parameter.subscribe;
  var email = (e.parameter.email || '').trim();
  // Diagnostic endpoint for debugging deployments
  if (action === 'diagnose') {
    try {
      var props = getScriptProperties_();
      var sheets = [];
      try { sheets = listAvailableSheets_(); } catch(e){ sheets = ['error_reading_sheets: '+ (e.message || e)]; }
      return jsonWithCORS_({ status: 'ok', properties: props, sheets: sheets }, e);
    } catch (err) {
      return jsonWithCORS_({ error: 'diagnose_failed', message: (err && err.message) ? err.message : String(err) }, e);
    }
  }

  // Public action: get current deployed web-app version (no id required)
  if (action === 'getVersion') {
    return jsonWithCORS_({ version: WEB_APP_VERSION, timestamp: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'") }, e);
  }

  // Admin/dev helper: seed sample data (no id required)
  if (action === 'seedSample' || action === 'populateSample') {
    try {
      var result = populateSampleData_();
      return jsonWithCORS_({ status: 'ok', result: result }, e);
    } catch (err) {
      return jsonWithCORS_({ error: 'seed_failed', message: (err && err.message) ? err.message : String(err) }, e);
    }
  }

  // Read-only helpers: list sheets or return sheet rows as JSON (no id required)
  if (!id && action) {
    if (action === 'listSheets') {
      return jsonWithCORS_({ sheets: listAvailableSheets_() }, e);
    }
    if (action === 'getSheet') {
      var sheetName = (e.parameter.sheet || '').trim();
      if (!sheetName) return jsonWithCORS_({ error: 'Missing sheet parameter' }, e);
      return jsonWithCORS_(getSheetDataObjects_(sheetName), e);
    }
  }

  if (!id) return jsonWithCORS_({ error: 'Missing Customer ID' }, e);

  if (e.parameter.history === 'true') return jsonWithCORS_({ history: getCustomerHistory_(ss, id) }, e);

  if (action === 'getUsageTrends') return jsonWithCORS_(getUsageTrends_(ss, id), e);
  if (action === 'getUsageReport') return jsonWithCORS_(getUsageReport_(ss, id), e);
  if (action === 'getMonthlyComparison') return jsonWithCORS_(getMonthlyComparison_(ss, id), e);
  if (action === 'request') return jsonWithCORS_(requestEmailVerification_(id, email), e);
  if (action === 'confirm') return jsonWithCORS_(confirmEmailVerification_(id, e.parameter.code), e);

  if (subscribe !== undefined) {
    upsertSubscription_(subsSheet, id, email, subscribe);
    return jsonWithCORS_({ status: subscribe === 'true' ? 'Email updates enabled' : 'Email updates disabled' }, e);
  }

  var data = dashSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === id) {
      var subInfo = getSubscription_(subsSheet, id);
      var lastUpdatedRaw = data[i][5];
      var lastUpdatedStr = lastUpdatedRaw instanceof Date ? Utilities.formatDate(lastUpdatedRaw, Session.getScriptTimeZone(), 'EEEE, dd MMM yyyy hh:mm a') : String(lastUpdatedRaw);
      return jsonWithCORS_({
        name: data[i][1] || '',
        electricBalance: data[i][2] || '0',
        waterBillDue: data[i][3] || '0',
        gasBillDue: data[i][4] || '0',
        internetConnected: data[i][7] || 'Unknown',
        internetBillDue: data[i][8] || '0',
        lastUpdated: lastUpdatedStr,
        flatNumber: data[i][6] || '',
        subscribed: subInfo.subscribed,
        email: subInfo.email
      }, e);
    }
  }
  return jsonWithCORS_({ error: 'Customer not found' }, e);
}

/***** WEB APP: POST *****/
function doPost(e) {
  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : null;
    if (!raw) return jsonWithCORS_({ error: "No payload" }, e);

    var payload = JSON.parse(raw);
    var action = payload.action || '';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // API key enforcement (optional): stored in Script Properties
    var requiredKey = PropertiesService.getScriptProperties().getProperty('API_KEY') || '';
    if (requiredKey) {
      var provided = payload.apiKey || '';
      if (!provided || provided !== requiredKey) {
        return jsonWithCORS_({ error: 'Unauthorized' }, e);
      }
    } else {
      Logger.log('doPost: no API_KEY configured in Script Properties (requests are not enforced).');
    }

    if (action === 'submitTransaction') {
      var customerId = String(payload.customerId || '').trim();
      var transaction = String(payload.transaction || '').trim();
      if (!customerId || !transaction) return jsonWithCORS_({ error: 'Missing customerId or transaction' }, e);
      var result = confirmPayment_(ss, customerId, transaction);
      return jsonWithCORS_({ status: result }, e);
    }

    return jsonWithCORS_({ error: 'Unknown action' }, e);
  } catch (err) {
    Logger.log('doPost error: ' + (err && err.message ? err.message : err));
    return jsonWithCORS_({ error: 'Invalid request: ' + (err.message || err) }, e);
  }
}

/***** PAYMENT CONFIRMATION *****/
function confirmPayment_(ss, id, transactionNumber) {
  var dashSheet = ss.getSheetByName("DashboardData");
  if (!dashSheet) return "❌ DashboardData sheet missing.";

  var logSheet = ss.getSheetByName("PaymentLog") || ss.insertSheet("PaymentLog");

  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(["Timestamp","CustomerID","Name","FlatNumber","TransactionNumber"]);
  }

  var data = dashSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === id) {
      var name = data[i][1];
      var flatNumber = data[i][6] || "";
      var now = new Date();
      var formattedTime = Utilities.formatDate(now, Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a");

      logSheet.appendRow([formattedTime, id, name, flatNumber, transactionNumber]);

      // Recipient from Script Properties (set PAYMENT_NOTIFICATION_EMAIL there)
      var recipient = PropertiesService.getScriptProperties().getProperty('PAYMENT_NOTIFICATION_EMAIL') || "mridhamdraihan589@gmail.com";

      try {
        MailApp.sendEmail({
          to: recipient,
          subject: "Payment Confirmation Received — " + (flatNumber || id),
          body: "Tenant: " + (name || id) + "\nFlat: " + flatNumber + "\nCustomer ID: " + id + "\nTransaction: " + transactionNumber + "\nTime: " + formattedTime,
          name: "F3-16 Utility Corporations"
        });
        return "✅ Payment confirmation submitted and email sent.";
      } catch (err) {
        Logger.log("❌ Email failed: " + (err && err.message ? err.message : err));
        return "Payment logged, but email failed: " + (err && err.message ? err.message : err);
      }
    }
  }
  return "❌ Customer not found in DashboardData.";
}

/***** HISTORY TRACKING *****/
function getOrCreateHistorySheet_(ss) {
  var sheet = ss.getSheetByName("BalanceHistory");
  if (!sheet) {
    sheet = ss.insertSheet("BalanceHistory");
    sheet.appendRow(["Timestamp", "CustomerID", "ElectricBalance", "Description"]);
  }
  return sheet;
}

/**
 * Robust spreadsheet getter. Prefer SPREADSHEET_ID Script Property if present,
 * otherwise fall back to container-bound active spreadsheet. Throws an error
 * object if no spreadsheet can be found.
 */
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

/** Return key script properties useful for diagnostics. */
function getScriptProperties_() {
  var props = PropertiesService.getScriptProperties().getProperties();
  // Don't return sensitive keys
  var safe = {};
  ['WEB_APP_VERSION','PAYMENT_NOTIFICATION_EMAIL','API_KEY','SPREADSHEET_ID'].forEach(function(k){
    if (props[k]) safe[k] = props[k];
  });
  return safe;
}

function getCustomerHistory_(ss, customerId) {
  var historySheet = getOrCreateHistorySheet_(ss);
  var data = historySheet.getDataRange().getValues();
  var history = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(customerId).trim()) {
      history.push({ date: String(data[i][0]), balance: String(data[i][2]), description: String(data[i][3]) });
    }
  }
  return history.reverse();
}

/*** End of file ***/

/* ----------------- Read-only sheet helpers ----------------- */
function getSheetDataObjects_(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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

function listAvailableSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets().map(function(s){ return s.getName(); });
}

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
