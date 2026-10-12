# DevBrief

DevBrief is a programming blog with a public reading site and a separate publishing workspace for selected admins.

## Live sites

- Public blog: https://devbrief.netlify.app
- Admin workspace: https://devbrief-admins.netlify.app

Readers can browse published posts without signing in. An account is required to comment. Admin accounts are provisioned by the project maintainer; there is no public admin signup.

## Stack

- Public and admin frontends: React, Vite
- API: Node.js, Express
- Database: PostgreSQL with Prisma
- Admin editor: TinyMCE

## Local development

You will need Node.js, npm, and a PostgreSQL database.

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set `DATABASE_URL` to your PostgreSQL connection string and provide a strong `JWT_SECRET` in `backend/.env`. Then, from `backend`, generate the Prisma client, apply migrations, and start the API:

```powershell
npx prisma generate
npx prisma migrate deploy
npm start
```

The API runs at `http://localhost:3000` by default.

### Provision an admin

Set `ADMIN_EMAIL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` in `backend/.env`, then run this from `backend`:

```powershell
npm run seed:admin
```

The seed hashes the password and creates or updates that account with the `ADMIN` role. Use your own credentials, not the example values.

### Frontends

For the public site, run these commands from the repository root and set the API URL in the new `.env` before starting Vite:

```powershell
cd frontend-blog-access
npm install
Copy-Item .env.example .env
# Set VITE_API_URL=http://localhost:3000 in .env
npm run dev
```

For the admin site, run these commands from the repository root in a second terminal. Set the API URL and TinyMCE key in `.env` before starting Vite:

```powershell
cd frontend-blog-write
npm install
Copy-Item .env.example .env
# Set VITE_API_URL=http://localhost:3000 and VITE_TINYMCE_API_KEY in .env
npm run dev -- --port 5174
```

The public site uses port `5173`; the admin site uses `5174`.

## Checks

Run these from either frontend directory:

```powershell
npm run lint
npm run build
```
