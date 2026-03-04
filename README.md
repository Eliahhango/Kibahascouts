<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1f6f5f,50:2b4c8c,100:1f6f5f&height=230&section=header&text=Kibaha%20Scouts%20Website&fontSize=44&fontColor=ffffff&animation=fadeIn" alt="Kibaha Scouts Website Banner" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Poppins&size=24&duration=2200&pause=800&color=1F6F5F&center=true&vCenter=true&width=980&lines=Official+Digital+Platform+for+Kibaha+District+Scouts;News+%7C+Events+%7C+Resources+%7C+Admin+CMS;Built+with+Next.js+%2B+Firebase+%2B+Vercel" alt="Typing Animation" />
</div>

<div align="center">
  <a href="https://kibahascouts.vercel.app"><img src="https://img.shields.io/badge/Live%20Site-kibahascouts.vercel.app-1f6f5f?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Site Badge" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js Badge" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-ffca28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Badge" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready-2b4c8c?style=for-the-badge" alt="Status Badge" />
</div>

---

## Overview

**Kibaha Scouts Website** is the official web platform for Kibaha District Scouts.  
It centralizes district communication through verified news, event publishing, resource sharing, contact workflows, and a protected admin CMS.

## Preview

<table>
  <tr>
    <td><img src="public/images/hero-scouts.jpg" alt="Kibaha Scouts Hero" width="100%" /></td>
    <td><img src="public/images/news/tree-planting.jpg" alt="Kibaha Scouts News" width="100%" /></td>
  </tr>
  <tr>
    <td align="center"><strong>Homepage Experience</strong></td>
    <td align="center"><strong>News and Community Stories</strong></td>
  </tr>
</table>

## Platform Highlights

| Module | Description |
| --- | --- |
| Public Website | Newsroom, Events, Resources, About, Programmes, Contact |
| Admin CMS | Create, edit, publish, unpublish, and delete content |
| Access Control | Role-based permissions (`super_admin`, `content_admin`, `viewer`) |
| Security Layer | Session tracking, login attempt limits, audit logs, block rules |
| Media Support | Video/gallery entries with embed-ready links |
| Deployment | Optimized for Vercel + Firebase backend services |

## Architecture

```mermaid
flowchart LR
    U[Public Users] --> W[Next.js Frontend]
    A[Admin Users] --> P[Admin Panel]
    W --> API[Next.js API Routes]
    P --> API
    API --> FA[Firebase Auth]
    API --> FS[Firestore Database]
    API --> SEC[Security Logs and Alerts]
```

## Main Routes

| Area | Route |
| --- | --- |
| Home | `/` |
| Newsroom | `/newsroom` |
| Events | `/events` |
| Resources | `/resources` |
| Admin Login | `/admin/login` |
| Admin Registration (Invited Admins) | `/admin/register` |
| Admin Dashboard | `/admin` |
| Security Center | `/admin/security` |

## Local Development

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Firebase Setup

1. Create Firebase project.
2. Enable `Email/Password` in Authentication.
3. Create Firestore in Native mode.
4. Deploy repo Firestore config:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes
```

5. Copy `.env.example` to `.env.local` and fill all required variables.
6. Add admin records in `adminUsers` collection.

## Admin Onboarding Flow

1. Super admin allowlists admin email in `adminUsers`.
2. Invited admin opens `/admin/register` to set password once.
3. Admin logs in normally at `/admin/login` afterward.

## Vercel Deployment

1. Import this repository in Vercel.
2. Add all environment variables to Production and Preview.
3. Redeploy whenever environment values change.

## Developer Credit

Special thanks to **Eliahhango** for the development, architecture decisions, implementation, and continuous platform improvement.

Developer profiles:

- GitHub: [github.com/Eliahhango](https://github.com/Eliahhango)
- LinkedIn: [linkedin.com/in/eliahhango](https://www.linkedin.com/in/eliahhango/)
- Website: [elitechwiz.site](https://www.elitechwiz.site)
- YouTube: [youtube.com/@eliahhango](https://youtube.com/@eliahhango)

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2b4c8c,50:1f6f5f,100:2b4c8c&height=120&section=footer" alt="Footer Banner" />
</div>
