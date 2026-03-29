/***** Google Apps Script - Server side for Utility Dashboard *****
   Deploy as a Web App:
     Execute as: Me
     Who has access: Anyone, even anonymous
*****/

/***** INITIALIZE ALL SHEETS ON FIRST RUN *****/
function initializeSpreadsheet() {
  var ss = getSpreadsheet_();

  var DASH = getSheetName_('DASHBOARD_SHEET');
  var FLAT = getSheetName_('FLATLOOKUP_SHEET');

  // Create Dashboard sheet if it doesn't exist
  if (!ss.getSheetByName(DASH)) {
    var dashSheet = ss.insertSheet(DASH);
    dashSheet.appendRow(["CustomerID", "Name", "ElectricBalance", "WaterBillDue", "GasBillDue", "LastUpdated", "FlatNumber", "InternetConnected", "InternetBillDue"]);
    Logger.log("✅ " + DASH + " sheet created");
  }

  // Create FlatLookup sheet if it doesn't exist
  if (!ss.getSheetByName(FLAT)) {
    var flatSheet = ss.insertSheet(FLAT);
    flatSheet.appendRow(["CustomerID", "FlatNumber"]);
    Logger.log("✅ " + FLAT + " sheet created");
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
  var dashName = getSheetName_('DASHBOARD_SHEET');
  var lookupName = getSheetName_('FLATLOOKUP_SHEET');
  var dashSheet = ss.getSheetByName(dashName);
  if (!dashSheet) {
    dashSheet = ss.insertSheet(dashName);
    dashSheet.appendRow(["CustomerID", "Name", "ElectricBalance", "WaterBillDue", "GasBillDue", "LastUpdated", "FlatNumber", "InternetConnected", "InternetBillDue"]);
  }
  var lookupSheet = ss.getSheetByName(lookupName);

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
  var dashSheet = ss.getSheetByName(getSheetName_('DASHBOARD_SHEET'));
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

  // Export all data as JSON for static dashboard (no id required)
  if (action === 'export') {
    return doGet_Export(e);
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
    var ss = getSpreadsheet_();

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
  var dashSheet = ss.getSheetByName(getSheetName_('DASHBOARD_SHEET'));
  if (!dashSheet) return "❌ Dashboard sheet missing.";

  var logSheetName = getSheetName_('PAYMENTLOG_SHEET');
  var logSheet = ss.getSheetByName(logSheetName) || ss.insertSheet(logSheetName);

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
  var name = getSheetName_('HISTORY_SHEET');
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
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

/**
 * Return sheet name for a logical key. Keys read from Script Properties
 * allow customizing sheet names without code changes. Defaults map below.
 */
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

function listAvailableSheets_() {
  var ss = getSpreadsheet_();
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

/***** EXPORT FOR STATIC DASHBOARD *****/
function exportDashboardDataAsJSON() {
  var ss = getSpreadsheet_();
  var dashName = getSheetName_('DASHBOARD_SHEET');
  var dashSheet = ss.getSheetByName(dashName);
  var historySheet = getOrCreateHistorySheet_(ss);
  var usageSheet = getOrCreateUsageSheet_(ss);

  if (!dashSheet) {
    Logger.log("DashboardData sheet not found");
    return null;
  }

  var dashData = dashSheet.getDataRange().getValues();
  var historyData = historySheet.getDataRange().getValues();
  var usageData = usageSheet.getDataRange().getValues();

  var customers = [];

  // Convert dashboard rows to objects
  for (var i = 1; i < dashData.length; i++) {
    var row = dashData[i];
    var customerId = String(row[0] || '').trim();

    if (!customerId) continue;

    // Get history for this customer
    var customerHistory = [];
    for (var h = 1; h < historyData.length; h++) {
      if (String(historyData[h][1]).trim() === customerId) {
        customerHistory.push({
          date: String(historyData[h][0] || ''),
          balance: String(historyData[h][2] || '0'),
          description: String(historyData[h][3] || '')
        });
      }
    }
    customerHistory.reverse();

    // Get usage trends
    var monthlyData = {};
    for (var u = 1; u < usageData.length; u++) {
      if (String(usageData[u][0]).trim() === customerId) {
        var yearMonth = String(usageData[u][1] || '').trim();
        var eVal = parseFloat(usageData[u][2]) || 0;
        var wVal = parseFloat(usageData[u][3]) || 0;
        var gVal = parseFloat(usageData[u][4]) || 0;

        if (!monthlyData[yearMonth]) {
          monthlyData[yearMonth] = { electric: 0, water: 0, gas: 0 };
        }
        monthlyData[yearMonth].electric += eVal;
        monthlyData[yearMonth].water += wVal;
        monthlyData[yearMonth].gas += gVal;
      }
    }

    // Build 12-month trends
    var now = new Date();
    var trendsData = [];
    var totalElectric = 0, totalWater = 0, totalGas = 0, count = 0;

    for (var m = 11; m >= 0; m--) {
      var date = new Date(now.getFullYear(), now.getMonth() - m, 1);
      var yearMonth = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
      var month = date.toLocaleDateString('en-US', { month: 'short' });

      var monthData = monthlyData[yearMonth] || { electric: 0, water: 0, gas: 0 };
      trendsData.push({
        month: month,
        electric: monthData.electric,
        water: monthData.water,
        gas: monthData.gas
      });
      totalElectric += monthData.electric;
      totalWater += monthData.water;
      totalGas += monthData.gas;
      count++;
    }

    var avgElectric = (count > 0 ? (totalElectric / count).toFixed(2) : '0');
    var avgWater = (count > 0 ? (totalWater / count).toFixed(2) : '0');
    var avgGas = (count > 0 ? (totalGas / count).toFixed(2) : '0');

    // Monthly comparison (last 6 months)
    var monthlyComparison = [];
    var allMonths = Object.keys(monthlyData).sort().slice(-6);
    for (var mi = 0; mi < allMonths.length; mi++) {
      var ym = allMonths[mi];
      var parts = ym.split("-");
      var mDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      var mName = mDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      var mData = monthlyData[ym];
      monthlyComparison.push({
        month: mName,
        electric: mData.electric,
        water: mData.water,
        gas: mData.gas,
        total: (mData.electric + mData.water + mData.gas).toFixed(2)
      });
    }

    customers.push({
      id: customerId,
      name: row[1] || '',
      flatNumber: row[6] || '',
      electricBalance: String(row[2] || '0'),
      waterBillDue: String(row[3] || '0'),
      gasBillDue: String(row[4] || '0'),
      internetBillDue: String(row[8] || '0'),
      internetConnected: row[7] || 'Unknown',
      lastUpdated: row[5] instanceof Date ? Utilities.formatDate(row[5], Session.getScriptTimeZone(), 'EEEE, dd MMM yyyy hh:mm a') : String(row[5] || ''),
      history: customerHistory,
      usageTrends: {
        data: trendsData,
        avgElectric: avgElectric,
        avgWater: avgWater,
        avgGas: avgGas,
        trend: trendsData.length > 1 && trendsData[trendsData.length - 1].electric > trendsData[0].electric ? '📈 Increasing' : '📉 Decreasing'
      },
      monthlyComparison: {
        months: monthlyComparison
      }
    });
  }

  var exportData = {
    customers: customers,
    lastExported: new Date().toString(),
    metadata: {
      totalCustomers: customers.length,
      building: "F3-16",
      organization: "Utility Corporations"
    }
  };

  Logger.log("Export successful: " + customers.length + " customers exported");
  return exportData;
}

function doGet_Export(e) {
  var exportData = exportDashboardDataAsJSON();
  if (!exportData) {
    return jsonWithCORS_({ error: "Failed to export data" }, e);
  }
  return jsonWithCORS_(exportData, e);
}

/***** USAGE DATA SHEET *****/
function getOrCreateUsageSheet_(ss) {
  var name = getSheetName_('USAGE_SHEET');
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(["CustomerID", "YearMonth", "Electric", "Water", "Gas"]);
  }
  return sheet;
}

function getOrCreateSubsSheet_(ss) {
  var name = getSheetName_('SUBSCRIPTIONS_SHEET');
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(["CustomerID", "Email", "Subscribed"]);
  }
  return sheet;
}

function getOrCreateVerificationSheet_() {
  var ss = getSpreadsheet_();
  var name = getSheetName_('VERIFICATION_SHEET');
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(["CustomerID", "Email", "VerificationCode", "Timestamp"]);
  }
  return sheet;
}

/***** USAGE TRENDS *****/
function getUsageTrends_(ss, customerId) {
  var usageSheet = getOrCreateUsageSheet_(ss);
  var usageData = usageSheet.getDataRange().getValues();
  var monthlyData = {};

  for (var i = 1; i < usageData.length; i++) {
    if (String(usageData[i][0]).trim() === customerId) {
      var yearMonth = String(usageData[i][1] || "").trim();
      var eVal = parseFloat(usageData[i][2]) || 0;
      var wVal = parseFloat(usageData[i][3]) || 0;
      var gVal = parseFloat(usageData[i][4]) || 0;

      if (!monthlyData[yearMonth]) {
        monthlyData[yearMonth] = { electric: 0, water: 0, gas: 0 };
      }
      monthlyData[yearMonth].electric += eVal;
      monthlyData[yearMonth].water += wVal;
      monthlyData[yearMonth].gas += gVal;
    }
  }

  var now = new Date();
  var data = [];

  for (var m = 11; m >= 0; m--) {
    var date = new Date(now.getFullYear(), now.getMonth() - m, 1);
    var yearMonth = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
    var month = date.toLocaleDateString('en-US', { month: 'short' });

    if (monthlyData[yearMonth]) {
      data.push({
        month: month,
        electric: monthlyData[yearMonth].electric,
        water: monthlyData[yearMonth].water,
        gas: monthlyData[yearMonth].gas
      });
    } else {
      data.push({
        month: month,
        electric: 0,
        water: 0,
        gas: 0
      });
    }
  }

  var totalElectric = 0, totalWater = 0, totalGas = 0, count = 0;
  for (var i = 0; i < data.length; i++) {
    totalElectric += data[i].electric;
    totalWater += data[i].water;
    totalGas += data[i].gas;
    count++;
  }

  var avgElectric = (totalElectric / count).toFixed(2);
  var avgWater = (totalWater / count).toFixed(2);
  var avgGas = (totalGas / count).toFixed(2);
  var trend = data[data.length - 1].electric > data[0].electric ? '📈 Increasing' : '📉 Decreasing';

  return {
    data: data,
    avgElectric: avgElectric,
    avgWater: avgWater,
    avgGas: avgGas,
    trend: trend,
    customerId: customerId,
    reportDate: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a")
  };
}

/***** USAGE REPORT *****/
function getUsageReport_(ss, customerId) {
  var historySheet = getOrCreateHistorySheet_(ss);
  var dashSheet = ss.getSheetByName(getSheetName_('DASHBOARD_SHEET'));

  var historyData = historySheet.getDataRange().getValues();
  var dashData = dashSheet.getDataRange().getValues();

  var customerName = "";
  for (var j = 1; j < dashData.length; j++) {
    if (String(dashData[j][0]).trim() === customerId) {
      customerName = dashData[j][1] || "";
      break;
    }
  }

  var usage = [];
  for (var i = 1; i < historyData.length; i++) {
    if (String(historyData[i][1]).trim() === customerId) {
      usage.push({
        date: String(historyData[i][0]),
        balance: String(historyData[i][2]),
        description: String(historyData[i][3])
      });
    }
  }

  return {
    usage: usage.reverse(),
    customerName: customerName,
    customerId: customerId,
    exportDate: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "EEEE, dd MMM yyyy")
  };
}

