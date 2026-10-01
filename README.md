# Humor Admin Dashboard

Authenticated administrative platform for managing a humor-captioning application. Built with Next.js, TypeScript, and Supabase/PostgreSQL, the dashboard provides role-protected tools for inspecting platform data, managing content and configuration, and performing persistent database operations.

Access is restricted to Google-authenticated users whose `profiles` record has `is_superadmin = true`.

## Engineering Highlights

- Google OAuth with cookie-backed Supabase sessions
- Server-side superadmin authorization for admin pages and mutations
- Protected `/admin` routes
- Server-only privileged database access with public credentials isolated to the browser
- Persistent CRUD operations through Next.js server actions
- Image management with optional Supabase Storage uploads
- Database-backed pagination for large datasets
- Operational scripts for Auth user inspection and superadmin management

## Architecture

Browser authentication uses the Supabase anon key, while privileged reads and writes run exclusively on the server.

```text
Browser
  |
  | Google OAuth + session cookies
  v
Next.js App Router
  |-- /login
  |-- /auth/callback     exchange OAuth code for session
  |-- /admin/*           authorize, then query
  |-- server actions     authorize, then mutate
  |
  v
Supabase
  |-- Auth
  |-- PostgreSQL
  |-- Storage

Local tooling
  |-- list-users
  |-- promote-superadmin
```

Database column and foreign-key notes are documented in [`docs/admin-schema.md`](docs/admin-schema.md).

## Tech Stack

- Next.js 16 / React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth
- PostgreSQL
- Supabase Storage
- `@supabase/ssr` for cookie-backed authentication
- `@supabase/supabase-js` for server-side database access

## Authentication & Authorization

`/login` starts Google authentication through Supabase OAuth. `/auth/callback` exchanges the returned authorization code for a session and validates the authenticated identity.

Every admin page and privileged server action calls `requireSuperadmin()` from `lib/auth/require-superadmin.ts`.

Authorization behavior:

- Missing or invalid session → `/login`
- Non-Google identity → `/login`
- Missing profile or `is_superadmin !== true` → access-restricted page
- Superadmin → `/admin`

Authorization is repeated inside server actions so privileged mutations are not protected solely by the page rendering the form.

## Database & Data Management

Server actions validate input, perform database operations through the server-only Supabase client, and call `revalidatePath()` so persisted changes are reflected in the UI.

Captions and LLM responses use database `.range()` queries with exact counts for pagination.

Images can be stored using an external URL or uploaded to a configured Supabase Storage bucket. Uploaded files are limited to 10 MB and their resulting public URLs are persisted to `images.url`.

| Area | Tables | Access |
| --- | --- | --- |
| People | `profiles` | Read |
| Content | `images` | Create, update, delete |
| Content | `captions`, `caption_requests`, `humor_flavors`, `humor_flavor_steps` | Read |
| LLM | `llm_providers`, `llm_models` | Create, update, delete |
| LLM | `humor_flavor_mix` | Update |
| LLM | `llm_model_responses`, `llm_prompt_chains` | Read |
| Catalog | `terms`, `caption_examples` | Create, update, delete |
| Access | `allowed_signup_domains`, `whitelist_email_addresses` | Create, update, delete |

The dashboard also aggregates platform statistics and recent activity across profiles, images, and captions.

## Admin Tooling

Local scripts support basic operational administration:

```bash
npm run list-users
npm run promote-superadmin user@example.com
```

These scripts use server-side credentials loaded from `.env.local`.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The application runs at `http://localhost:3000`.

Required environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Optional:

```text
SUPABASE_IMAGE_BUCKET
```

Google authentication must be enabled in Supabase with:

```text
http://localhost:3000/auth/callback
```

configured as an allowed redirect URL.

## Deployment Status

The original Vercel deployment is no longer active because the authentication credentials configured for that environment are no longer valid. The source code remains fully available, and the application can be run locally with valid Supabase credentials.

## Security

- `SUPABASE_SERVICE_ROLE_KEY` is restricted to server modules and local administrative scripts.
- Client-side code receives only the public Supabase URL and anon key.
- Privileged reads and writes execute only after server-side superadmin authorization succeeds.
- Environment files containing credentials are excluded from version control.
