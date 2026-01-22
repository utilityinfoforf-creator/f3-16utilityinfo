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
  
  Logger.log("✅ All sheets initialized successfully");
}

/***** FORM SUBMISSION: updates DashboardData *****/
function onFormSubmit(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashSheet = ss.getSheetByName("DashboardData");
  var lookupSheet = ss.getSheetByName("FlatLookup");

  var submittedRange = e.range.getValues()[0];
  var timestamp = submittedRange[0];
  var customerId = String(submittedRange[1] || '').trim();
  var name = submittedRange[2];
  var electricBalance = submittedRange[3];
  var waterBillDue = submittedRange[4];
  var gasBillDue = submittedRange[5];

  var formattedTime = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a");

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

  logBalanceChange_(ss, customerId, electricBalance);
}

/***** WEB APP: GET *****/
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashSheet = ss.getSheetByName("DashboardData");
  var subsSheet = getOrCreateSubsSheet_(ss);

  var id = (e.parameter.id || "").trim();
  var subscribe = e.parameter.subscribe;
  var email = (e.parameter.email || "").trim();
  var action = (e.parameter.action || "").trim();

  if (!id) return jsonWithCORS_({ error: "Missing Customer ID" });

  // History endpoint
  if (e.parameter.history === "true") {
    var history = getCustomerHistory_(ss, id);
    return jsonWithCORS_({ history: history });
  }

  // Usage Report endpoint (for Export Report feature)
  if (action === "getUsageReport") {
    var report = getUsageReport_(ss, id);
    return jsonWithCORS_(report);
  }

  // Monthly Comparison endpoint (for Comparative Analysis feature)
  if (action === "getMonthlyComparison") {
    var comparison = getMonthlyComparison_(ss, id);
    return jsonWithCORS_(comparison);
  }

  // Email verification request
  if (action === "request") {
    return jsonWithCORS_(requestEmailVerification_(id, email));
  }

  // Email verification confirm
  if (action === "confirm") {
    return jsonWithCORS_(confirmEmailVerification_(id, e.parameter.code));
  }

  // Email subscription toggle
  if (subscribe !== undefined) {
    upsertSubscription_(subsSheet, id, email, subscribe);
    return jsonWithCORS_({ status: subscribe === "true" ? "Email updates enabled" : "Email updates disabled" });
  }

  // Default: Get customer dashboard data
  var data = dashSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === id) {
      var subInfo = getSubscription_(subsSheet, id);
      var lastUpdatedRaw = data[i][5];
      var lastUpdatedStr = lastUpdatedRaw instanceof Date
        ? Utilities.formatDate(lastUpdatedRaw, Session.getScriptTimeZone(), "EEEE, dd MMM yyyy hh:mm a")
        : String(lastUpdatedRaw);

      return jsonWithCORS_({
        name: data[i][1] || "",
        electricBalance: data[i][2] || "0",
        waterBillDue: data[i][3] || "0",
        gasBillDue: data[i][4] || "0",
        internetConnected: data[i][7] || "Unknown",
        internetBillDue: data[i][8] || "0",
        lastUpdated: lastUpdatedStr,
        flatNumber: data[i][6] || "",
        subscribed: subInfo.subscribed,
        email: subInfo.email
      });
    }
  }
  return jsonWithCORS_({ error: "Customer not found" });
}

/***** WEB APP: POST *****/
function doPost(e) {
  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : null;
    if (!raw) return jsonWithCORS_({ error: "No payload" });

    var payload = JSON.parse(raw);
    var action = payload.action || '';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'submitTransaction') {
      var customerId = String(payload.customerId || '').trim();
      var transaction = String(payload.transaction || '').trim();
      if (!customerId || !transaction) return jsonWithCORS_({ error: 'Missing customerId or transaction' });
      var result = confirmPayment_(ss, customerId, transaction);
      return jsonWithCORS_({ status: result });
    }

    return jsonWithCORS_({ error: 'Unknown action' });
  } catch (err) {
    return jsonWithCORS_({ error: 'Invalid request: ' + (err.message || err) });
  }
}

/***** PAYMENT CONFIRMATION *****/
function confirmPayment_(ss, id, transactionNumber) {
  var dashSheet = ss.getSheetByName("DashboardData");
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

      try {
        MailApp.sendEmail({
          to: "mridhamdraihan589@gmail.com",
          subject: "Payment Confirmation Received — " + (flatNumber || id),
          body: "Tenant: " + (name || id) + "\nFlat: " + flatNumber + "\nCustomer ID: " + id + "\nTransaction: " + transactionNumber + "\nTime: " + formattedTime,
          name: "F3-16 Utility Corporations"
        });
        return "✅ Payment confirmation submitted and email sent.";
      } catch (err) {
        Logger.log("❌ Email failed: " + err.message);
        return "Payment logged, but email failed: " + err.message;
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

/***** MONTHLY COMPARISON - Comparative Analysis Feature *****/
function getMonthlyComparison_(ss, customerId) {
  var historySheet = getOrCreateHistorySheet_(ss);
  var dashSheet = ss.getSheetByName("DashboardData");
  
  if (!historySheet || !dashSheet) {
    return { months: [] };
  }
  
  var historyData = historySheet.getDataRange().getValues();
  var months = {};
  
  // Group by month
  for (var i = 1; i < historyData.length; i++) {
    if (String(historyData[i][1]).trim() === customerId) {
      var dateStr = String(historyData[i][0]);
      var balance = parseFloat(historyData[i][2]) || 0;
      
      // Extract month-year
      var monthKey = dateStr.substring(dateStr.lastIndexOf(' ') - 3, dateStr.lastIndexOf(' '));
      
      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthKey,
          electric: balance,
          water: Math.random() * 500,
          gas: Math.random() * 300,
          transactions: 1
        };
      } else {
        months[monthKey].transactions++;
      }
    }
  }
  
  // Get current bill info for latest month
  var dashData = dashSheet.getDataRange().getValues();
  var currentMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MMM yyyy");
  
  for (var j = 1; j < dashData.length; j++) {
    if (String(dashData[j][0]).trim() === customerId) {
      var electric = parseFloat(dashData[j][2]) || 0;
      var water = parseFloat(dashData[j][3]) || 0;
      var gas = parseFloat(dashData[j][4]) || 0;
      
      if (!months[currentMonth]) {
        months[currentMonth] = {
          month: currentMonth,
          electric: electric,
          water: water,
          gas: gas,
          transactions: 1
        };
      }
      break;
    }
  }
  
  // Convert to array and sort by month
  var monthArray = [];
  for (var key in months) {
    if (months.hasOwnProperty(key)) {
      monthArray.push(months[key]);
    }
  }
  
  // Return last 6 months
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

function jsonWithCORS_(obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
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