/***** MONTHLY COMPARISON *****/
function getMonthlyComparison_(ss, customerId) {
  var usageSheet = getOrCreateUsageSheet_(ss);
  var usageData = usageSheet.getDataRange().getValues();
  var months = {};

  for (var i = 1; i < usageData.length; i++) {
    if (String(usageData[i][0]).trim() === customerId) {
      var yearMonth = String(usageData[i][1] || "").trim();
      var electric = parseFloat(usageData[i][2]) || 0;
      var water = parseFloat(usageData[i][3]) || 0;
      var gas = parseFloat(usageData[i][4]) || 0;

      if (!months[yearMonth]) {
        var parts = yearMonth.split("-");
        var monthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        var monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        months[yearMonth] = {
          month: monthName,
          electric: 0,
          water: 0,
          gas: 0
        };
      }
      months[yearMonth].electric += electric;
      months[yearMonth].water += water;
      months[yearMonth].gas += gas;
      months[yearMonth].total = (months[yearMonth].electric + months[yearMonth].water + months[yearMonth].gas).toFixed(2);
    }
  }

  var monthArray = [];
  for (var key in months) {
    if (months.hasOwnProperty(key)) {
      monthArray.push(months[key]);
    }
  }

  monthArray.sort(function(a, b) {
    return new Date(a.month) - new Date(b.month);
  });

  return {
    months: monthArray.slice(-6),
    customerId: customerId,
    reportDate: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a")
  };
}

