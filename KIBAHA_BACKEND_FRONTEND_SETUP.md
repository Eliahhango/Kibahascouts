# Kibaha Backend + Frontend Configuration Guide

This guide explains exactly how to configure the project so backend logic works correctly and the frontend is connected end-to-end.

## 1. What is already Kibaha-only

The header district selector is now fixed to `Kibaha District` only.
No Bagamoyo/Kisarawe/Mkuranga selector options remain.

## 2. Prerequisites

1. Install Node.js `22+` and npm.
2. Install Firebase CLI:
   ```powershell
   npm install -g firebase-tools
   ```
3. Have access to a Firebase project dedicated to Kibaha.

## 3. Firebase project setup (required)

### 3.1 Authentication

1. Open Firebase Console -> `Authentication`.
2. Enable `Email/Password`.
3. Create at least one admin user email/password.

### 3.2 Firestore

1. Open `Firestore Database`.
2. Create database in Native mode.
3. Deploy rules/indexes from this repo:
   ```powershell
   firebase login
   firebase use <your-project-id>
   firebase deploy --only firestore:rules,firestore:indexes
   ```

### 3.3 Service account

1. Firebase Console -> Project settings -> `Service accounts`.
2. Generate a private key JSON.
3. Copy:
   - `project_id` -> `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` -> `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` -> `FIREBASE_ADMIN_PRIVATE_KEY` (keep `\n` escaped in `.env.local`)

## 4. Environment variables (required)

Copy `.env.example` to `.env.local` and fill all values.

```powershell
Copy-Item .env.example .env.local
```

### 4.1 Public app vars (frontend + server)

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `SAMPLE_MODE` (`false` for production)

### 4.2 Server vars (backend)

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

### 4.3 Optional bootstrap var

- `ADMIN_EMAILS`
  - Used only to seed first admin records when `adminUsers` collection is empty.

## 5. Firestore collections expected by backend

These collections are used by backend logic:

- `news`
- `events`
- `resources`
- `contactMessages`
- `adminUsers`
- `adminSessions`
- `adminLoginAttempts`
- `adminAuditLogs`
- `adminSecurityAlerts`

### 5.1 Minimum `adminUsers` record format

Document ID should be lowercase email, for example `admin@kibahascouts.org`.

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

## 6. Start and validate configuration

### 6.1 Validate env

```powershell
npm run validate-env
```

If anything is missing, build is blocked by design.

### 6.2 Run locally

```powershell
npm install
npm run dev
```

### 6.3 Build check (production-safe)

```powershell
npm run build
```

## 7. Backend <-> frontend connection checks

### 7.1 Public content flow

1. Add a published `news` document in Firestore.
2. Open `/newsroom`.
3. Confirm item appears on frontend.

### 7.2 Contact pipeline

1. Submit `/contact` form.
2. Confirm new document in `contactMessages`.
3. Open `/admin/messages` and confirm message appears.

### 7.3 Admin login/session

1. Open `/admin/login`.
2. Login with Firebase Auth user that exists in `adminUsers` and is `active: true`.
3. Confirm redirect to `/admin`.
4. Confirm dashboard counts load.

### 7.4 CSRF protection

All admin write endpoints require CSRF token (handled automatically by frontend helper).
If token is missing/invalid, API returns `403 Invalid CSRF token`.

### 7.5 RBAC checks

- `viewer`: read-only areas only.
- `content_admin`: content + messages management.
- `super_admin`: full access including `/admin/admins`.

## 8. Security behaviors now active

- Firebase Admin credentials validated on startup.
- Env validation fails build if required vars are missing.
- Login attempts are rate-limited and persisted in Firestore.
- Admin sessions are tracked (`adminSessions`) with device/IP/user-agent.
- Concurrent sessions per admin are limited.
- Logout invalidates tracked session.
- Auth and admin API activity is audited.
- Repeated failures can create security alerts.

## 9. Troubleshooting

### Error: `Environment validation failed`

- Check `.env.local` keys against `.env.example`.
- Re-run `npm run validate-env`.

### Error: `Email not found in admin allowlist`

- Add the email in `adminUsers` collection.
- Ensure document ID and `emailLower` are lowercase.
- Ensure `active` is `true`.

### Error: `Invalid CSRF token`

- Confirm request goes through frontend `adminFetch` helper.
- Refresh browser to renew CSRF cookie if needed.

### Error: login blocked by too many attempts

- Wait for lock window to expire, or clear `adminLoginAttempts` doc for that email+IP.

## 10. Recommended production checklist

1. `SAMPLE_MODE=false`.
2. Real Kibaha-only branding/content confirmed.
3. At least 2 active `super_admin` users.
4. Firestore rules/indexes deployed.
5. `npm run build` passes.
6. Test login, CRUD, logout, and session refresh on production URL.

