# Kibaha Scouts Website

Official digital platform for **Tanzania Scouts Association - Kibaha District**.

## Live Site
- Production: [https://kibahascouts.vercel.app](https://kibahascouts.vercel.app)

## Tech Stack
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Firebase Auth + Firestore + Storage
- Vercel hosting

## What This Project Includes
- Public website pages: Home, About, Programmes, Newsroom, Events, Resources, Join, Contact
- Admin panel for content management
- Role-based access (`super_admin`, `content_admin`, `viewer`)
- Session/audit/security controls
- Firebase-backed CMS reads with fallback hardening

## Main Routes
- `/`
- `/about`
- `/programmes`
- `/newsroom`
- `/events`
- `/resources`
- `/join`
- `/contact`
- `/admin/login`
- `/admin/register`
- `/admin`

## Project Preview
![Homepage Hero](public/images/hero-scouts.jpg)
![News Preview](public/images/news/tree-planting.jpg)

## Local Development
```bash
npm install
npm run dev
```

Build (with env validation):
```bash
npm run build
```

Lint:
```bash
npm run lint
```

## Environment Setup
1. Copy environment template:
```bash
cp .env.example .env.local
```
(Windows PowerShell)
```powershell
Copy-Item .env.example .env.local
```

2. Fill required values in `.env.local`:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `ADMIN_EMAILS`

Optional but recommended:
- `SAMPLE_MODE=false`
- `ADMIN_SESSION_MAX_AGE_DAYS` or `ADMIN_SESSION_MAX_AGE_HOURS`

## Firebase Deployment
Deploy rules/indexes:
```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only storage
```

## Admin Onboarding
1. Add admin record in `adminUsers` collection (lowercase email as doc id).
2. Set role (`super_admin`, `content_admin`, or `viewer`).
3. User completes first signup at `/admin/register`.
4. Normal login at `/admin/login`.

## Security + Operations Notes
- Admin session docs are tracked in `adminSessions`.
- Expired/revoked sessions can be purged via API: `POST /api/admin/sessions/purge`.
- Public CMS reads use fallback data when Firebase is unavailable.
- Firebase Storage image uploads require authenticated write + storage rules.

## Deployment (Vercel)
1. Import repo in Vercel.
2. Add all required env vars to Production + Preview.
3. Redeploy after env updates.

## Developer
Built and maintained by **Eliahhango**
- GitHub: [github.com/Eliahhango](https://github.com/Eliahhango)
- LinkedIn: [linkedin.com/in/eliahhango](https://www.linkedin.com/in/eliahhango/)
- Website: [elitechwiz.site](https://www.elitechwiz.site)
- YouTube: [youtube.com/@eliahhango](https://youtube.com/@eliahhango)
