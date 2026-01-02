-- ============================================
-- SQL Script untuk Approval System VidiOfficialID
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Pastikan kolom-kolom yang diperlukan ada di tabel testimonials
-- (Jika sudah ada, perintah ini akan di-skip)

DO $$ 
BEGIN
    -- Add approved_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'approved_at') THEN
        ALTER TABLE testimonials ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;

    -- Add rejected_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'rejected_at') THEN
        ALTER TABLE testimonials ADD COLUMN rejected_at TIMESTAMPTZ;
    END IF;

    -- Add expires_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'expires_at') THEN
        ALTER TABLE testimonials ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;

    -- Add deleted_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'deleted_at') THEN
        ALTER TABLE testimonials ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;

    -- Add cloudinary_id column if not exists (untuk tracking public_id Cloudinary)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'cloudinary_id') THEN
        ALTER TABLE testimonials ADD COLUMN cloudinary_id TEXT;
    END IF;
END $$;

-- 2. Update enum type untuk status (jika belum ada DELETED)
-- Cek dulu apakah enum sudah ada
DO $$
BEGIN
    -- Tambahkan DELETED ke enum jika belum ada
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'DELETED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'testimonial_status')
    ) THEN
        ALTER TYPE testimonial_status ADD VALUE IF NOT EXISTS 'DELETED';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- Jika enum tidak ada, buat baru
        CREATE TYPE testimonial_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DELETED');
END $$;

-- 3. RLS Policies untuk testimonials (update untuk service role access)

-- Drop existing policies first (jika ada)
DROP POLICY IF EXISTS "Public can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Users can view own testimonials" ON testimonials;
DROP POLICY IF EXISTS "Users can update own testimonials" ON testimonials;
DROP POLICY IF EXISTS "Service role full access" ON testimonials;

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Public dapat insert testimonial (untuk recording page)
CREATE POLICY "Public can insert testimonials" 
ON testimonials FOR INSERT 
WITH CHECK (true);

-- Policy: Authenticated users dapat melihat testimonial dari campaign mereka
CREATE POLICY "Users can view own testimonials" 
ON testimonials FOR SELECT 
USING (
    campaign_id IN (
        SELECT c.id FROM campaigns c
        JOIN businesses b ON c.business_id = b.id
        WHERE b.user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
);

-- Policy: Authenticated users dapat update testimonial dari campaign mereka
CREATE POLICY "Users can update own testimonials" 
ON testimonials FOR UPDATE 
USING (
    campaign_id IN (
        SELECT c.id FROM campaigns c
        JOIN businesses b ON c.business_id = b.id
        WHERE b.user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
);

-- 4. Index untuk performa query cleanup
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_expires_at ON testimonials(expires_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_recorded_at ON testimonials(recorded_at);

-- 5. View untuk melihat testimonial yang akan expired (opsional, untuk monitoring)
CREATE OR REPLACE VIEW testimonials_expiring_soon AS
SELECT 
    t.id,
    t.status,
    t.recorded_at,
    t.approved_at,
    t.rejected_at,
    t.expires_at,
    c.title as campaign_title,
    c.customer_name,
    b.name as business_name,
    CASE 
        WHEN t.status = 'PENDING' THEN 
            DATE_PART('day', (t.recorded_at + INTERVAL '10 days') - NOW())
        WHEN t.status IN ('APPROVED', 'REJECTED') AND t.expires_at IS NOT NULL THEN 
            DATE_PART('day', t.expires_at - NOW())
        ELSE NULL
    END as days_until_deletion
FROM testimonials t
JOIN campaigns c ON t.campaign_id = c.id
JOIN businesses b ON c.business_id = b.id
WHERE t.status != 'DELETED'
ORDER BY 
    CASE 
        WHEN t.status = 'PENDING' THEN t.recorded_at + INTERVAL '10 days'
        ELSE t.expires_at
    END ASC;

-- ============================================
-- PENTING: Setelah menjalankan SQL ini, pastikan:
-- 1. CLOUDINARY_API_KEY dan CLOUDINARY_API_SECRET 
--    sudah ditambahkan di Vercel Environment Variables
-- 2. SUPABASE_SERVICE_ROLE_KEY sudah ada di Vercel
-- ============================================

-- Verifikasi struktur tabel
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'testimonials'
ORDER BY ordinal_position;
