<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1f6f5f,100:2b4c8c&height=220&section=header&text=Kibaha%20Scouts%20Website&fontSize=42&fontColor=ffffff&animation=fadeIn" alt="Kibaha Scouts Website Banner" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Poppins&size=24&duration=2400&pause=900&color=1F6F5F&center=true&vCenter=true&width=900&lines=Kibaha+District+Scouts+Official+Digital+Platform;News+%7C+Events+%7C+Resources+%7C+Admin+CMS;Built+for+real+community+impact" alt="Typing Animation" />
</div>

## Kibaha Scouts Website

This project is the official digital platform for **Kibaha District Scouts**.  
It helps the district share trusted updates, publish events, provide resources, and manage communication with members and the public.

## What This Platform Supports

- Public pages for news, events, resources, contact, and district information
- Admin panel for managing news, events, media, resources, and messages
- Role-based admin access with Firebase Authentication + Firestore allowlist
- Security tracking for sessions, login attempts, and audit logs
- Deployment-ready setup for local development and Vercel production

## Quick Start

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
```

## Firebase and Admin Setup

1. Enable Email/Password sign-in in Firebase Authentication.
2. Create Firestore database in Native mode.
3. Deploy Firestore rules and indexes from this repo.
4. Add required environment variables from `.env.example`.
5. Add admin emails in `adminUsers`.
6. First-time invited admins use `/admin/register`, then continue with `/admin/login`.

## Deployment

- Deploy on Vercel
- Add the same environment variables to Vercel (Production and Preview)
- Redeploy after every environment change

## Special Thanks

Special thanks to **Eliahhango** for the development, vision, and continuous improvement of this platform.

Developer profiles:

- GitHub: [github.com/Eliahhango](https://github.com/Eliahhango)
- LinkedIn: [linkedin.com/in/eliahhango](https://www.linkedin.com/in/eliahhango/)
- Website: [elitechwiz.site](https://www.elitechwiz.site)
- YouTube: [youtube.com/@eliahhango](https://youtube.com/@eliahhango)

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2b4c8c,100:1f6f5f&height=120&section=footer" alt="Footer Banner" />
</div>
