# Build & Launch System

A complete digital product creation and selling platform for beginners.

## Features

- AI-powered PDF generation
- Content generator with rotation logic
- Launch tracker with checklists
- Ask Hania chatbot
- Admin panel for account creation

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/haniafawad/buildnlaunch.git
cd buildnlaunch
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and add your Supabase credentials:
```bash
cp .env.example .env
```

### 3. Set up Supabase

1. Create a Supabase project at https://supabase.com
2. Run the database migration to create tables
3. Enable Row Level Security
4. Add `ANTHROPIC_API_KEY` to Edge Functions secrets

### 4. Deploy Edge Functions

Deploy all edge functions to Supabase:
- generate-title
- generate-pdf-outline
- generate-pdf-section
- generate-content
- ask-hania

### 5. Run locally
```bash
npm run dev
```

### 6. Deploy to Netlify

1. Connect your GitHub repo to Netlify
2. Set the build command: `npm run build`
3. Set the publish directory: `dist`
4. Add environment variables from `.env`
5. Set custom domain to `launchroom.hania.cc`

## Access Points

- **Main Login**: `https://launchroom.hania.cc`
- **Admin Panel**: `https://launchroom.hania.cc/admin` (password: `launchroom2024`)

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Supabase (Auth + Database + Edge Functions)
- Claude API (claude-sonnet-4-20250514)
- jsPDF for PDF generation
- Lucide React for icons

## License

Private - All rights reserved
