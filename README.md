# DIU Agricultural Science Routine (AGS Routine)

A mobile-friendly Progressive Web App (PWA) and automated PDF-to-JSON publishing portal built for the **Department of Agricultural Science, Daffodil International University (DIU)**.

## Features
- **Student Schedule Lookup:** Instant multi-section filtering (including retake/overlap courses) with `All Labs / Group 1 / Group 2` practical toggles.
- **Faculty Schedule View:** Teacher search by name or initial with Day/Week views and teaching workload summaries.
- **One-Click A4 PDF Export:** Print-ready A4 routine sheets formatted with official university and department branding.
- **Zero-Cost Admin Publisher (`/admin`):** Client-side PDF coordinate parser (`pdfjs-dist`) that extracts classes, rooms, and faculty from department routine PDFs and publishes updates automatically via GitHub.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **PDF Parsing:** `pdfjs-dist`
- **Hosting & Automation:** Vercel Serverless Functions + GitHub Contents API

## Developer
**Md Minhajul Islam** — Teaching Assistant, Department of Agricultural Science, DIU
