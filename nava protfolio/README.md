# Navateja Kakani — SAP Basis Portfolio

Professional single-page portfolio for **Navateja Kakani, SAP Basis Consultant (HANA / S/4HANA / Production Support)**.

**Stack:** HTML5 + CSS3 + vanilla JavaScript — no framework, no build step.
Inspired by top SAP consultant sites (fabiankehlenbeck.de, sanerdemirel.com, markus-mildner.com) + modern portfolio best practices: sticky nav, hero + stats, skills grid, experience timeline, expertise accordions, cloud section, contact form, responsive + print-to-PDF résumé.

## Run locally
Just open `index.html` in a browser, or:
```bash
npx serve "nava protfolio"
# or
python -m http.server 8000
```

## Deploy
- **GitHub Pages:** repo Settings → Pages → Deploy from branch → `main` → folder `/nava protfolio` (or `/` if moved to root).
- **Vercel:** import repo, framework = Other, output = `nava protfolio`.

## Files
- `index.html` — content + SEO meta
- `styles.css` — theme (SAP blue #0A6ED1, navy, gold), responsive, print styles
- `script.js` — nav, reveal, counters, filters, accordions, mailto form
