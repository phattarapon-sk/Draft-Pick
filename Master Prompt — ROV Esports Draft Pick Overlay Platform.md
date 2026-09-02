# สร้างระบบ ROV Esports Draft Pick Overlay Platform ด้วย Next.js + Supabase

## 1. เป้าหมายของโปรเจกต์

สร้าง Web Application สำหรับสร้างและควบคุมระบบ Draft / Pick / Ban สำหรับเกม MOBA โดยมีหน้าตาในระดับ Esports Broadcast และสามารถนำหน้า Overlay ไปใช้งานจริงผ่าน OBS Studio Browser Source ได้

ระบบต้องไม่ใช่เพียง Mockup หรือ Static UI แต่ต้องเป็นระบบที่ทำงานจริงแบบ Real-time

Technology หลัก:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Auth
- Supabase PostgreSQL
- Supabase Realtime
- Framer Motion
- OBS Browser Source
- HTML5 Video / CSS Animation
- Lucide React หรือ Icon Library ที่เหมาะสม

ต้องออกแบบระบบให้สามารถ Deploy บน Vercel ได้

---

# 2. แนวคิดหลักของระบบ

ระบบแบ่งเป็น 2 ส่วนหลัก

## A. Management / Control Panel

ใช้สำหรับ Admin / Tournament Organizer / Streamer

สามารถ:

- สร้าง Match
- ตั้งชื่อทีม
- ใส่โลโก้ทีม
- เลือก Template
- เลือก Theme
- เลือก Background
- ค้นหา Hero
- Pick Hero
- Ban Hero
- Undo
- Reset
- Start / Pause / Resume Timer
- เปลี่ยน Phase
- แก้ Score
- ใส่ Sponsor Logo
- Preview Overlay
- เปิด Overlay URL สำหรับ OBS

## B. Broadcast Overlay

เป็นหน้าเว็บแยกสำหรับ OBS

ตัวอย่าง:

`/overlay/[matchId]`

หน้า Overlay ต้องออกแบบที่ Canvas 1920x1080 เป็นหลัก

Background ต้องรองรับ:

- PNG
- JPG
- WebP
- MP4
- WebM
- Animated background

Overlay ต้องสามารถทำงานได้แม้ไม่มี UI Control แสดงอยู่

ต้องมีพื้นหลังโปร่งใสในกรณีที่เลือก Transparent Mode

---

# 3. สิ่งสำคัญที่สุด: Template System

อย่าสร้าง Overlay เป็นภาพเดียวทั้งก้อน

ต้องสร้างเป็น Layer System

โครงสร้าง:

Background
↓
Background Effects
↓
Decorations
↓
Team Area
↓
Hero Slots
↓
Timer
↓
Phase
↓
Score
↓
Sponsor
↓
Animation Layer

ทุกองค์ประกอบต้องสามารถเปลี่ยนแยกจากกันได้

---

# 4. Fixed Position System

กำหนด Overlay Canvas เป็น 1920x1080

ทุก Hero Slot ต้องมีตำแหน่งที่แน่นอน

ตัวอย่าง:

```ts
type HeroSlot = {
  id: string
  team: "blue" | "red"
  slotIndex: number
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  scale?: number
}
```

ตัวอย่าง:

```ts
{
  id: "blue-1",
  team: "blue",
  slotIndex: 1,
  x: 150,
  y: 400,
  width: 220,
  height: 320
}
```

เมื่อเปลี่ยน Background หรือ Theme ห้ามเปลี่ยนตำแหน่ง Hero Slot

Template ต้องควบคุมตำแหน่งด้วย Configuration

---

# 5. Hero Card System

ห้ามเอารูป Hero มาวางแบบ `<img>` ธรรมดาโดยไม่มีการจัดองค์ประกอบ

Hero Card ต้องประกอบด้วย:

- Hero Artwork
- Image Mask
- Gradient
- Frame
- Border
- Shadow
- Team Color
- Role Icon
- Hero Name
- Pick/Ban State
- Glow
- Animation

ตัวอย่างโครงสร้าง:

