# Project overview
**Rubriq** is a web platform designed to streamline the creation, customization, and management of **AI-use rubrics** for educators and institutions.
It provides an intuitive interface for building structured evaluation templates, integrating AI-use scales, and maintaining version-controlled updates — all in one place.

# Project objectives
**Rubriq** aims to:

1. **Simplify rubric creation and management**: allow instructors to quickly create or customize AI-use rubrics for different courses or assessments.

2. **Ensure consistency and transparency in AI usage**: maintain shared templates that standardize how AI tools are declared and assessed across subjects.

3. **Enable collaboration and scalability**: support multi-role functionality:
    - Admins can create, edit, and publish shared templates.
    - Users can clone or link templates to build course-specific rubrics.

4. **Promote accountability and reproducibility**: track template version history and alert users when an updated version is available.

5. **Provide export-ready documentation**: generate student declaration forms as downloadable Excel sheets.

# Technology stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend & Database**: Supabase, PostgreSQL
- **Auth & Access Control**: Supabase Auth, RLS
- **File Handling & Export**: xlsx-js-style
- **Deployment**: Vercel


# `src` directory layout
```
src/
  app/
    page.tsx               # PAGE: redirects to /my-rubrics if logged in.
    layout.tsx             # configure fonts and Toaster

    (dashboard)/
      layout.tsx           # sidebar: My Rubrics, Profile, (+Templates if Admin)
      my-rubrics/          # PAGE: all users view their own rubrics
      edit-rubric/[id]/    # PAGE: rubric editor (5-column table)
      templates/           # PAGE: all users view shared templates - admins can edit       
      edit-template/[id]/  # PAGE: template editor (5-column table)
      profile/        

    (login)/
      signin/
      signup/

    error/                 # PAGE: unexpected error
    goodbye/               # PAGE: after account deletion
    api/                   # API endpoints
      _lib/
      account/
      rubric/
      templates/

    auth/callback/         # magic link handler after singup
    utils/supabase/        # create Supabase client + middleware

  components/              # grouped by page   
    SidebarNav.tsx     
    my-rubrics-page/
    edit-rubric-page/
    templates-page/
    edit-templats-page/
    ui/                    # shadcn components

  hooks/
  lib/

```

# Next.js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