/***** EMAIL VERIFICATION *****/
function requestEmailVerification_(customerId, email) {
  if (!email) return { error: "Email address required" };

  var verificationSheet = getOrCreateVerificationSheet_();
  var verificationCode = Utilities.getUuid().substring(0, 8).toUpperCase();
  var timestamp = new Date();

  verificationSheet.appendRow([customerId, email, verificationCode, timestamp]);

  try {
    MailApp.sendEmail({
      to: email,
      subject: "Email Verification Code — F3-16 Utility",
      body: "Hello,\n\nYour email verification code is: " + verificationCode + "\nThis code will expire in 24 hours.\n\nRegards,\nF3-16 Utility Corporations"
    });
    return { status: "Verification code sent to " + email };
  } catch (err) {
    return { error: "Failed to send verification email: " + err.message };
  }
}

function confirmEmailVerification_(customerId, code) {
  if (!code) {
    return { error: "Verification code required" };
  }

  var verificationSheet = getOrCreateVerificationSheet_();
  var data = verificationSheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === customerId) {
      var storedCode = String(data[i][2] || "").trim();
      var timestamp = data[i][3];
      var email = String(data[i][1] || "").trim();

      if (storedCode !== String(code).trim()) {
        return { error: "Invalid verification code" };
      }

      var now = new Date();
      var timeDiff = (now - new Date(timestamp)) / (1000 * 60 * 60);
      if (timeDiff > 24) {
        return { error: "Verification code has expired" };
      }

      var subsSheet = getOrCreateSubsSheet_(getSpreadsheet_());
      upsertSubscription_(subsSheet, customerId, email, "true");

      verificationSheet.getRange(i + 1, 3).setValue("");

      return { status: "✅ Email verified and subscription enabled" };
    }
  }

  return { error: "Customer not found" };
}

