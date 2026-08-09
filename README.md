# Shubham Mane — Portfolio

A single-page developer portfolio built with plain HTML/CSS/JS (no build step needed).

## Structure
```
portfolio/
├── index.html      # everything — markup, styles, and scripts
├── images/
│   └── profile.jpeg
├── vercel.json      # tells Vercel this is a static site
└── README.md
```

## Run locally
Just open `index.html` in a browser, or serve it:
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
