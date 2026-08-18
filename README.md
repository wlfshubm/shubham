# Shubham Mane — Portfolio

A developer portfolio built with plain HTML/CSS/JS, plus one Vercel serverless
function (`api/contact.js`) that sends contact-form messages by email via
[Resend](https://resend.com).

## Structure
```
portfolio/
├── index.html, projects.html, blog.html, contact.html, ...
├── styles.css / script.js
├── api/
│   └── contact.js    # POST /api/contact — sends the contact form via Resend
├── images/
├── package.json       # declares the `resend` dependency used by api/contact.js
├── .env.example        # env vars api/contact.js needs (copy to .env.local)
├── vercel.json          # tells Vercel this is a static site + functions
└── README.md
```

## Contact form setup
The contact page posts to `/api/contact`, a serverless function that emails
the message using Resend.

1. Create a free account at https://resend.com and grab an API key from
   https://resend.com/api-keys.
2. Copy `.env.example` to `.env.local` and fill in `RESEND_API_KEY`.
3. (Optional) Verify your own domain in Resend and set `CONTACT_FROM_EMAIL`
   to an address on it. Until then, the default shared sender
   (`onboarding@resend.dev`) only delivers to the email on your Resend
   account, which is fine for testing.
4. In Vercel, add the same environment variables under
   **Project → Settings → Environment Variables** before deploying.

If the request to `/api/contact` fails for any reason (e.g. offline), the
form falls back to opening the visitor's email client with a pre-filled
`mailto:` link, so it never leaves them stuck.

## Run locally
The static pages can be opened directly, but the contact form needs the
serverless function running, so use the Vercel CLI:
```bash
npm install
npm i -g vercel   # once
vercel dev
```
This serves the whole site (including `/api/contact`) at `http://localhost:3000`.

Static-only preview (no working contact form):
```bash
npx serve .
```

## Deploy to Vercel

### Option A — via GitHub (recommended)
1. Push this folder to a new GitHub repo (see steps below).
2. Go to https://vercel.com/new
3. Click **Import Project**, select your GitHub repo.
4. Framework preset: choose **Other** (or leave as detected — it's a static site, no build command needed).
5. Click **Deploy**. Vercel will give you a live URL immediately.
6. Any future `git push` to the main branch auto-redeploys.

### Option B — Vercel CLI (no GitHub needed)
```bash
npm i -g vercel
cd portfolio
vercel
```
Follow the prompts — it deploys straight from your machine.

## Push to GitHub
```bash
cd portfolio
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
(Create the empty repo on GitHub first at https://github.com/new — don't initialize it with a README there, to avoid a merge conflict.)
