# Playwright Trigger and Notification Setup

This project now includes a workflow at `.github/workflows/playwright.yml` with:

- Manual trigger (`workflow_dispatch`)
- Scheduled trigger (weekdays)
- Parallel run support (`workers` input)
- Artifact publishing (`playwright-report`, `test-results`)
- Optional Teams notification
- Optional email summary

## 1) Required GitHub Secrets

Go to **Repo Settings -> Secrets and variables -> Actions -> New repository secret**.

Add:

- `GTP_URL` (example: `https://prod.gotestpro.com/`)
- `GTP_USERNAME`
- `GTP_PASSWORD`
- `GTP_PROJECT` (example: `Amazon`)

## 2) Optional Teams Notification

Create a Teams Incoming Webhook URL and store it as:

- `TEAMS_WEBHOOK_URL`

If set, each run posts a **rich execution summary** to Teams (similar to GoTestPro results):

- Pass/fail banner and pass rate
- Project, browser, executed time, total duration
- Summary table (scripts/scenarios passed/failed/skipped)
- Per-script blocks with scenario status table
- Link to GitHub Actions run

**Webhook type:** use a **Power Automate** incoming webhook (recommended) so Adaptive Cards render fully.  
Legacy Office 365 connector webhooks may not show tables; set env `TEAMS_CARD_FORMAT=messagecard` for a simpler fallback.

Local preview:

```bash
npx playwright test tests/GTP-LoginFlow/gtplogin.spec.ts --project=chromium
npm run report:teams
```

## 3) Optional Email Notification

Add SMTP secrets:

- `SMTP_SERVER` (example: `smtp.office365.com`)
- `SMTP_PORT` (example: `587`)
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `EMAIL_TO` (recipient)
- `EMAIL_FROM` (optional; defaults to SMTP username)

If these are set, an email summary is sent after each run.

## 4) How to Trigger Without CLI

### Manual

1. Open **Actions** tab in GitHub.
2. Select **Playwright Regression** workflow.
3. Click **Run workflow**.
4. Set:
   - `suite` (default `tests`)
   - `workers` (default `4`)

### Scheduled

Runs automatically on weekdays based on cron in workflow.

## 5) Trigger from Teams (No CLI)

Use Power Automate (example: team **GoTestPro Playwright Test Automation**, channel **GoTestPro Playwright Test Automation Results**).

1. Trigger: **When a new channel message is added** (Microsoft Teams). Select the same team and channel as above.
2. **Condition:** dynamic field **Message** or **Message plain text** **contains** `Girish_PW_TA` (change this string in the flow if you change the keyword).
3. **If yes** → add **HTTP** action:
   - **Method:** `POST`
   - **URI:** `https://api.github.com/repos/girishkanta1994-boop/GTP_QA/actions/workflows/playwright.yml/dispatches`
   - **Headers:**
     - `Accept`: `application/vnd.github+json`
     - `X-GitHub-Api-Version`: `2022-11-28`
     - `Authorization`: `Bearer <your fine-grained PAT>` (store only in the flow; never commit)
     - `Content-Type`: `application/json`
   - **Body:**
     ```json
     {
       "ref": "main",
       "inputs": {
         "suite": "tests",
         "workers": "4"
       }
     }
     ```
4. Save and turn the flow **On**. Post a message that contains `Girish_PW_TA` in that channel to trigger a run.

**GitHub:** host is `github.com` → API base `https://api.github.com`. The secret in the repo for Teams posts after the run must be named **`TEAMS_WEBHOOK_URL`** (not a custom name), or the workflow will skip the Teams notification step.

## 6) Where to See Results

- Run summary: GitHub Actions run page
- HTML report: artifact `playwright-report`
- Raw outputs: artifact `test-results`