```text
HeroCard
 ├── Artwork
 ├── ImageMask
 ├── Gradient
 ├── Frame
 ├── Glow
 ├── Role
 ├── Name
 └── Animation
```

ใช้:

```css
object-fit: cover;
```

หรือ

```css
object-fit: contain;
```

ตามประเภท Artwork

ต้องสามารถ Crop ภาพให้มี Composition ที่สม่ำเสมอ

---

# 6. Hero Image Quality

Hero ทุกตัวอาจมีขนาดภาพไม่เท่ากัน

ระบบต้อง Normalize ภาพให้เข้ากับ Slot

ตัวอย่าง:

```text
Hero A = 1000x1500
Hero B = 1200x1600
Hero C = 800x1200
```

แต่เมื่อเข้า Slot แล้วต้องมีขนาดและตำแหน่งเท่ากัน

ใช้ Image Container ที่กำหนดขนาดตายตัว

ห้ามปล่อยให้ภาพทำให้ Layout ขยับ

---

# 7. Hero Database

สร้าง Table:

```text
heroes
```

Fields:

```text
id
name
slug
image_url
portrait_url
splash_url
role
is_active
created_at
updated_at
```

รองรับ Role:

- Tank
- Warrior
- Assassin
- Mage
- Marksman
- Support

สามารถเพิ่ม Role ในอนาคตได้

---

# 8. Hero Management

หน้า:

`/dashboard/heroes`

ต้องมี:

- Hero Grid
- Search
- Filter Role
- Upload Hero
- Edit Hero
- Delete Hero
- Preview
- Active / Inactive

Search ต้องค้นหาแบบ Real-time ในฝั่ง Client สำหรับข้อมูลจำนวนไม่มาก และรองรับ Database Search เมื่อข้อมูลมีจำนวนมาก

---

# 9. Pick / Ban System

Match ต้องมีสถานะ:

```text
waiting
ban_phase
pick_phase
completed
```

และสามารถเพิ่ม Phase ได้ในอนาคต

ทุก Action ต้องบันทึกลง Database

ตัวอย่าง:

```ts
type DraftAction = {
  matchId: string
  team: "blue" | "red"
  action: "pick" | "ban"
  heroId: string
  slotIndex: number
  createdAt: string
}
```

เมื่อกด Pick:

1. ตรวจสอบว่า Hero ยังไม่ถูก Pick/Ban
2. ตรวจสอบ Slot
3. บันทึก Database
4. Broadcast Realtime Event
5. Overlay Update
6. เล่น Animation

---

# 10. เลือกตัวละครแบบแถวเดียว

หน้า Control ต้องมี Hero Selector แบบ Single Row

ตัวอย่าง:

```text
┌─────────────────────────────────────────────────────────────┐
│ Search Hero                                                 │
├─────────────────────────────────────────────────────────────┤
│ [Alice] [Annette] [Arum] [Arduin] [Baldum] [Grakk] [...]   │
└─────────────────────────────────────────────────────────────┘
```

ต้อง:

- Horizontal Scroll
- Mouse Wheel
- Touch Swipe
- Search
- Filter Role
- แสดงสถานะ Picked / Banned
- Hero ที่ถูกใช้แล้วต้อง Disabled

กด Hero แล้วต้องสามารถเลือก:

```text
PICK
BAN
```

ตาม Phase ปัจจุบัน

---

# 11. Real-time Architecture

ใช้ Supabase Realtime

เมื่อ Control Panel เปลี่ยน Match State

Overlay ต้องได้รับข้อมูลโดยไม่ต้อง Refresh

ตัวอย่าง:

```text
Control Panel
      ↓
Supabase Database
      ↓
Supabase Realtime
      ↓
Overlay
      ↓
Animation
```

ต้อง Handle:

- reconnect
- duplicate event
- stale state
- initial state
- race condition เบื้องต้น

Overlay ต้องโหลด State ล่าสุดจาก Database ก่อน จากนั้น Subscribe Realtime

---

# 12. Animation System

ใช้ Framer Motion

ต้องมี Animation อย่างน้อย:

## Pick Animation

```text
Initial:
opacity: 0
scale: 0.8
x: -40

Animate:
opacity: 1
scale: 1
x: 0
```

