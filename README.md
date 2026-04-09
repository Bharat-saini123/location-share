# 🗺️ Friend Tracker

Real-time friend location tracking app — dekho tumhare dost kahan hain!

## Features

- 🔴 **Real-time updates** — Pusher se instant location changes dikhta hai
- 🗺️ **Dark map** — Beautiful Leaflet + CartoDB dark tiles
- 👥 **Friends sidebar** — Online/offline status ke saath
- 📍 **Location sharing** — Ek click mein share/stop
- 🔐 **Google OAuth** — NextAuth se secure login
- 🏙️ **City name** — Reverse geocoding se automatic city detect

---

## Setup Guide (Step by Step)

### Step 1 — Project clone/download karo

```bash
cd friend-tracker
npm install
```

### Step 2 — Supabase setup

1. [supabase.com](https://supabase.com) par free account banao
2. New project create karo
3. **SQL Editor** mein jao aur `supabase-schema.sql` ka poora content paste karke run karo
4. **Settings → API** mein se yeh values copy karo:
   - `Project URL`
   - `anon public` key
   - `service_role` key

### Step 3 — Pusher setup

1. [pusher.com](https://pusher.com) par free account banao
2. **Channels** mein new app create karo
3. App Keys page se copy karo:
   - `app_id`, `key`, `secret`, `cluster`

### Step 4 — Google OAuth setup

1. [console.cloud.google.com](https://console.cloud.google.com) par jao
2. New project banao → **APIs & Services → Credentials**
3. **OAuth 2.0 Client ID** create karo (Web application)
4. Authorized redirect URIs mein add karo:
   - `http://localhost:3000/api/auth/callback/google`
5. Client ID aur Secret copy karo

### Step 5 — .env.local file banao

```bash
cp .env.example .env.local
```

Ab `.env.local` file kholo aur apni values fill karo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_PUSHER_KEY=abc123
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
PUSHER_APP_ID=123456
PUSHER_SECRET=xyz789

NEXTAUTH_SECRET=koi_bhi_random_string_likho
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### Step 6 — Run karo!

```bash
npm run dev
```

Browser mein kholo: **http://localhost:3000**

---

## Project Structure

```
friend-tracker/
├── app/
│   ├── page.tsx                    ← Main map dashboard
│   ├── login/page.tsx              ← Login page
│   ├── layout.tsx                  ← Root layout
│   ├── globals.css                 ← Global styles
│   ├── providers.tsx               ← SessionProvider wrapper
│   └── api/
│       ├── auth/[...nextauth]/     ← NextAuth handler
│       └── location/route.ts       ← Location GET/POST API
├── components/
│   ├── Map.tsx                     ← Leaflet map (SSR disabled)
│   ├── FriendsList.tsx             ← Sidebar friends list
│   ├── FriendDetail.tsx            ← Friend popup card
│   ├── LocationShare.tsx           ← Share location button
│   └── Navbar.tsx                  ← Top navigation bar
├── lib/
│   ├── supabase.ts                 ← Supabase client
│   └── pusher.ts                   ← Pusher client + server
├── types/
│   └── index.ts                    ← TypeScript types
├── supabase-schema.sql             ← Database schema
└── .env.example                    ← Environment variables template
```

---

## Tech Stack

| Tool | Use |
|------|-----|
| **Next.js 14** | Framework (App Router) |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Leaflet** | Interactive map |
| **Supabase** | Database + Auth |
| **Pusher** | Real-time updates |
| **NextAuth.js** | Google login |

---

## Production Deploy (Vercel)

```bash
npm install -g vercel
vercel
```

Vercel dashboard mein Environment Variables add karo (same as .env.local).

Google OAuth redirect URI update karo:
- `https://your-app.vercel.app/api/auth/callback/google`

---

## Common Issues

**"Location permission denied"** → Browser settings mein location allow karo

**Map nahi dikh raha** → `npm install` dobara karo, leaflet CSS check karo

**Pusher not working** → Cluster verify karo (`ap2` for Asia Pacific)

**Login nahi ho raha** → NEXTAUTH_URL check karo, Google redirect URI verify karo
