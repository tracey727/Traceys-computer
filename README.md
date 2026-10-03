> **Historical / reference web build.** This repository is an earlier GENEVIEVE Super Response web package. Latest web-lineage source: [genevieve-super-response.](https://github.com/tracey727/genevieve-super-response.). Keep this code for provenance and recovery; do not use its Vercel deployment instructions as the current ON TRACK by TRACE deployment standard.

# GENEVIEVE Super Response

A secure, GitHub-ready and Vercel-ready web application that asks OpenAI, Anthropic Claude and Google Gemini the same question in parallel, then uses one available provider to create a single combined answer.

## What was improved

- Rebuilt as a browser app that runs on Windows, macOS or Linux with Node.js 20 or newer.
- API keys stay on the server. They are never placed in `app.js`, HTML or browser storage.
- Each provider is optional. Missing keys are shown as unavailable rather than crashing the app.
- Provider calls run in parallel with timeouts and readable error messages.
- The synthesis provider can be automatic or chosen manually.
- If synthesis fails, the first successful provider answer is still returned.
- Includes a setup status endpoint, input limits, prompt-injection separation, security headers and no-store API caching.
- Includes a Progressive Web App manifest so the site can be installed from a supported desktop browser.
- Includes automated Node tests and a GitHub Actions workflow.
- Uses no third-party runtime packages, reducing deployment failures and dependency maintenance.

## Requirements for Tracey's Windows computer

1. Install the current Node.js LTS release.
2. Extract this project ZIP into its own folder.
3. Open the folder in File Explorer.
4. Click the address bar, type `powershell`, and press Enter.
5. Create your local environment file:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

6. Paste at least one real API key into `.env.local`, save it, then run:

```powershell
npm start
```

7. Open `http://localhost:3000` in Edge or Chrome.

No `pip`, Python virtual environment or provider SDK installation is required.

## API keys

Set any combination of these:

```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_google_gemini_key
APP_ACCESS_CODE=choose_a_private_code_for_the_web_app
```

`GOOGLE_API_KEY` is also accepted for compatibility with the earlier script.

Keep `.env.local` private. It is already excluded by `.gitignore`. Set `APP_ACCESS_CODE` before publishing a Vercel address so other people cannot spend your provider credits.

## Test before GitHub

```powershell
npm test
npm run check
```

Both commands must finish successfully.

## Put the project on GitHub

### Easiest method: GitHub website

1. Sign in to GitHub and create a new **private** repository named `genevieve-super-response`.
2. Do not add a README, `.gitignore` or licence during repository creation because this package already contains them.
3. Choose **uploading an existing file**.
4. Upload the contents of this extracted project folder, not the outer ZIP file.
5. Commit the files to the `main` branch.
6. Open the repository's **Actions** tab and confirm **Verify deployment build** is green.

### Git command method

```powershell
git init
git add .
git commit -m "Initial working GENEVIEVE Super Response app"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_ADDRESS
git push -u origin main
```

Never commit `.env.local`.

## Deploy through Vercel

1. Sign in to Vercel using the GitHub account that owns the repository.
2. Select **Add New → Project**.
3. Import the `genevieve-super-response` repository.
4. Leave the framework preset as **Other**. No build command or output directory is required.
5. Open **Environment Variables** before deploying and add your provider keys. Also add a strong `APP_ACCESS_CODE` for private access.
6. Add the same variables to Production, Preview and Development as appropriate.
7. Select **Deploy**.
8. After deployment, visit `/api/health` on the Vercel address. It should show at least one configured provider as `true` without displaying any key.
9. Open the main Vercel address, enter a question and confirm the combined response appears.

When an API key or model variable is changed in Vercel, redeploy so the new setting applies.

## Optional model changes

Models are environment variables so you can update them without editing the code:

```env
OPENAI_MODEL=gpt-5.4-mini
ANTHROPIC_MODEL=claude-sonnet-5
GEMINI_MODEL=gemini-3.6-flash
SYNTHESIS_PROVIDER=auto
```

A provider account must have access to the model selected. If a model is unavailable on your account, replace its value in `.env.local` and Vercel with a model your account can use.

## Project structure

```text
api/                    Vercel server functions
lib/                    Shared provider and synthesis logic
assets/                 GENEVIEVE emblem
scripts/                 Deployment validation
 tests/                  Automated tests
.github/workflows/       GitHub Actions checks
index.html               Web interface
app.js                   Browser behaviour
styles.css               Responsive design
server.mjs               Local Windows-compatible server
vercel.json              Vercel settings and security headers
```

## Important limits

- The app uses your own paid or trial API accounts. Provider usage and limits are controlled by those providers.
- Multi-model calls can cost more than one normal AI request because several providers are called, followed by a synthesis request.
- The app does not guarantee that an AI answer is correct. Important advice must be independently verified.
- This package is deploy-ready and locally tested, but a live Vercel deployment still requires access to your GitHub, Vercel and provider accounts.

## Ownership

Copyright © 2026 Tracey Ann Kennedy. GENEVIEVE App™. All rights reserved.
