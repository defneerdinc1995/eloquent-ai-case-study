# Eloquent AI — Agent Deployment Manager Take-Home
**Prepared by: Defne Erdinc**
This repository contains two deliverables:

- **Part A — ITM transaction automation design:** [Read the PDF](ITM_Automation_Design.pdf).
- **Part B — ITM Operations web demo:** [Open the website](https://defneerdinc1995.github.io/eloquent-ai-case-study/).

## The web demo

The frontend is a static, dependency-free HTML/CSS/JavaScript application with synthetic ITM transactions, dashboard metrics, filter/search, and editable detail views for the first five rows. Saving edits recalculates KPIs and persists changes in the browser's `localStorage`. This is a demo and is **not connected to a banking system**.

## Run locally

The hosted site runs directly from the repository root using `index.html`, `styles.css`, `app.mjs`, and `data.mjs`. To serve locally, run a basic HTTP server in this directory, for example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## GitHub Pages setup

1. Upload the **contents** of this package to the repository root of the `main` branch (not the ZIP file).
2. Go to **Settings → Pages**.
3. In **Build and deployment**, choose **Deploy from a branch**. Select **main** and **/(root)**, then click **Save**.
4. After GitHub reports deployment success, open https://defneerdinc1995.github.io/eloquent-ai-case-study/ .

## Important limitation

The supplied reference at <https://project-eloquentcasestudy.magicpatterns.app/> was unavailable during implementation. The website is a functioning **alternative UI using synthetic data**, not a verified pixel-perfect copy and not formula-verified against the original. To fully meet Part B's requirements, inspect the original reference and adjust layouts, interactions, fixture data, and KPI formulas. Do not misrepresent the site as an exact reproduction.

## AI-use disclosure

AI tools were used to draft the design and generate the demo code and documentation. Review and verify assumptions, tests, and styling before final submission.
