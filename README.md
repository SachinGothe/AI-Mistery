# AI Mystery Room
See SPEC.md for the full blueprint.

## Run locally
```bash
cd server && cp .env.example .env   # fill MONGODB_URI and GEMINI_API_KEY
npm install && npm run dev
cd ../client && cp .env.example .env
npm install && npm run dev          # http://localhost:5173
```

## Deploy
1. **MongoDB Atlas**: create a free cluster, add a database user, allow network access (0.0.0.0/0), copy the connection string.
2. **Backend (Render)**: new Web Service from your GitHub repo, root directory `server`, build `npm install`, start `npm start`. Env vars: `MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL` (your Vercel URL, no trailing slash).
3. **Frontend (Vercel)**: import repo, root directory `client`, framework Vite. Env var: `VITE_API_URL=https://YOUR-RENDER-URL/api`.
4. Redeploy backend after setting `CLIENT_URL`, then create and solve a mystery on the live site.