เพิ่ม:

- Glow
- Light Sweep
- Scale
- Blur → Sharp
- Fade
- Particle

## Ban Animation

- Grayscale
- Red Glow
- Slash
- Cross
- Shake เล็กน้อย

## Hero Reveal

```text
Dark
↓
Light Sweep
↓
Artwork Reveal
↓
Scale
↓
Glow
↓
Final Position
```

Animation ต้องไม่ทำให้ Layout Shift

---

# 13. Template System

สร้าง Table:

```text
templates
```

Fields:

```text
id
name
slug
description
canvas_width
canvas_height
config
preview_url
is_public
created_at
updated_at
```

`config` สามารถเก็บ JSON

ตัวอย่าง:

```json
{
  "canvas": {
    "width": 1920,
    "height": 1080
  },
  "heroSlots": [],
  "timer": {},
  "teams": {},
  "decorations": {}
}
```

---

# 14. Theme System

สร้าง Table:

```text
themes
```

รองรับ:

### Theme 1
Esports Arena

### Theme 2
Cyberpunk

### Theme 3
Fantasy

### Theme 4
Minimal

### Theme 5
Custom Sponsor

Theme ต้องควบคุม:

- Background
- Primary Color
- Secondary Color
- Accent Color
- Glow
- Frame
- Font
- Animation Preset

---

# 15. Dynamic Background

Background ต้องเลือกได้จาก Dashboard

รองรับ:

```text
image
video
transparent
gradient
```

ตัวอย่าง:

```ts
type Background = {
  type: "image" | "video" | "gradient" | "transparent"
  url?: string
  overlay?: string
  opacity?: number
  position?: string
  size?: string
}
```

Video ต้อง:

- autoplay
- muted
- loop
- playsInline

ต้อง optimize ให้เหมาะกับ OBS Browser Source

---

# 16. Background ไม่กระทบ Layout

เมื่อเปลี่ยน:

```text
Arena
→ Cyberpunk
→ Fantasy
→ Sponsor
```

Hero Slot, Timer, Team Logo และ Score ต้องอยู่ตำแหน่งเดิม

Template เป็น Layout

Theme เป็น Visual Style

ต้องแยกสองอย่างนี้ออกจากกัน

---

# 17. Sponsor System

รองรับ:

- Sponsor Logo
- Sponsor Name
- Sponsor Text
- Position
- Size
- Opacity

สามารถเลือก:

```text
No Sponsor
Sponsor 1
Sponsor 2
Sponsor 3
```

และกำหนดตำแหน่งจาก Template

---

# 18. Team System

สร้าง Table:

```text
teams
```

Fields:

```text
id
name
short_name
logo_url
primary_color
secondary_color
created_at
updated_at
```

ใน Match สามารถเลือก:

```text
Blue Team
Red Team
```

แต่ละทีมมี:

- Name
- Logo
- Color
- Score

---

# 19. Match System

สร้าง Table:

```text
matches
```

Fields:

```text
id
name
blue_team_id
red_team_id
blue_score
red_score
status
current_phase
timer_seconds
template_id
theme_id
created_by
created_at
updated_at
```

---

# 20. Match Control

หน้า:

`/dashboard/matches/[matchId]/control`

ออกแบบให้เหมือน Broadcast Control Room

ด้านบน:

```text
MATCH CONTROL

BLUE TEAM  0 : 0  RED TEAM

PHASE
[ BAN ] [ PICK ] [ READY ]

TIMER
00:25

[ START ]
[ PAUSE ]
[ RESET ]
```

ตรงกลาง:

```text
BLUE TEAM
[Slot] [Slot] [Slot] [Slot] [Slot]

RED TEAM
[Slot] [Slot] [Slot] [Slot] [Slot]
```

ด้านล่าง:

Hero Selector แบบแถวเดียว

---

# 21. Overlay Page

Route:

`/overlay/[matchId]`

ต้อง:

- Fullscreen
- ไม่มี Scroll
- ไม่มี UI Control
- Background รองรับ Transparent
- Responsive
- 1920x1080 เป็น Master Resolution
- Scale ตาม Browser Viewport

