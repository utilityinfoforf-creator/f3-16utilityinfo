/***** Google Apps Script - Server side for Utility Dashboard *****
   Deploy as a Web App:
     Execute as: Me
     Who has access: Anyone, even anonymous
*****/

/***** INITIALIZE ALL SHEETS ON FIRST RUN *****/
function initializeSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashSheet = ss.getSheetByName("DashboardData");
  if (!dashSheet) {
    return jsonWithCORS_({ error: "DashboardData sheet not found. Please run initializeSpreadsheet() or contact admin." }, e);
  }
  var subsSheet = getOrCreateSubsSheet_(ss);

  var id = (e.parameter.id || '').trim();
  var action = (e.parameter.action || '').trim();
  var subscribe = e.parameter.subscribe;
  var email = (e.parameter.email || '').trim();
  // Allow some actions to run without a Customer ID (version, seeder)
  if (!id && action) {
    if (action === 'getVersion') {
      var WEB_APP_VERSION = PropertiesService.getScriptProperties().getProperty('WEB_APP_VERSION') || '1.0.0';
      return jsonWithCORS_({ version: WEB_APP_VERSION, timestamp: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ssZ") }, e);
    }
    if (action === 'seedSample') {
      if (typeof populateSampleData_ === 'function') {
        try {
          populateSampleData_();
          return jsonWithCORS_({ status: 'Sample data seeded' }, e);
        } catch (err) {
          return jsonWithCORS_({ error: 'Seeder failed: ' + (err && err.message ? err.message : err) }, e);
        }
      } else {
        return jsonWithCORS_({ error: 'Seeder not available' }, e);
      }
    }
    // If action is present but not handled above, continue — actions that require id will error below
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

/***** USAGE REPORT - Export Report Feature *****/
function getUsageReport_(ss, customerId) {
  var historySheet = getOrCreateHistorySheet_(ss);
  var dashSheet = ss.getSheetByName("DashboardData");
  
  if (!historySheet || !dashSheet) {
    return { usage: [] };
  }
  
  var historyData = historySheet.getDataRange().getValues();
  var dashData = dashSheet.getDataRange().getValues();
  
  // Get customer name
  var customerName = "";
  for (var j = 1; j < dashData.length; j++) {
    if (String(dashData[j][0]).trim() === customerId) {
      customerName = dashData[j][1] || "";
      break;
    }
  }
  
  // Get all history records for this customer
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

/***** USAGE TRENDS - Real Data from Usage Sheet *****/
function getUsageTrends_(ss, customerId) {
  var usageSheet = getOrCreateUsageSheet_(ss);
  var usageData = usageSheet.getDataRange().getValues();
  
  // Get last 12 months of usage data for this customer
  var monthlyData = {};
  
  for (var i = 1; i < usageData.length; i++) {
    if (String(usageData[i][0]).trim() === customerId) {
      var yearMonth = String(usageData[i][1] || "").trim(); // Format: "2025-12"
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
  
  // Get current date and last 12 months
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
      // No data for this month - return 0
      data.push({
        month: month,
        electric: 0,
        water: 0,
        gas: 0
      });
    }
  }
  
  // Calculate averages
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
  
  // Calculate trend
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

/***** MONTHLY COMPARISON - Comparative Analysis Feature *****/
function getMonthlyComparison_(ss, customerId) {
  var usageSheet = getOrCreateUsageSheet_(ss);
  var usageData = usageSheet.getDataRange().getValues();
  
  if (!usageData) {
    return { months: [] };
  }
  
  var months = {};
  
  // Group usage by month (sum duplicates)
  for (var i = 1; i < usageData.length; i++) {
    if (String(usageData[i][0]).trim() === customerId) {
      var yearMonth = String(usageData[i][1] || "").trim(); // Format: "2025-12"
      var electric = parseFloat(usageData[i][2]) || 0;
      var water = parseFloat(usageData[i][3]) || 0;
      var gas = parseFloat(usageData[i][4]) || 0;
      
      if (!months[yearMonth]) {
        // Extract month name from yearMonth
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
  
  // Convert to array and sort by date
  var monthArray = [];
  for (var key in months) {
    if (months.hasOwnProperty(key)) {
      monthArray.push(months[key]);
    }
  }
  
  // Sort chronologically and return last 6 months
  monthArray.sort(function(a, b) {
    return new Date(a.month) - new Date(b.month);
  });
  
  return { 
    months: monthArray.slice(-6),
    customerId: customerId,
    reportDate: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a")
  };
}

/***** BALANCE CHANGE LOG + optional subscriber notification *****/
function logBalanceChange_(ss, customerId, electricBalance) {
  var historySheet = getOrCreateHistorySheet_(ss);
  var now = new Date();
  var formattedTime = Utilities.formatDate(
    now,
    Session.getScriptTimeZone(),
    "EEEE, dd MMM yyyy hh:mm a"
  );

  historySheet.appendRow([
    formattedTime,
    customerId,
    electricBalance,
    "Balance update"
  ]);

  // If the customer has an email subscription, send a balance update email
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

/***** Send balance update email (improved template) *****/
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

/***** Utility lookups for email content *****/
function getCustomerName_(ss, customerId) {
  if (!customerId) return "";
  var dashSheet = ss.getSheetByName("DashboardData");
  if (!dashSheet) return "";
  var data = dashSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === customerId) return data[i][1] || "";
  }
  return "";
}

function getCustomerFlat_(ss, customerId) {
  if (!customerId) return "";
  var dashSheet = ss.getSheetByName("DashboardData");
  if (!dashSheet) return "";
  var data = dashSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === customerId) return data[i][6] || "";
  }
  return "";
}

/***** HELPERS *****/
function getOrCreateSubsSheet_(ss) {
  var sheet = ss.getSheetByName("Subscriptions");
  if (!sheet) {
    sheet = ss.insertSheet("Subscriptions");
    sheet.appendRow(["CustomerID", "Email", "Subscribed"]);
    return sheet;
  }

  var range = sheet.getRange(1, 1, 1, Math.max(3, sheet.getLastColumn()));
  var headers = range.getValues()[0].map(function(h) {
    return String(h).toLowerCase().trim();
  });

  if (!(headers.includes("customerid") && headers.includes("email") && headers.includes("subscribed"))) {
    sheet.clear();
    sheet.appendRow(["CustomerID", "Email", "Subscribed"]);
  }

  return sheet;
}

/***** USAGE DATA SHEET *****/
function getOrCreateUsageSheet_(ss) {
  var sheet = ss.getSheetByName("UsageData");
  if (!sheet) {
    sheet = ss.insertSheet("UsageData");
    sheet.appendRow(["CustomerID", "YearMonth", "Electric", "Water", "Gas"]);
    Logger.log("✅ UsageData sheet created");
  }

  var range = sheet.getRange(1, 1, 1, Math.max(5, sheet.getLastColumn()));
  var headers = range.getValues()[0].map(function(h) {
    return String(h).toLowerCase().trim();
  });

  if (!(headers.includes("customerid") && headers.includes("yearmonth") && headers.includes("electric") && headers.includes("water") && headers.includes("gas"))) {
    sheet.clear();
    sheet.appendRow(["CustomerID", "YearMonth", "Electric", "Water", "Gas"]);
  }

  return sheet;
}

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

/**
 * Return JSON or JSONP (if callback param provided).
 * Use: return jsonWithCORS_(obj, e); // pass request 'e' if you want JSONP support
 */
function jsonWithCORS_(obj, e) {
  var json = JSON.stringify(obj);
  if (e && e.parameter && e.parameter.callback) {
    var callback = e.parameter.callback;
    var output = ContentService.createTextOutput(callback + "(" + json + ");");
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    return output;
  } else {
    var output = ContentService.createTextOutput(json);
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

/***** EMAIL VERIFICATION FUNCTIONS *****/
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

/***** EMAIL VERIFICATION FUNCTIONS *****/
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

      // Check if code matches
      if (storedCode !== String(code).trim()) {
        return { error: "Invalid verification code" };
      }

      // Check if code is not expired (24 hours)
      var now = new Date();
      var timeDiff = (now - new Date(timestamp)) / (1000 * 60 * 60); // hours
      if (timeDiff > 24) {
        return { error: "Verification code has expired" };
      }

      // Code is valid - update subscription
      var subsSheet = getOrCreateSubsSheet_(SpreadsheetApp.getActiveSpreadsheet());
      upsertSubscription_(subsSheet, customerId, email, "true");

      // Clear the verification code
      verificationSheet.getRange(i + 1, 3).setValue("");

      return { status: "✅ Email verified and subscription enabled" };
    }
  }

  return { error: "Customer not found" };
}

function getOrCreateVerificationSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("EmailVerification");
  if (!sheet) {
    sheet = ss.insertSheet("EmailVerification");
    sheet.appendRow(["CustomerID", "Email", "VerificationCode", "Timestamp"]);
  }
  return sheet;
}

/**
 * Populate sample rows into sheets for local testing.
 * Run this from the Apps Script editor to create demo data.
 */
function populateSampleData_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dash = ss.getSheetByName('DashboardData') || ss.insertSheet('DashboardData');
  if (dash.getLastRow() === 0) dash.appendRow(["CustomerID", "Name", "ElectricBalance", "WaterBillDue", "GasBillDue", "LastUpdated", "FlatNumber", "InternetConnected", "InternetBillDue"]);

  var history = getOrCreateHistorySheet_(ss);
  var paymentLog = ss.getSheetByName('PaymentLog') || ss.insertSheet('PaymentLog');
  if (paymentLog.getLastRow() === 0) paymentLog.appendRow(["Timestamp","CustomerID","Name","FlatNumber","TransactionNumber"]);
  var usage = getOrCreateUsageSheet_(ss);
  var subs = getOrCreateSubsSheet_(ss);

  var now = new Date();
  var ts = Utilities.formatDate(now, Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a");

  // Write two sample customers (upsert)
  var existing = dash.getDataRange().getValues();
  var ids = existing.map(function(r){ return String(r[0]||'').trim(); });

  function upsertDash(id, name, balance, water, gas, flat) {
    var found = false;
    var data = dash.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === id) {
        dash.getRange(i+1,2).setValue(name);
        dash.getRange(i+1,3).setValue(balance);
        dash.getRange(i+1,4).setValue(water);
        dash.getRange(i+1,5).setValue(gas);
        dash.getRange(i+1,6).setValue(ts);
        dash.getRange(i+1,7).setValue(flat);
        found = true; break;
      }
    }
    if (!found) dash.appendRow([id, name, balance, water, gas, ts, flat, 'Yes', '0']);
  }

  upsertDash('CUST001','Ayesha Rahman', 450.75, 120.00, 30.50, 'A-101');
  upsertDash('CUST002','Rafiq Khan', -120.00, 0, 0, 'B-203');

  // Add some history rows
  history.appendRow([Utilities.formatDate(new Date(now.getTime() - 1000*60*60*24*30), Session.getScriptTimeZone(), 'yyyy-MM-dd'), 'CUST001', 520.00, 'Monthly billing']);
  history.appendRow([Utilities.formatDate(new Date(now.getTime() - 1000*60*60*24*15), Session.getScriptTimeZone(), 'yyyy-MM-dd'), 'CUST001', 450.75, 'Payment received']);
  history.appendRow([Utilities.formatDate(new Date(now.getTime() - 1000*60*60*24*40), Session.getScriptTimeZone(), 'yyyy-MM-dd'), 'CUST002', -120.00, 'Adjustment']);

  // Add payment log entries
  paymentLog.appendRow([Utilities.formatDate(new Date(now.getTime() - 1000*60*60*24*10), Session.getScriptTimeZone(), 'EEEE, dd MMM yyyy hh:mm a'), 'CUST001', 'Ayesha Rahman', 'A-101', 'TXN1001']);
  paymentLog.appendRow([Utilities.formatDate(new Date(now.getTime() - 1000*60*60*24*35), Session.getScriptTimeZone(), 'EEEE, dd MMM yyyy hh:mm a'), 'CUST002', 'Rafiq Khan', 'B-203', 'TXN1002']);

  // Add usage data for last 12 months for CUST001
  for (var m = 0; m < 12; m++) {
    var d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    var ym = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    var e = Math.round(Math.random()*200 + 100);
    var w = Math.round(Math.random()*50 + 10);
    var g = Math.round(Math.random()*20 + 5);
    usage.appendRow(['CUST001', ym, e, w, g]);
  }

  // Subscriptions
  subs.appendRow(['CUST001','ayesha@example.com','true']);
  subs.appendRow(['CUST002','rafiq@example.com','false']);

  return { status: 'Sample data populated' };
}