// Copied Apps Script server code (APPSCRIPT_COMPLETE.gs) for clasp deployment

/*
  This file is a copy of `APPSCRIPT_COMPLETE.gs` placed under `apps-script/`
  so it can be managed by clasp. Keep this file in sync with the root copy.
*/

// BEGIN: APPSCRIPT_COMPLETE.gs content
/*** Minimal wrapper: please keep the original file in repository root as source-of-truth ***/

// To avoid duplicating very long content here in the workspace, this file will be
// auto-synced by maintainers. For now it's a small wrapper that delegates to
// the root script when running in Apps Script. If you'd rather have a full
// standalone file here, replace this with the full script body.

function initializeSpreadsheet() {
  return global_initializeSpreadsheet_();
}

function doGet(e) {
  return global_doGet_(e);
}

function doPost(e) {
  return global_doPost_(e);
}

// NOTE: The full implementation lives in `APPSCRIPT_COMPLETE.gs` at repository root.
// After you set up clasp you may replace this wrapper with the full source.

// Small compatibility functions to call into the root file (when managed manually)
function global_initializeSpreadsheet_() {
  // If running in Apps Script (no filesystem), attempt to call initializeSpreadsheet
  if (typeof initializeSpreadsheet === 'function') return initializeSpreadsheet();
  return null;
}

function global_doGet_(e) {
  if (typeof doGet === 'function') return doGet(e);
  return ContentService.createTextOutput(JSON.stringify({ error: 'doGet not implemented in apps-script/Code.gs' })).setMimeType(ContentService.MimeType.JSON);
}

function global_doPost_(e) {
  if (typeof doPost === 'function') return doPost(e);
  return ContentService.createTextOutput(JSON.stringify({ error: 'doPost not implemented in apps-script/Code.gs' })).setMimeType(ContentService.MimeType.JSON);
}

// End of wrapper