Overlay ต้องเหมาะกับ OBS Browser Source

---

# 22. OBS Integration

ให้ผู้ใช้ Copy URL:

```text
https://domain.com/overlay/MATCH_ID
```

ไปใส่:

```text
OBS
→ Sources
→ Browser
→ URL
```

Default:

```text
Width: 1920
Height: 1080
FPS: 60
```

หาก Overlay ใช้ Transparent Background ต้องสามารถแสดงเฉพาะ UI Overlay ได้

---

# 23. Preview Mode

ใน Dashboard ต้องมี Preview

แบ่งเป็น:

```text
LIVE PREVIEW
```

และ

```text
CONTROL PANEL
```

เมื่อกด Pick ใน Control Panel

Preview ต้องเปลี่ยนเหมือน Overlay จริง

---

# 24. Template Preview

หน้า:

`/dashboard/templates`

แสดง Card:

```text
┌─────────────────────┐
│                     │
│     PREVIEW         │
│                     │
├─────────────────────┤
│ Esports Arena       │
│                     │
│ [Use Template]      │
└─────────────────────┘
```

Template สามารถ Duplicate ได้

เช่น:

```text
Esports Arena
      ↓
Duplicate
      ↓
My Tournament Theme
```

---

# 25. Template Editor

ทำ Editor แบบง่ายก่อน ไม่ต้องสร้าง Canva เต็มรูปแบบ

สามารถแก้:

- Hero Slot Position
- Hero Slot Size
- Timer Position
- Team Logo Position
- Score Position
- Sponsor Position
- Team Name Position

ใช้ Drag & Drop

แต่ต้องมี Grid / Snap

และสามารถ Reset Position ได้

---

# 26. Responsive Strategy

Control Panel:

Desktop
Tablet
Mobile

Overlay:

Master:

```text
1920 × 1080
```

แต่ต้อง Scale ได้ตาม Browser Viewport

ห้ามให้ตำแหน่งภายใน Canvas เพี้ยน

ใช้:

```css
aspect-ratio: 16 / 9;
```

และ Scale Container

---

# 27. Supabase Storage

สร้าง Bucket:

```text
heroes
teams
templates
backgrounds
sponsors
```

ต้องจัด Folder:

```text
heroes/{heroId}/
teams/{teamId}/
backgrounds/{themeId}/
sponsors/{sponsorId}/
```

ต้องตั้ง Storage Policy ให้เหมาะสม

ไฟล์ที่ Overlay ต้องโหลดได้ต้องใช้ Public URL หรือ Signed URL ตามความเหมาะสม

---

# 28. Authentication

ใช้ Supabase Auth

รองรับ:

- Email / Password
- Magic Link ในอนาคต

Roles:

```text
admin
organizer
streamer
viewer
```

MVP สามารถเริ่มด้วย:

```text
admin
user
```

---

# 29. Security

ห้ามให้ Client สามารถแก้ข้อมูล Match ของผู้อื่นโดยตรง

ใช้ Supabase RLS

ตัวอย่าง:

```text
users
organizations
matches
match_members
```

เตรียม Architecture ให้รองรับ Multi-Tenant ในอนาคต

---

# 30. UI Design

ต้องออกแบบให้ดูเป็น Premium Esports Software

ไม่ต้องทำเหมือน Admin Dashboard ธรรมดา

Style:

- Dark
- Futuristic
- Premium
- Esports
- Glassmorphism แบบพอดี
- Neon Accent
- Soft Glow
- Sharp Card
- High Contrast

สีหลัก:

```text
Background:
#050816

Panel:
#0B1020

Blue Team:
#00D9FF

Red Team:
#FF3864

Gold:
#FFD166
```

อย่าใช้ Gradient เยอะจนอ่านยาก

---

# 31. Typography

ใช้ Font ที่อ่านง่าย

เช่น:

- Inter
- Kanit สำหรับภาษาไทย
- หรือ Font ที่เหมาะกับ Esports

Hero Name ต้องเด่น

Timer ต้องอ่านได้แม้บน Stream

---

# 32. Performance

ต้องให้ Overlay ทำงานได้ลื่นที่ 60 FPS เท่าที่ Browser / OBS รองรับ

