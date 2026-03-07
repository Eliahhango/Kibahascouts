# Kibaha Scouts Setup Guide (Backend + Frontend)

This setup guide is aligned to the current Kibaha Scouts codebase.

## 1. Prerequisites
- Node.js 20+
- npm
- Firebase CLI (`npm i -g firebase-tools`)
- A Firebase project
- A Vercel project (for production deployment)

## 2. Install Dependencies
```bash
npm install
```

## 3. Environment Configuration
Create local environment file:
```bash
cp .env.example .env.local
```
Windows PowerShell:
```powershell
Copy-Item .env.example .env.local
```

Fill required values:
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

Recommended defaults:
- `SAMPLE_MODE=false`
- `ADMIN_SESSION_MAX_AGE_HOURS=8`
- (optional backward compatibility) `ADMIN_SESSION_MAX_AGE_DAYS`

> `FIREBASE_ADMIN_PRIVATE_KEY` should be pasted with escaped `\n` newlines.

## 4. Firebase Console Setup
### 4.1 Authentication
- Enable **Email/Password** sign-in method.

### 4.2 Firestore
- Create Firestore database in Native mode.

### 4.3 Storage
- Enable Firebase Storage.
- Project includes `storage.rules` for image uploads under `/uploads/**`.

## 5. Deploy Firebase Rules + Indexes
```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only storage
```

## 6. Validate + Build Locally
```bash
npm run validate-env
npm run build
```

Run local dev:
```bash
npm run dev
```

## 7. Admin Bootstrap
Create first admin in Firestore collection: `adminUsers`

- Document ID: lowercase email (example: `admin@kibahascouts.org`)
- Suggested fields:
```json
{
  "email": "admin@kibahascouts.org",
  "emailLower": "admin@kibahascouts.org",
  "role": "super_admin",
  "active": true,
  "createdAt": "2026-03-07T00:00:00.000Z",
  "updatedAt": "2026-03-07T00:00:00.000Z",
  "createdBy": "system",
  "updatedBy": "system"
}
```

Valid roles:
- `super_admin`
- `content_admin`
- `viewer`

## 8. End-to-End Checks
1. Open `/admin/login` and sign in.
2. Confirm redirect to `/admin`.
3. Open homepage and verify CMS data renders.
4. Test image upload in admin managers.
5. Confirm uploaded image URLs load publicly.
6. Verify contact form submissions appear in Firestore.

## 9. Session Cleanup Operations
To manually purge stale admin sessions:
```bash
curl -X POST https://<your-domain>/api/admin/sessions/purge
```

(Requires authenticated admin request with `admins:manage` permission.)

## 10. Vercel Deployment Setup
1. Import repository into Vercel.
2. Add all env vars from section 3 to **Production** and **Preview**.
3. Redeploy after env changes.

## 11. Troubleshooting
### Homepage returns 500
- Check Firebase env vars and service account values.
- App now uses fallback data for CMS reads if Firestore fails.

### Firebase images fail to load
- Verify `firebasestorage.googleapis.com` URLs are correct.
- Confirm Storage is enabled and `firebase deploy --only storage` was run.

### Admin login/session issues
- Verify `adminUsers` record exists and `active=true`.
- Check session/cookie env values.

### Build fails on env validation
- Run `npm run validate-env` locally and fix missing/invalid vars.
