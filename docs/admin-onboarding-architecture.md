# Admin Invite + Re-Onboarding Architecture

## Data Model

### `adminUsers/{emailLower}`
- `emailLower`: string
- `role`: `super_admin | content_admin | viewer`
- `active`: boolean
- `onboardingStatus`: `invited | pending | approved | revoked | deleted`
- `uid`: string (set after account setup)
- `inviteId`: string (latest invite used for onboarding)
- `invitedAt`, `inviteAcceptedAt`, `approvedAt`, `revokedAt`, `deletedAt`: ISO strings
- `approvedBy`: email
- `createdAt`, `updatedAt`, `createdBy`, `updatedBy`

### `adminInvites/{inviteId}`
- `emailLower`: string
- `role`: `super_admin | content_admin | viewer`
- `status`: `invited | accepted | superseded | revoked | deleted | expired`
- `invitedBy`: email
- `invitedAt`, `expiresAt`
- `acceptedAt`, `acceptedByUid`
- `invalidatedAt`, `invalidatedBy`, `invalidationReason`
- `supersededByInviteId`

### `adminUsersArchive/{archiveId}`
- Snapshot of deleted admin record for audit and recovery.

## Backend Enforcement (Current Implementation)

### Invite Flow
1. `POST /api/admin/admins`
2. Create a new invite (`adminInvites`) and invalidate previous open invites for the same email (`superseded`).
3. Upsert `adminUsers/{email}` to:
   - `onboardingStatus = invited`
   - `active = false`
   - `inviteId = <new invite id>`
4. Send branded invitation email with a link containing `invite=<inviteId>`.

### Signup / Registration Flow
1. `POST /api/admin/register/preflight` validates:
   - allowlist record exists
   - account is not revoked/deleted
   - invite is present and valid for invited/pending users
2. Client creates Firebase Auth user (email/password).
3. `POST /api/admin/register/complete`:
   - verifies ID token + invite
   - marks invite `accepted`
   - updates `adminUsers` to `pending`, `active=false`, binds `uid`
   - clears claims and revokes refresh tokens
4. User cannot receive admin session until approved.

### Approval Flow
1. Admin sets onboarding status to `approved` via `PATCH /api/admin/admins/[email]` (UI button: **Approve**).
2. Backend enforces:
   - approved status implies active session eligibility
   - custom claims set only when approved+active

### Login / Session Flow
1. `POST /api/admin/session` verifies Firebase ID token.
2. Server resolves admin by email/uid and allows session only if:
   - `active = true`
   - `onboardingStatus = approved`
3. Pending/invited/revoked/deleted users are rejected.

### Delete Flow (Hard Revoke + Soft Archive)
1. `DELETE /api/admin/admins/[email]`:
   - removes custom claims
   - revokes refresh tokens
   - deletes Firebase Auth user
   - revokes tracked sessions
   - invalidates open invites with `deleted`
   - archives and removes active admin record
2. Re-inviting later creates a fresh invite/onboarding path.

## Security Rules Guidance

Current `firestore.rules` already deny all admin writes from clients. Keep this default.

Recommended rule posture:
- Client reads only for published public collections.
- All admin lifecycle collections (`adminUsers`, `adminInvites`, `adminUsersArchive`, `adminSessions`) are server-only (Firebase Admin SDK).
- Do not grant client write access based on custom claims for these collections.

## Edge Cases Covered

- Same email invited multiple times:
  - Old invite links become `superseded`.
- Reinviting previously deleted user:
  - Old auth/session/claims removed on delete; new invite starts from `invited`.
- User changes email in Firebase:
  - Session gate rejects mismatched email and requires re-invite/re-approval.
- Old invite links:
  - Invalid once invite is accepted/superseded/revoked/deleted/expired.

## Client vs Backend Responsibilities

- Client:
  - Collect email/password and call backend endpoints.
  - Never marks status, claims, or invite validity.
- Backend:
  - Owns invite issuance, approval state transitions, deletion cleanup, and auth/session gating.
- Rules:
  - Enforce that admin lifecycle data is not writable/readable by clients directly.