หลีกเลี่ยง:

- DOM จำนวนมาก
- Animation ทุกองค์ประกอบพร้อมกัน
- Video ใหญ่เกินจำเป็น
- Image ที่ไม่ได้ Optimize

ใช้:

- Next Image ใน Dashboard
- Lazy Loading
- WebP / AVIF สำหรับ Image
- WebM สำหรับ Video เมื่อเหมาะสม
- CSS Transform
- Opacity
- GPU-friendly animation

Animation หลักควรใช้:

```text
transform
opacity
filter
```

หลีกเลี่ยงการ animate:

```text
width
height
top
left
```

โดยไม่จำเป็น

---

# 33. Error Handling

ถ้า Hero Image โหลดไม่ได้:

แสดง Placeholder

ถ้า Background โหลดไม่ได้:

ใช้ Background สีพื้น

ถ้า Realtime หลุด:

แสดงสถานะ:

```text
Realtime Disconnected
Reconnecting...
```

เมื่อกลับมาให้ Sync State ล่าสุด

---

# 34. Draft State Recovery

ถ้า Browser ของ Control Panel ปิด

เปิดใหม่ต้องเห็น Match State ล่าสุด

ถ้า OBS Refresh

ต้องโหลด State ล่าสุดแล้วแสดง Overlay ต่อ

ไม่สามารถพึ่งพา State ใน React เพียงอย่างเดียว

Database เป็น Source of Truth

---

# 35. Audit Log

สร้าง Table:

```text
match_events
```

เก็บ:

```text
match_id
user_id
event_type
payload
created_at
```

ตัวอย่าง:

```text
PICK_HERO
BAN_HERO
CHANGE_PHASE
RESET_MATCH
CHANGE_TIMER
CHANGE_THEME
```

เพื่อสามารถ Debug และทำ Match History ได้

---

# 36. Undo

ต้องมี Undo Action

ตัวอย่าง:

```text
Pick Alice
↓
Undo
↓
Alice กลับเป็น Available
```

ต้องบันทึก Event และ Update Current State อย่างถูกต้อง

---

# 37. Seed Data

สร้าง Hero ตัวอย่างอย่างน้อย 10 รายการเพื่อทดสอบระบบ

ใช้ Placeholder Artwork ที่ถูกต้องตามลิขสิทธิ์สำหรับ Development

ห้ามดึง Asset จากเว็บไซต์ภายนอกแบบสุ่มโดยไม่มีสิทธิ์

ระบบ Production ต้องรองรับการ Upload Artwork ที่ผู้ใช้มีสิทธิ์ใช้งาน

---

# 38. Important Copyright Requirement

อย่าฝัง Artwork ของเกมที่มีลิขสิทธิ์ลงใน Repository โดยไม่มีสิทธิ์

สร้างระบบ Upload Asset แทน

Development ใช้ Placeholder

Production ให้ Admin Upload Asset ที่ได้รับอนุญาต

อย่า Scrape ภาพจากเกมหรือเว็บไซต์โดยอัตโนมัติ

---

# 39. Project Structure

แนะนำ:

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── heroes/
│   │   ├── teams/
│   │   ├── matches/
│   │   ├── templates/
│   │   ├── themes/
│   │   └── settings/
│   │
│   ├── overlay/
│   │   └── [matchId]/
│   │       └── page.tsx
│   │
│   └── auth/
│
├── components/
│   ├── overlay/
│   │   ├── HeroCard.tsx
│   │   ├── HeroSlot.tsx
│   │   ├── TeamPanel.tsx
│   │   ├── DraftTimer.tsx
│   │   ├── DraftPhase.tsx
│   │   ├── Sponsor.tsx
│   │   └── Background.tsx
│   │
│   ├── control/
│   │   ├── HeroSelector.tsx
│   │   ├── MatchControl.tsx
│   │   ├── PickBanControl.tsx
│   │   └── TimerControl.tsx
│   │
│   └── ui/
│
├── lib/
│   ├── supabase/
│   ├── realtime/
│   ├── animation/
│   └── templates/
│
├── types/
│
└── config/
```

---

# 40. Database Schema

สร้าง Migration สำหรับ:

```text
profiles
teams
heroes
themes
templates
matches
match_events
match_picks
match_bans
sponsors
```

เพิ่ม Foreign Key และ Index ที่จำเป็น

---

# 41. Match Pick/Ban Data

แนะนำ Table:

```text
match_actions
```

แทนการเก็บทุกอย่างใน Match JSON

Fields:

```text
id
match_id
team
action_type
hero_id
slot_index
phase
created_at
created_by
```

จะช่วยให้ทำ History และ Undo ได้ง่ายกว่า

---

# 42. UX ที่ต้องการ

User Flow:

```text
Login
 ↓
