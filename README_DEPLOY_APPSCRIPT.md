Deploying the Apps Script with clasp
===================================

This repository includes an `apps-script/` folder prepared for deployment via `clasp`.

Steps (local):

1. Install clasp:

```bash
npm install -g @google/clasp
clasp --version
```

2. Create a Google Cloud service account with Drive/Script/Sheets permissions and download JSON credentials.

3. In the repo root, update `.clasp.json` or set GitHub Secrets:
   - Locally: replace `ENTER_YOUR_SCRIPT_ID` with your Apps Script project id.
   - GitHub Actions: set `CLASP_CREDENTIALS` (contents of credentials JSON) and `CLASP_SCRIPT_ID` secrets.

4. Push from your machine:

```bash
# Login using service account credentials (one-time)
cat path/to/creds.json > creds.json
npx @google/clasp login --creds creds.json

# Push
npx @google/clasp push --rootDir=apps-script
```

CI: The GitHub Actions workflow `.github/workflows/deploy-apps-script.yml` will run on push to `main` and deploy using secrets `CLASP_CREDENTIALS` and `CLASP_SCRIPT_ID` (if configured).

Notes:
- The `apps-script/Code.gs` file is currently a wrapper; after deployment you may want to replace it with the full `APPSCRIPT_COMPLETE.gs` body.
- Keep secrets secure. If you prefer manual deploys, set `.clasp.json` locally and run `clasp push`.
