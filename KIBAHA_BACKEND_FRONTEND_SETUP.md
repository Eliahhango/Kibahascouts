# Kibaha Backend + Frontend Setup (Vercel First)

This guide is rewritten for your current state:

- Your app is already deployed on Vercel.
- Firestore rules/indexes are already deployed.
- You have not added environment variables in Vercel yet.

Follow this guide from top to bottom.

## 1. Where You Are Right Now

As of this setup step, you already completed:

1. `firebase login`
2. `firebase use <your-project-id>`
3. `firebase deploy --only firestore:rules,firestore:indexes`

That part is done. The next blocker is Vercel environment variables.

## 2. Create Firebase Resources (If Not Done Yet)

### 2.1 Authentication

1. Open Firebase Console -> `Authentication`.
2. Enable `Email/Password`.
3. Create at least one admin user (email + password).

### 2.2 Firestore

1. Open `Firestore Database`.
2. Ensure database is created in Native mode.

### 2.3 Service Account Key

1. Firebase Console -> Project settings -> `Service accounts`.
2. Click `Generate new private key`.
3. Download the JSON key file.

You will copy these fields from the JSON:

- `project_id` -> `FIREBASE_ADMIN_PROJECT_ID`
- `client_email` -> `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` -> `FIREBASE_ADMIN_PRIVATE_KEY`

## 3. Add Variables In Vercel (Most Important Step)

Open Vercel -> your project -> `Settings` -> `Environment Variables`.

Add these variables for `Production`, `Preview`, and `Development`:

### 3.1 Required app + Firebase client vars

- `NEXT_PUBLIC_SITE_URL`
- `SAMPLE_MODE`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3.2 Required server vars

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
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

### 3.3 Optional vars

- `ADMIN_EMAILS` (optional bootstrap, only when `adminUsers` collection is empty)
- `CMS_BASE_URL` (optional)
- `CMS_API_TOKEN` (optional)

## 4. Correct Value Format (Avoid Common Failures)

### 4.1 `SAMPLE_MODE`

Use:

```env
SAMPLE_MODE=false
```

### 4.2 `NEXT_PUBLIC_SITE_URL`

For production, use your live URL, for example:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

If you do not have custom domain yet:

```env
NEXT_PUBLIC_SITE_URL=https://<your-vercel-project>.vercel.app
```

### 4.3 `FIREBASE_ADMIN_PRIVATE_KEY`

Use the private key from service account JSON in one line with `\n`.

Example:

```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...<rest-of-key>...\n-----END PRIVATE KEY-----\n"
```

Do not paste with real line breaks in Vercel. Keep `\n` escaped.

### 4.4 Safe defaults for security/rate-limit vars

```env
ADMIN_SESSION_COOKIE_NAME=kibaha_admin_session
ADMIN_SESSION_MAX_AGE_DAYS=5
ADMIN_MAX_CONCURRENT_SESSIONS=3
ADMIN_LOGIN_MAX_ATTEMPTS=5
ADMIN_LOGIN_WINDOW_MINUTES=15
ADMIN_SESSION_REFRESH_BEFORE_MINUTES=20
ADMIN_SECURITY_ALERT_THRESHOLD=8
ADMIN_SECURITY_ALERT_WINDOW_MINUTES=30
CONTACT_FORM_RATE_LIMIT_MAX=5
CONTACT_FORM_RATE_LIMIT_WINDOW_MS=900000
```

## 5. Local `.env.local` (Recommended for Testing Before Vercel Redeploy)

In project root:

```powershell
Copy-Item .env.example .env.local
```

Fill the same values locally, then run:

```powershell
npm install
npm run validate-env
npm run build
```

If this passes locally, Vercel build will usually pass after vars are set.

## 6. Redeploy On Vercel

After adding/changing env vars:

1. Go to Vercel -> `Deployments`.
2. Trigger `Redeploy` on the latest commit.
3. Wait for build to finish.

## 7. Firestore Collections Used By Backend

Expected collections:

- `news`
- `events`
- `resources`
- `mediaItems`
- `contactMessages`
- `adminUsers`
- `adminSessions`
- `adminLoginAttempts`
- `adminAuditLogs`
- `adminSecurityAlerts`

### 7.1 First admin record (`adminUsers`)

Document ID must be lowercase email (example: `admin@kibahascouts.org`).

```json
{
  "email": "admin@kibahascouts.org",
  "emailLower": "admin@kibahascouts.org",
  "role": "super_admin",
  "active": true,
  "createdAt": "2026-03-03T00:00:00.000Z",
  "updatedAt": "2026-03-03T00:00:00.000Z",
  "createdBy": "system",
  "updatedBy": "system"
}
```

Valid roles:

- `super_admin`
- `content_admin`
- `viewer`

## 8. Verify End-To-End

1. Open `/admin/login` and sign in with Firebase Auth user.
2. Confirm redirect to `/admin`.
3. Submit `/contact` form on frontend.
4. Confirm new doc appears in `contactMessages`.
5. Open `/admin/messages` and confirm message appears.
6. Add a published `news` doc and confirm it shows in `/newsroom`.

## 9. Troubleshooting (Vercel-Focused)

### Build fails with `Environment validation failed`

- At least one required env var is missing or invalid in Vercel.
- Re-check all required keys in section 3.
- Confirm numeric vars are numbers, not text labels.

### Runtime error around Firebase Admin credentials

- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, or `FIREBASE_ADMIN_PRIVATE_KEY` is wrong.
- Regenerate service account key and paste again.
- Ensure private key contains `BEGIN PRIVATE KEY` and uses `\n`.

### Login works in Firebase Auth but blocked in app

- User must also exist in `adminUsers`.
- `adminUsers` doc ID must be lowercase email.
- `active` must be `true`.

### `Invalid CSRF token` on admin write actions

- Refresh page and try again.
- Ensure requests are sent through frontend admin helper.

## 10. Production Checklist

1. `SAMPLE_MODE=false` on Vercel.
2. All required env vars set in Vercel for `Production`.
3. Firestore rules/indexes deployed.
4. At least 2 active `super_admin` users.
5. Latest Vercel deployment is successful.
6. Admin login, CRUD, logout, and contact flow all tested on live URL.