Dashboard
 ↓
Create Match
 ↓
เลือก Blue Team
 ↓
เลือก Red Team
 ↓
เลือก Template
 ↓
เลือก Theme
 ↓
Create Match
 ↓
Open Control
 ↓
Start Draft
 ↓
เลือก Hero จากแถวเดียว
 ↓
Pick / Ban
 ↓
Overlay Update
 ↓
OBS แสดงผล
```

ต้องทำให้ User ใช้งานได้โดยไม่ต้องอ่าน Documentation ยาว

---

# 43. Demo Mode

สร้าง Demo Match

เมื่อเปิดเว็บครั้งแรกสามารถกด:

```text
Try Demo
```

แล้วระบบสร้าง Match ตัวอย่างให้ทันที

มี:

- Team
- Hero
- Template
- Theme
- Timer

เพื่อให้เห็นระบบก่อน Login

---

# 44. Important Architecture Rule

ห้ามทำเป็น Static Mockup

ห้าม Hardcode Hero Slot แบบกระจัดกระจาย

ห้าม Hardcode Theme ใน Component

ห้าม Hardcode Match State

ทุกอย่างควร Data Driven

ตัวอย่าง:

```tsx
<OverlayRenderer
  template={template}
  theme={theme}
  match={match}
  heroes={heroes}
/>
```

และ:

```tsx
<HeroSlot
  slot={slot}
  hero={hero}
  team={team}
  animation={animation}
/>
```

---

# 45. Overlay Renderer

สร้าง Component หลัก:

```text
OverlayRenderer
```

รับ:

```ts
type OverlayRendererProps = {
  template: Template
  theme: Theme
  match: Match
  heroes: Hero[]
}
```

Renderer ต้องประกอบ:

```text
Background
Teams
Hero Slots
Timer
Phase
Score
Sponsor
Decorations
```

ตาม Template Configuration

---

# 46. Template กับ Theme ต้องแยกกัน

Template:

"ตำแหน่งอยู่ตรงไหน"

Theme:

"หน้าตาเป็นอย่างไร"

ตัวอย่าง:

```text
Template:
Tournament 16:9

Theme:
Cyberpunk
```

สามารถเปลี่ยนเป็น:

```text
Template:
Tournament 16:9