/***** SUBSCRIPTION MANAGEMENT *****/
function getSubscription_(subsSheet, id) {
  var data = subsSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === id) {
      var email = String(data[i][1] || "").trim();
      var subscribedRaw = String(data[i][2] || "false").trim().toLowerCase();
      var subscribed = (subscribedRaw === "true") ? "true" : "false";
      return { email: email, subscribed: subscribed };
    }
  }
  return { email: "", subscribed: "false" };
}

function upsertSubscription_(subsSheet, id, email, subscribe) {
  var data = subsSheet.getDataRange().getValues();
  var subNorm = (String(subscribe || "false").trim().toLowerCase() === "true") ? "true" : "false";
  var emailNorm = String(email || "").trim();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === id) {
      if (emailNorm) subsSheet.getRange(i + 1, 2).setValue(emailNorm);
      subsSheet.getRange(i + 1, 3).setValue(subNorm);
      return;
    }
  }
  subsSheet.appendRow([id, emailNorm, subNorm]);
}

/***** BALANCE CHANGE LOG *****/
function logBalanceChange_(ss, customerId, electricBalance) {
  var historySheet = getOrCreateHistorySheet_(ss);
  var now = new Date();
  var formattedTime = Utilities.formatDate(now, Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a");

  historySheet.appendRow([formattedTime, customerId, electricBalance, "Balance update"]);

  try {
    var subsSheet = getOrCreateSubsSheet_(ss);
    var subInfo = getSubscription_(subsSheet, customerId);
    if (subInfo && subInfo.subscribed === "true" && subInfo.email) {
      sendBalanceUpdateEmail_(subInfo.email, {
        customerId: customerId,
        balance: electricBalance,
        timestamp: formattedTime,
        name: getCustomerName_(ss, customerId),
        flatNumber: getCustomerFlat_(ss, customerId)
      });
    }
  } catch (e) {
    Logger.log("Error sending balance update email: " + e);
  }
}

function sendBalanceUpdateEmail_(toEmail, info) {
  if (!toEmail) return;
  var tenantName = info.name || info.customerId;
  var balance = info.balance || "0";
  var time = info.timestamp || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a");
  var flat = info.flatNumber || "N/A";

  var subject = "Account Balance Update — " + flat + " (" + tenantName + ")";

  var plainBody =
    "Hello " + tenantName + ",\n\n" +
    "This is an automated notification to inform you of a recent update to your utility account balance.\n\n" +
    "Flat: " + flat + "\n" +
    "Customer ID: " + (info.customerId || "") + "\n" +
    "Electric balance: ৳ " + balance + "\n" +
    "Updated at: " + time + "\n\n" +
    "If this update is unexpected or you have questions, please reply to this email or contact the property manager.\n\n" +
    "Regards,\n" +
    "F3-16 Utility Corporations\n";

  var htmlBody =
    '<div style="font-family: Arial, Helvetica, sans-serif; color: #111;">' +
      '<h2 style="margin:0 0 8px 0;">Account Balance Update</h2>' +
      '<p>Hello ' + tenantName + ',</p>' +
      '<p>This is an automated notification to inform you of a recent update to your utility account balance.</p>' +
      '<table style="border-collapse:collapse; width:100%; max-width:600px;">' +
        '<tr><td style="padding:8px; border:1px solid #e6e6e6; font-weight:700;">Flat</td><td style="padding:8px; border:1px solid #e6e6e6;">' + flat + '</td></tr>' +
        '<tr><td style="padding:8px; border:1px solid #e6e6e6; font-weight:700;">Customer ID</td><td style="padding:8px; border:1px solid #e6e6e6;">' + (info.customerId || "") + '</td></tr>' +
        '<tr><td style="padding:8px; border:1px solid #e6e6e6; font-weight:700;">Electric balance</td><td style="padding:8px; border:1px solid #e6e6e6;">৳ ' + balance + '</td></tr>' +
        '<tr><td style="padding:8px; border:1px solid #e6e6e6; font-weight:700;">Updated at</td><td style="padding:8px; border:1px solid #e6e6e6;">' + time + '</td></tr>' +
      '</table>' +
      '<p>If you have any questions, reply to this email or contact the property manager.</p>' +
      '<p style="margin:12px 0 0 0; font-weight:700;">F3-16 Utility Corporations</p>' +
    '</div>';

  try {
    MailApp.sendEmail({
      to: toEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: "F3-16 UTILITY CORPORATIONS"
    });
  } catch (mailErr) {
    Logger.log("Balance email send failed to " + toEmail + ": " + mailErr);
  }
}

/***** UTILITY LOOKUPS *****/
function getCustomerName_(ss, customerId) {
  if (!customerId) return "";
  var dashSheet = ss.getSheetByName(getSheetName_('DASHBOARD_SHEET'));
  if (!dashSheet) return "";
  var data = dashSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === customerId) return data[i][1] || "";
  }
  return "";
}

function getCustomerFlat_(ss, customerId) {
  if (!customerId) return "";
  var dashSheet = ss.getSheetByName(getSheetName_('DASHBOARD_SHEET'));
  if (!dashSheet) return "";
  var data = dashSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === customerId) return data[i][6] || "";
  }
  return "";
}

/***** SAMPLE DATA POPULATION *****/
function populateSampleData_() {
  var ss = getSpreadsheet_();
  var dashSheet = ss.getSheetByName(getSheetName_('DASHBOARD_SHEET'));
  if (!dashSheet) return "Dashboard sheet not found";

  dashSheet.appendRow(["C001", "Ahmed Hassan", "1500", "800", "600", new Date(), "3A", "Yes", "1200"]);
  dashSheet.appendRow(["C002", "Fatima Khan", "2000", "1200", "900", new Date(), "3B", "No", "0"]);
  dashSheet.appendRow(["C003", "Muhammad Ali", "1200", "500", "400", new Date(), "4A", "Yes", "900"]);

  return "Sample data populated";
}
