# TSA Kibaha District Website

Modern, mobile-first, accessible public website for **Tanzania Scouts Association (TSA) - Kibaha District** built with:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- CMS-ready data layer with local fallback content

## Features Included

- WHO-style institutional homepage layout patterns (cards/modules, not copied branding)
- Sticky header with:
  - District selector (Kibaha default + future district placeholders)
  - English / Kiswahili switcher (sitewide preference)
  - Global search with autocomplete + category filters
- Mega-menu primary navigation with all requested sections
- Full page set:
  - Home
  - About TSA Kibaha
  - Programmes + section detail pages
  - Scout Units + unit profile pages
  - Newsroom + article pages + press/download section
  - Events list/calendar + event detail page
  - Resources document library with filters
  - Safety & Youth Protection
  - Join / Volunteer
  - Contact
- Breadcrumbs on inner pages
- SEO:
  - Metadata + OpenGraph
  - `sitemap.xml` via `app/sitemap.ts`
  - `robots.txt` via `app/robots.ts`
- Accessibility-first structure:
  - Semantic sections
  - Visible focus styles
  - Keyboard-friendly navigation and controls

## Sample Content

`lib/data.ts` includes:

- 10 news posts
- 8 events
- 20 resources
- 10 scout units
- 8 leadership profiles

## CMS Integration (Option A)

This project is wired for a headless CMS through `lib/cms.ts`.

- Set `CMS_BASE_URL` and optional `CMS_API_TOKEN` in environment variables.
- If CMS is unavailable, the app automatically falls back to local data in `lib/data.ts`.

Collections expected:

- `news`
- `events`
- `resources`
- `units`
- `leaders`

### Roles and Workflow

Defined in `lib/cms-config.ts`:

- Roles:
  - Super Admin
  - Editor
  - Events Manager
  - Resource Manager
- Moderation workflow:
  - Draft -> Review -> Publish

## Local Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run start
```
# Kibahascouts
