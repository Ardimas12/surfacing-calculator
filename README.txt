Surfacing Calculator - Static site
-----------------------------------
This is a minimal static site (HTML/CSS/JS) demo for the Surfacing Calculator.
It implements formulas you provided and generates results and a PDF export.

How to run locally:
1. unzip the package and open index.html in a browser
OR
2. serve with a simple http server:
   python3 -m http.server 8000
   then open http://localhost:8000

How to deploy to Vercel:
- Create a new project on Vercel, link to a GitHub repo containing these files OR
- Drag & drop the folder into Vercel's "Import Project" or use Vercel CLI.

Notes:
- This is a client-side calculator (no backend).
- Formula implementations follow the document provided by the user.
