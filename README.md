# 🎮 ROV Esports Draft Pick & Ban Overlay Platform

A Production-Ready, Real-Time Esports Broadcast Overlay & Control Platform built for MOBA tournaments (ROV / Arena of Valor / Honor of Kings / League of Legends) with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Supabase Realtime**.

---

## 🌟 Key Capabilities

1. **Broadcast-Grade 1920x1080 Overlay Canvas**
   - Fixed-coordinate pixel-accurate layer system (`Background -> Effects -> Decorations -> Team Area -> Hero Slots -> Timer -> Phase -> Score -> Sponsor`).
   - Dynamic viewport auto-scaling: scales cleanly into any OBS browser window resolution or screen aspect ratio with zero layout shifts.
   - Transparent Mode support (`/overlay/[matchId]?transparent=true`) for embedding directly over game streams and camera scenes.

2. **Real-time Dual Engine (Supabase Realtime + Web BroadcastChannel)**
   - Automatic live synchronization across Control Room, OBS Studio, and Viewer tabs without page refreshes.
   - Full offline/mock demo capability so the platform can run immediately with no external dependencies required.

3. **Esports Broadcast Control Room (`/dashboard/matches/[matchId]/control`)**
   - Live Match Header with quick score increment/decrement.
   - Real-time digital timer with play, pause, +10s / -10s adjustments, and urgent low-time audio-visual pulse.
   - Single-Row Horizontal Hero Selector with mouse wheel scroll, role filtering (Tank, Warrior, Assassin, Mage, Marksman, Support), and instant search.
   - Undo last pick/ban action & match draft reset with event audit logging.
   - Collapsible Live Broadcast Overlay Preview window.

4. **Multi-Theme & Dynamic Background System**
   - 5 Pre-built Themes: **Esports Arena**, **Cyberpunk Neon**, **Mythic Fantasy**, **Minimalist Stealth**, and **Custom Sponsor Gold**.
   - Supports Video Loops (MP4 / WebM), High-Res Images, Animated Futuristic Gradients, and Transparent Backgrounds.

5. **Visual 1920x1080 Template Editor (`/dashboard/templates/editor`)**
   - Interactive canvas editor with 10px snap grid, coordinate inspector, and element dimension tuning.

6. **Hero & Team Management Database**
   - Complete CRUD for heroes (roles, portraits, splash artworks, active toggle) and esports teams (logos, brand colors, short tags).

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎥 OBS Studio Integration Guide

1. Open **OBS Studio**.
2. Under **Sources**, click **+** and select **Browser**.
3. Set the following settings:
   - **URL**: `http://localhost:3000/overlay/demo-match-pro-finals` (or your match ID)
   - **Width**: `1920`
   - **Height**: `1080`
   - **FPS**: `60`
   - Check **"Shutdown source when not visible"**
   - Check **"Refresh browser when scene becomes active"**
4. For transparent overlay mode (overlay without background), use:
   - `http://localhost:3000/overlay/demo-match-pro-finals?transparent=true`

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase Dashboard.
3. Run the SQL script from `supabase/schema.sql` to create all tables, indexes, and RLS policies.
4. Run `supabase/seed.sql` to populate initial teams, heroes, themes, and sponsors.
5. Create a `.env.local` file in project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
6. The app will automatically connect to Supabase and subscribe to postgres real-time change events!

---

## 📁 Project Architecture

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                      # Match Overview & Stats
│   │   ├── heroes/page.tsx               # Hero Database CRUD
│   │   ├── teams/page.tsx                # Pro Team Management CRUD
│   │   ├── matches/
│   │   │   ├── new/page.tsx              # Create Match Wizard
│   │   │   └── [matchId]/control/page.tsx# Live Broadcast Control Room
│   │   ├── templates/
│   │   │   ├── page.tsx                  # Template Browser
│   │   │   └── editor/page.tsx           # 1920x1080 Canvas Template Editor
│   │   ├── themes/page.tsx               # Theme & Visual Style Engine
│   │   ├── sponsors/page.tsx             # Sponsor Management
│   │   └── settings/page.tsx             # Supabase & Data Settings
│   ├── overlay/
│   │   └── [matchId]/page.tsx            # OBS Studio Browser Source Feed
│   ├── globals.css                       # Esports Neon Design Tokens
│   ├── layout.tsx                        # Root HTML & Fonts
│   └── page.tsx                          # Platform Landing Page
│
├── components/
│   ├── overlay/
│   │   ├── OverlayRenderer.tsx           # Master 1920x1080 Layer Renderer
│   │   ├── HeroCard.tsx                  # Character Artwork, Frame, Animations
│   │   ├── HeroSlot.tsx                  # Fixed Coordinate Slot Wrapper
│   │   ├── TeamPanel.tsx                 # Team Headers & Scores
│   │   ├── DraftTimer.tsx                # Digital Timer & Pulse Effects
│   │   ├── DraftPhase.tsx                # Esports Phase Badge
│   │   ├── Sponsor.tsx                   # Partner Showcase Banner
│   │   └── Background.tsx                # Video / Image / Gradient / Transparent
│   ├── control/
│   │   ├── MatchControl.tsx              # Control Room Orchestrator
│   │   ├── HeroSelector.tsx              # Single-Row Horizontal Hero Picker
│   │   ├── PickBanControl.tsx            # Slot Matrix Matrix
│   │   ├── TimerControl.tsx              # Digital Time Controls
│   │   └── OBSInstructions.tsx           # OBS Setup Modal & Link Copier
│   └── editor/
│       └── TemplateEditor.tsx            # Interactive Visual Template Layout Editor
│
├── config/
│   └── defaultData.ts                    # Seed Heroes, Teams, Themes, Templates, Demo Match
├── lib/
│   ├── realtime/syncService.ts           # Realtime Sync Hook
│   └── supabase/
│       ├── client.ts                     # Supabase Client
│       └── mockStorage.ts                # Dual LocalStorage & Supabase Data Engine
├── types/
│   └── index.ts                          # TypeScript Definitions
├── supabase/
│   ├── schema.sql                        # PostgreSQL DDL & RLS Policies
│   └── seed.sql                          # Seed SQL
```

---

## 🛡️ License

MIT License. Designed and engineered for Esports Broadcast standard.
