# Kibaha Scouts Website

Production-ready Next.js (App Router) website with:

- Public institutional pages (news, events, resources, safety, join, contact)
- Firebase Firestore content backend with sample fallback mode
- Contact pipeline (`/api/contact`) with validation, honeypot, and rate limiting
- Internal admin panel (`/admin`) with Firebase Auth session + allowlist protection
- Admin CRUD for news, events, resources and inbox management for contact messages

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Firebase Client SDK (Auth login)
- Firebase Admin SDK (server-side Firestore + session verification)
- Zod validation

## 1. Firebase Setup

1. Create a Firebase project in Firebase Console.
2. Enable **Authentication -> Sign-in method -> Email/Password**.
3. Create **Firestore Database** (Native mode).
4. Create a service account key:
   - Firebase Console -> Project settings -> Service accounts -> Generate new private key.
5. Save project credentials for environment variables.

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill all required values.

### Required Variables

- `NEXT_PUBLIC_SITE_URL`
- `SAMPLE_MODE` (`true` to force sample content, `false` for Firestore-first)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY` (keep escaped `\n` in env var value)
- `ADMIN_SESSION_COOKIE_NAME`
- `ADMIN_SESSION_MAX_AGE_DAYS`
- `ADMIN_MAX_CONCURRENT_SESSIONS`
- `ADMIN_LOGIN_MAX_ATTEMPTS`
- `ADMIN_LOGIN_WINDOW_MINUTES`
- `ADMIN_SESSION_REFRESH_BEFORE_MINUTES`
- `ADMIN_SECURITY_ALERT_THRESHOLD`
- `ADMIN_SECURITY_ALERT_WINDOW_MINUTES`
- `CONTACT_FORM_RATE_LIMIT_MAX`
- `CONTACT_FORM_RATE_LIMIT_WINDOW_MS`

Optional legacy vars (kept for compatibility):

- `CMS_BASE_URL`
- `CMS_API_TOKEN`
- `ADMIN_EMAILS` (optional bootstrap seeding only when `adminUsers` collection is empty)

## 3. Local Development

```bash
npm install
npm run dev
```

Production build check:

```bash
npm run build
npm run start
```

## 4. Create First Admin User

1. In Firebase Console -> Authentication, create a user with email/password.
2. Seed first admin access by setting `ADMIN_EMAILS` for initial bootstrap, or insert a document into Firestore `adminUsers` collection keyed by lowercase email.
3. Start app and go to `/admin/login`.
4. Sign in with that account.
5. Use `/admin/admins` to manage admin users and roles in Firestore (`super_admin`, `content_admin`, `viewer`).

## 5. Firestore Rules and Indexes

This repo includes:

- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`

Deploy rules/indexes with Firebase CLI:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes
```

## 6. Vercel Deployment

1. Import repository in Vercel.
2. Add all environment variables for **Production** and **Preview**.
3. Set `NEXT_PUBLIC_SITE_URL`:
   - Production: your real domain
   - Preview: Vercel preview URL if desired
4. Deploy.

## 7. Content Governance Notes

- Do not publish unverifiable claims.
- Keep placeholders for unknown facts:
  - `[CONFIRM PHONE]`
  - `[CONFIRM EMAIL]`
  - `[INSERT REAL STATS]`
- Replace sample content before production publication.

## 8. Quick QA Checklist

- Public routes load with no 404s.
- Footer/header links resolve to valid routes.
- `/contact` form submits and stores data in Firestore.
- `/admin` redirects to `/admin/login` when not authenticated.
- Non-allowlisted emails in Firestore `adminUsers` are rejected for admin session creation.
- Admin CRUD works for news, events, resources.
- Admin inbox status updates work (`unread` / `read` / `replied`).
- `npm run build` passes.
