# Venysium — Entergram API Explorer

A **Progressive Web App (PWA)** for exploring and testing the [Entergram Public API](https://api.entergram.com). Built with Vite + React + TypeScript + Tailwind CSS.

## Features

- **Full API coverage** — All Entergram v1 endpoints: System, Workspace, Accounts, Contacts, Chats, Messages, Custom Fields, and Tickets
- **Live request runner** — Fill in parameters and fire real API requests directly from the browser
- **Syntax-highlighted responses** — JSON responses rendered with color coding
- **API key manager** — Your `X-API-Key` is stored securely in `localStorage` (never leaves your device)
- **PWA-ready** — Installable on desktop and mobile, works offline for the UI layer
- **Dark theme** — Matches the Entergram API docs aesthetic

## Getting Started

### Prerequisites

- Node.js 18+
- An Entergram PRO workspace with an API key from **Settings → Developers**

### Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

### Option B — GitHub integration

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial Venysium PWA"
   git remote add origin https://github.com/YOUR_USER/venysium.git
   git push -u origin main
   ```
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Vite** — no additional configuration needed.
4. Click **Deploy**.

## Project Structure

```
src/
├── context/        ApiKeyContext — global API key state
├── data/           endpoints.ts  — all API sections & endpoints as data
├── lib/            api.ts, storage.ts
├── components/     Layout, Sidebar, EndpointCard, ResponseViewer, …
├── pages/          SectionPage — generic page driven by endpoint data
├── types.ts        TypeScript interfaces
└── main.tsx        App entry point
```

## Notes on CORS

API calls are made directly from the browser. If you encounter CORS errors, it means the Entergram API server is not returning the required `Access-Control-Allow-Origin` headers for your origin. In that case you can:

- Run the app on the same origin as the API (unlikely for a PWA).
- Use a browser extension that disables CORS (development only).
- Add a Vercel Edge Function proxy under `/api/proxy` that forwards requests server-side.

## License

MIT
