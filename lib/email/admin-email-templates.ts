import "server-only"

import { siteConfig } from "@/lib/site-config"
import { getSiteUrl } from "@/lib/site-url"

type EmailTemplate = {
  subject: string
  html: string
  text: string
}

type AdminInvitationEmailParams = {
  recipientEmail: string
  roleLabel: string
  invitedByEmail: string
  registerUrl: string
  loginUrl: string
}

type PasswordResetEmailParams = {
  recipientEmail: string
  resetUrl: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  const base = getSiteUrl()
  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
  return `${base}${normalizedPath}`
}

function buildShell(params: {
  heading: string
  preview: string
  bodyHtml: string
  actionLabel: string
  actionUrl: string
  footerNote?: string
}) {
  const primaryLogo = toAbsoluteUrl(siteConfig.branding.primaryLogo)
  const tanzaniaLogo = toAbsoluteUrl(siteConfig.branding.footerCenterLogo)
  const actionUrl = params.actionUrl
  const heading = escapeHtml(params.heading)
  const preview = escapeHtml(params.preview)
  const actionLabel = escapeHtml(params.actionLabel)
  const footerNote = escapeHtml(params.footerNote || "This is an official message from Kibaha Scouts administration.")
  const safeActionUrl = escapeHtml(actionUrl)
  const safePrimaryLogo = escapeHtml(primaryLogo)
  const safeTanzaniaLogo = escapeHtml(tanzaniaLogo)

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f6f2;font-family:Arial,Helvetica,sans-serif;color:#1b2822;">
    <span style="display:none !important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${preview}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;background:#f5f6f2;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #d3ddd5;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:linear-gradient(90deg,#1e3a2f,#2d5a3d,#1e3a2f);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <img src="${safePrimaryLogo}" alt="Kibaha Scouts logo" style="height:48px;width:48px;border-radius:999px;border:2px solid rgba(255,255,255,0.55);object-fit:cover;" />
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <img src="${safeTanzaniaLogo}" alt="Tanzania Scouts logo" style="height:48px;width:48px;object-fit:contain;background:#fff;border-radius:8px;padding:4px;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 18px;">
                <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;color:#1b2822;">${heading}</h1>
                ${params.bodyHtml}
                <div style="margin-top:24px;">
                  <a href="${safeActionUrl}" style="display:inline-block;padding:12px 18px;background:#1e3a2f;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;">
                    ${actionLabel}
                  </a>
                </div>
                <p style="margin:16px 0 0;font-size:12px;line-height:1.55;color:#58685f;">
                  If the button does not open, copy and paste this link in your browser:<br />
                  <a href="${safeActionUrl}" style="color:#1e3a2f;word-break:break-all;">${safeActionUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px;background:#f5f6f2;border-top:1px solid #d3ddd5;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#58685f;">
                  ${footerNote}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim()
}

export function buildAdminInvitationEmail(params: AdminInvitationEmailParams): EmailTemplate {
  const subject = "You have been invited to Kibaha Scouts Admin Portal"
  const safeRecipientEmail = escapeHtml(params.recipientEmail)
  const safeRoleLabel = escapeHtml(params.roleLabel)
  const safeInvitedByEmail = escapeHtml(params.invitedByEmail)
  const safeLoginUrl = escapeHtml(params.loginUrl)
  const preview = `Admin invitation for ${safeRecipientEmail}`
  const bodyHtml = `
<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#1b2822;">
  Hello,
</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#1b2822;">
  You have been invited to manage content for <strong>${escapeHtml(siteConfig.name)}</strong> under the role <strong>${safeRoleLabel}</strong>.
</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#1b2822;">
  Invitation sent by: <strong>${safeInvitedByEmail}</strong>
</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#1b2822;">
  If this is your first time, set your password first. After setup, your account stays pending until a super admin approves access.
</p>
<p style="margin:0;font-size:14px;line-height:1.7;color:#1b2822;">
  Direct sign-in link: <a href="${safeLoginUrl}" style="color:#1e3a2f;">${safeLoginUrl}</a>
</p>
`.trim()

  const html = buildShell({
    heading: "Admin Invitation",
    preview,
    bodyHtml,
    actionLabel: "Set Your Password",
    actionUrl: params.registerUrl,
    footerNote:
      "If you were not expecting this invitation, please ignore this email and contact Kibaha Scouts support.",
  })

  const text = [
    "Admin Invitation",
    "",
    `You have been invited to manage ${siteConfig.name}.`,
    `Role: ${params.roleLabel}`,
    `Invitation sent by: ${params.invitedByEmail}`,
    "",
    `Set password: ${params.registerUrl}`,
    `Sign in: ${params.loginUrl}`,
  ].join("\n")

  return { subject, html, text }
}

export function buildAdminPasswordResetEmail(params: PasswordResetEmailParams): EmailTemplate {
  const subject = "Reset your Kibaha Scouts admin password"
  const safeRecipientEmail = escapeHtml(params.recipientEmail)
  const preview = `Password reset for ${safeRecipientEmail}`
  const bodyHtml = `
<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#1b2822;">
  Hello,
</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#1b2822;">
  We received a request to reset your <strong>${escapeHtml(siteConfig.name)}</strong> admin password.
</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#1b2822;">
  For security, this link may expire shortly. If you did not request this change, you can ignore this email.
</p>
`.trim()

  const html = buildShell({
    heading: "Password Reset Request",
    preview,
    bodyHtml,
    actionLabel: "Reset Password",
    actionUrl: params.resetUrl,
    footerNote:
      "This reset message is for authorized Kibaha Scouts administrators only. Keep your account credentials private.",
  })

  const text = [
    "Password Reset Request",
    "",
    `We received a request to reset the admin password for ${params.recipientEmail}.`,
    `Reset link: ${params.resetUrl}`,
    "",
    "If you did not request this, ignore this email.",
  ].join("\n")

  return { subject, html, text }
}