Theme:
Fantasy
```

โดยไม่ต้องสร้าง Template ใหม่

---

# 47. Final Visual Goal

ผลลัพธ์ต้องดูใกล้เคียง Broadcast Overlay ระดับ Esports

ไม่ต้องเลียนแบบ UI ของเกมโดยตรง

แต่ต้องให้ความรู้สึก:

- Premium
- Professional
- Dynamic
- Competitive
- Stream Ready

Hero ที่ถูก Pick ต้องดูเหมือนถูก "Reveal" เข้า Scene ไม่ใช่แค่รูปถูกเปลี่ยน

---

# 48. Development Order

อย่าพยายามทำทุกอย่างพร้อมกัน

ทำตามลำดับ:

## Phase 1

- Next.js Setup
- Tailwind
- Supabase
- Auth
- Database
- Hero CRUD

## Phase 2

- Team CRUD
- Match CRUD
- Pick/Ban
- Timer

## Phase 3

- Realtime
- Overlay
- OBS Browser Source

## Phase 4

- Template System
- Theme System
- Dynamic Background

## Phase 5

- Animation
- Hero Reveal
- Ban Animation

## Phase 6

- Template Editor
- Sponsor
- Demo Mode
- Audit Log
- Undo

---

# 49. Acceptance Criteria

ถือว่า MVP สำเร็จเมื่อสามารถทำ Flow นี้ได้จริง:

```text
1. Login
2. Create Team A
3. Create Team B
4. Create Match
5. เลือก Template
6. เลือก Background
7. เปิด Control Panel
8. เปิด Overlay URL ใน Browser
9. เปิด Overlay URL ใน OBS Browser Source
10. กด Start
11. เลือก Hero
12. กด Pick
13. Hero เปลี่ยนบน Overlay ทันที
14. Animation ทำงาน
15. เปลี่ยน Background
16. Hero Slot ยังอยู่ตำแหน่งเดิม
17. Ban Hero
18. Animation Ban ทำงาน
19. Refresh Overlay
20. State ล่าสุดยังอยู่
```

ถ้าทำครบ Flow นี้ ถือว่าเป็นระบบที่ใช้งานจริงได้ ไม่ใช่เพียง Prototype

---

# 50. Coding Rules

เขียน Code แบบ Production Ready

ต้อง:

- TypeScript Strict
- Component แยกตาม Responsibility
- Reusable Components
- Server/Client Component ใช้อย่างเหมาะสม
- Validate Input
- Handle Error
- Loading State
- Empty State
- Responsive
- Accessibility ขั้นพื้นฐาน
- ไม่ใช้ `any` โดยไม่จำเป็น
- ไม่ Hardcode Secrets
- ใช้ `.env.local`
- ใช้ Supabase Server/Client อย่างถูกต้อง
- ใช้ RLS
- ใช้ Migration
- ใช้ Seed Script

---

# 51. Environment Variables

เตรียม:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Service Role Key ห้ามส่งไป Client

---

# 52. สิ่งที่ต้องส่งมอบ

ต้องสร้าง:

1. Next.js Application
2. Supabase SQL Migration
3. RLS Policies
4. Seed Data
5. Hero Management
6. Team Management
7. Match Management
8. Pick/Ban Control
9. Real-time System
10. Overlay Renderer
11. Template System
12. Theme System
13. Background System
14. Animation System
15. OBS Browser Source Support
16. Responsive Control Panel
17. Demo Mode
18. README
19. `.env.example`

---

# 53. ห้ามทำแบบนี้

ห้ามสร้างหน้า UI สวยแต่ Button ใช้งานไม่ได้

ห้าม Mock ข้อมูลแบบ Static อย่างเดียว

ห้ามใช้ State ใน Client เป็น Source of Truth

ห้ามทำ Overlay เป็น PNG เดียว

ห้ามผูก Hero กับตำแหน่งแบบ Hardcode ใน Component

ห้ามทำ Theme แล้วแก้ Position ของ Hero

ห้าม Refresh หน้าเพื่อให้ Realtime ทำงาน

ห้ามใช้รูปตัวละครที่มีลิขสิทธิ์โดยไม่มีสิทธิ์ใน Production

---

# 54. เป้าหมายสุดท้าย

ผมต้องการได้ Web Application ที่มีความรู้สึกเหมือน:

"Esports Draft Broadcast Platform"

ไม่ใช่:

"Admin Dashboard ที่มีปุ่ม Pick Hero"

หน้า Control ต้องสวยและใช้งานง่าย

หน้า Overlay ต้องสวยแม้ไม่มี Control UI

Hero ต้องกลืนกับ Frame และ Background

Animation ต้องดู Premium

Template ต้องเปลี่ยนได้

Background ต้องเปลี่ยนได้

Hero ต้องเปลี่ยนได้

ตำแหน่ง Hero ต้องไม่เปลี่ยน

และทุกอย่างต้องทำงาน Real-time ผ่าน Supabase

เริ่มจากสร้าง Project Architecture และ Database Migration ก่อน จากนั้นพัฒนา MVP ตามลำดับ Phase ที่กำหนดด้านบน

ทุก Phase ต้องสามารถรันและทดสอบได้ก่อนเข้าสู่ Phase ถัดไป

อย่าสร้างระบบปลอมเพื่อให้ Demo ผ่าน Acceptance Criteria