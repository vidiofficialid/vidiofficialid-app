# 📋 VidiOfficialID - Dokumen Pengantar Pengembangan
## Handover Document untuk Sesi Percakapan Baru

**Tanggal Terakhir Update:** 2 Januari 2026  
**Versi Aplikasi:** Production (Live di https://vidi.official.id)  
**Repository:** Vercel Deployment (Auto-deploy dari Git)

---

## 🎯 Ringkasan Proyek

**VidiOfficialID** adalah platform video testimonial untuk UMKM Indonesia. Platform ini memungkinkan pengguna bisnis mengumpulkan video testimonial dari pelanggan mereka melalui sistem campaign dan invitation.

### Fitur Utama yang Sudah Berjalan:
1. ✅ **Landing Page** - Homepage dengan slider, fitur, blog preview
2. ✅ **Authentication** - Login/Register email + Google SSO
3. ✅ **Dashboard** - Statistik, profil pengguna, quick actions
4. ✅ **Business Management** - CRUD bisnis dengan logo upload
5. ✅ **Campaign Management** - Buat campaign, kirim undangan WhatsApp/Email
6. ✅ **Video Recording** - Perekaman video testimonial dengan webcam
7. ✅ **Testimonial Approval** - Approve/Reject dengan auto-cleanup
8. ✅ **Blog System** - CMS untuk artikel dengan editor dashboard
9. ✅ **SEO Settings** - Pengaturan meta tags per halaman

---

## 🛠 Tech Stack

### Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Next.js | 15.x | React Framework dengan App Router |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.x | Styling |
| Framer Motion | 11.x | Animasi |
| Lucide React | - | Icon Library |

### Backend & Database
| Teknologi | Kegunaan |
|-----------|----------|
| Supabase | Database PostgreSQL + Authentication |
| Supabase Auth | User authentication (Email + Google OAuth) |
| Supabase RLS | Row Level Security policies |

### Layanan Pihak Ketiga
| Layanan | Kegunaan | Environment Variables |
|---------|----------|----------------------|
| Cloudinary | Video & Image hosting | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Vercel | Hosting & Deployment | Auto-configured |
| Vercel Cron | Scheduled cleanup jobs | Configured in `vercel.json` |

### Environment Variables yang Diperlukan
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dsv8iy2la
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://vidi.official.id
```

---

## 📁 Struktur Folder Aplikasi

```
vidiofficialid/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth pages group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/              # Dashboard group (dengan layout)
│   │   │   ├── layout.tsx            # Dashboard layout (Header, SideNav, BottomNav)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx          # Dashboard home
│   │   │       ├── DashboardContent.tsx
│   │   │       ├── business/         # Kelola bisnis
│   │   │       ├── campaign/         # Kelola campaign
│   │   │       └── testimonials/     # Lihat & approve testimonial
│   │   ├── api/                      # API Routes
│   │   │   ├── testimonials/
│   │   │   │   ├── route.ts          # POST: Submit testimonial
│   │   │   │   └── approval/
│   │   │   │       └── route.ts      # POST: Approve/Reject
│   │   │   ├── cron/
│   │   │   │   └── cleanup/
│   │   │   │       └── route.ts      # Auto-cleanup expired videos
│   │   │   └── contact/
│   │   ├── auth/callback/            # OAuth callback
│   │   ├── record/[campaignId]/      # Halaman rekam video (public)
│   │   ├── blog/                     # Blog public
│   │   ├── editor-blog/              # Blog CMS (editor only)
│   │   ├── about/
│   │   ├── contact-us/
│   │   ├── privacy-policy/
│   │   ├── terms-of-service/
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/                     # Login, Register forms
│   │   ├── dashboard/                # Header, SideNav, BottomNav
│   │   ├── landing/                  # Hero, Features, Footer
│   │   ├── record/                   # RecordSection, RateSection
│   │   ├── editor/                   # EditorSidebar
│   │   └── ui/                       # Button, Input, Label (shadcn)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts
│   │   ├── actions/
│   │   │   ├── auth.ts               # signIn, signOut, signUp
│   │   │   ├── editor-auth.ts        # Editor login
│   │   │   └── blog.ts               # Blog CRUD
│   │   ├── email.ts                  # Email utilities
│   │   └── utils.ts                  # cn() helper
│   ├── types/
│   │   └── database.ts               # TypeScript types untuk Supabase
│   └── middleware.ts                 # Auth middleware
├── public/
│   ├── logo.svg
│   └── images/
├── database/
│   └── approval_system.sql           # SQL migrations
├── package.json
├── vercel.json                       # Cron job config
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄 Database Schema (Supabase PostgreSQL)

### Tabel Utama

#### 1. `profiles` (2 rows)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, FK to auth.users) | User ID |
| email | text (unique) | Email address |
| name | text | Display name |
| avatar_url | text | Profile picture URL |
| role | user_role enum | 'user' / 'editor' / 'admin' |
| auth_provider | auth_provider enum | 'email' / 'google' |
| email_verified | boolean | Email verification status |
| whatsapp | text | WhatsApp number |
| address | text | Address |
| created_at, updated_at | timestamptz | Timestamps |

#### 2. `businesses` (1 row)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Business ID |
| user_id | uuid (FK to profiles) | Owner |
| name | text | Business name |
| slug | text (unique) | URL slug |
| company_name | text | Company legal name |
| owner_name | text | Owner name |
| nib | text | NIB number |
| kbli | text | KBLI code |
| product_category | text | 'PRODUK' / 'JASA' |
| logo | text | Cloudinary URL |
| description | text | Business description |
| created_at, updated_at | timestamptz | Timestamps |

#### 3. `campaigns` (1 row)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Campaign ID |
| business_id | uuid (FK to businesses) | Parent business |
| title | text | Campaign title |
| brand_name | text | Brand name |
| product_image | text | Product image URL |
| testimonial_script | text | Script for customer |
| gesture_guide | text | Gesture instructions |
| customer_name | text | Customer name |
| customer_email | text | Customer email |
| customer_whatsapp | text | Customer WhatsApp |
| status | text | 'DRAFT' / 'INVITED' / 'RECORDED' / 'COMPLETED' |
| invite_method | text | 'EMAIL' / 'WHATSAPP' / 'BOTH' |
| invite_sent_at | timestamptz | When invitation sent |
| created_at, updated_at | timestamptz | Timestamps |

#### 4. `testimonials` (1 row)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Testimonial ID |
| campaign_id | uuid (FK to campaigns) | Parent campaign |
| video_url | text | Cloudinary video URL |
| thumbnail_url | text | Video thumbnail |
| duration | integer | Video duration (seconds) |
| file_size | integer | File size (bytes) |
| cloudinary_id | text | Cloudinary public_id for deletion |
| recorded_at | timestamptz | Recording timestamp |
| device_info | text (JSON) | Customer name, ratings |
| status | text | 'PENDING' / 'APPROVED' / 'REJECTED' / 'DELETED' |
| approved_at | timestamptz | Approval timestamp |
| rejected_at | timestamptz | Rejection timestamp |
| expires_at | timestamptz | Auto-delete date |
| deleted_at | timestamptz | Deletion timestamp |
| created_at | timestamptz | Created timestamp |

#### 5. `blog_posts` (4 rows)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Post ID |
| title | text | Post title |
| slug | text (unique) | URL slug |
| excerpt | text | Short description |
| content | text | Full content (HTML/Markdown) |
| image | text | Featured image URL |
| published | boolean | Publication status |
| published_at | timestamptz | Publication date |
| author_id | uuid (FK to profiles) | Author |
| created_at, updated_at | timestamptz | Timestamps |

#### 6. `seo_settings` (3 rows)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Setting ID |
| page_name | text (unique) | Page identifier |
| title | text | Meta title |
| description | text | Meta description |
| keywords | text | Meta keywords |
| og_image | text | Open Graph image |
| updated_by | uuid (FK) | Last editor |
| updated_at | timestamptz | Last update |

#### 7. `landing_content` (3 rows)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Content ID |
| section_name | text (unique) | Section identifier (hero, process, video_slider) |
| content | jsonb | Section content data |
| updated_by | uuid (FK) | Last editor |
| updated_at | timestamptz | Last update |

#### 8. `contact_messages`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Message ID |
| name | text | Sender name |
| email | text | Sender email |
| whatsapp | text | Sender WhatsApp |
| message | text | Message content |
| created_at | timestamptz | Timestamp |

### Enum Types
```sql
-- user_role: 'user', 'editor', 'admin'
-- auth_provider: 'email', 'google'
```

### Foreign Key Relationships
```
profiles.id ← businesses.user_id
profiles.id ← blog_posts.author_id
profiles.id ← landing_content.updated_by
profiles.id ← seo_settings.updated_by
businesses.id ← campaigns.business_id
campaigns.id ← testimonials.campaign_id
```

### Indexes
- `idx_testimonials_status` - For cleanup queries
- `idx_testimonials_expires_at` - For expiry queries
- `idx_testimonials_recorded_at` - For auto-delete pending

### RLS Policies (Row Level Security)
- **profiles**: Users can CRUD own profile only
- **businesses**: Users can CRUD own businesses only
- **campaigns**: Users can CRUD campaigns for own businesses, public can SELECT for recording
- **testimonials**: Public can INSERT, users can view/update own testimonials via campaign→business chain
- **blog_posts**: Public can read published, editors can manage all
- **seo_settings, landing_content**: Public can read, editors can update

---

## ⚠️ Known Issues & TypeScript Errors

### Error yang Sering Terjadi saat Vercel Deploy:

#### 1. Supabase Type Errors
```typescript
// ❌ ERROR: Property 'id' does not exist on type 'never'
const { data } = await supabase.from('testimonials').select('*')

// ✅ SOLUSI: Cast ke any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data } = await (supabase as any).from('testimonials').select('*')
```

#### 2. Framer Motion Import
```typescript
// ❌ ERROR: Module not found
import { motion } from 'motion/react'

// ✅ GUNAKAN:
import { motion } from 'framer-motion'
```

#### 3. Missing 'use client' Directive
```typescript
// ❌ ERROR: useState/useEffect in Server Component

// ✅ Tambahkan di baris pertama file
'use client'
```

#### 4. Server Actions harus async
```typescript
// ❌ ERROR
export function signOut() { ... }

// ✅ GUNAKAN:
export async function signOut() { ... }
```

---

## 🔄 Mekanisme Approval Testimonial

### Alur Kerja:
```
Customer Submit Video → [PENDING]
                            ↓
           ┌────────────────┴────────────────┐
           ↓                                  ↓
      APPROVE                             REJECT
           ↓                                  ↓
     [APPROVED]                         [REJECTED]
    expires_at +15 hari               expires_at +3 hari
           ↓                                  ↓
   (Download available)              (Video akan dihapus)
           ↓                                  ↓
     [DELETED]                          [DELETED]
   (Auto cleanup)                    (Auto cleanup)
```

### Auto-Cleanup Rules:
| Status | Kondisi | Aksi |
|--------|---------|------|
| PENDING | > 10 hari sejak `recorded_at` | Delete from Cloudinary, set DELETED |
| APPROVED | Melewati `expires_at` (15 hari) | Delete from Cloudinary, set DELETED |
| REJECTED | Melewati `expires_at` (3 hari) | Delete from Cloudinary, set DELETED |

### Cron Job:
- **Path:** `/api/cron/cleanup`
- **Schedule:** Setiap hari jam 00:00 UTC
- **Config:** `vercel.json`

---

## 📱 User Accounts (Testing)

| Email | Role | Password | Notes |
|-------|------|----------|-------|
| harizalbanget@gmail.com | user | - | Main test user, has business & campaign |
| harizalgaya@gmail.com | editor | - | Editor for blog CMS |

---

## 🚀 Deployment Workflow

```bash
# 1. Extract zip ke folder project
cd ~/Documents/vidiofficialid
unzip -o ~/Downloads/[nama_file].zip

# 2. Install dependencies
npm install

# 3. Build locally untuk cek TypeScript errors
npm run build

# 4. Deploy ke Vercel
git add .
git commit -m "feat: description"
git push origin main

# Vercel auto-deploy dari main branch
```

---

## 🎯 Area Pengembangan Selanjutnya

### Fitur yang Bisa Ditambahkan:
1. **Video Editor** - Trim, add text/logo ke video testimonial
2. **Analytics Dashboard** - Statistik view, conversion rate
3. **Bulk Invitation** - Undang banyak customer sekaligus
4. **Template Campaign** - Pre-made campaign templates
5. **Video Gallery** - Public gallery untuk showcase
6. **Export Video** - Download dengan watermark/branding
7. **Multi-language** - Bahasa Indonesia/English
8. **Push Notifications** - Notifikasi saat ada testimonial baru
9. **Integration** - WhatsApp Business API, Email service
10. **Payment Gateway** - Untuk fitur premium

### Keamanan yang Bisa Ditingkatkan:
1. Rate limiting pada API routes
2. Input validation & sanitization
3. CSRF protection
4. Video file validation (max size, format)
5. Audit logging untuk actions

### UI/UX Improvements:
1. Dark mode
2. Better loading states
3. Skeleton loaders
4. Toast notifications
5. Keyboard shortcuts
6. PWA support

---

## 📞 Kontak & Support

- **Website:** https://vidi.official.id
- **Owner:** Harizal (harizalbanget@gmail.com)

---

## 📝 Catatan Penting untuk Claude

1. **Selalu build dulu** sebelum commit untuk menghindari TypeScript errors
2. **Gunakan `(supabase as any)`** untuk menghindari type errors Supabase
3. **Jangan hapus fitur yang sudah ada** - hanya tambahkan atau perbaiki
4. **Test di local** dengan `npm run dev` sebelum deploy
5. **Perhatikan RLS policies** saat membuat query database
6. **Cloudinary upload** menggunakan unsigned preset untuk client-side
7. **Video recording** maksimal 60 detik, bitrate 1Mbps
8. **Cron job** berjalan otomatis, tidak perlu trigger manual

---

*Dokumen ini dibuat pada 2 Januari 2026 sebagai handover untuk sesi percakapan baru.*
