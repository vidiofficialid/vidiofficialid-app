#!/bin/bash

echo "========================================"
echo "VERIFIKASI STRUKTUR EDITOR-BLOG"
echo "========================================"
echo ""

# Check structure
echo "📁 Struktur folder src/app/editor-blog/:"
echo ""

if [ -d "src/app/editor-blog" ]; then
    find src/app/editor-blog -type f -name "*.tsx" -o -name "*.ts" | sort | while read file; do
        # Count depth for indentation
        depth=$(echo "$file" | tr -cd '/' | wc -c)
        indent=""
        for ((i=3; i<depth; i++)); do
            indent="$indent  "
        done
        filename=$(basename "$file")
        dirname=$(dirname "$file" | sed 's|src/app/editor-blog/||')
        if [ "$dirname" = "src/app/editor-blog" ]; then
            echo "├── $filename"
        else
            echo "$indent├── $dirname/$filename"
        fi
    done
else
    echo "❌ Folder src/app/editor-blog tidak ditemukan!"
    exit 1
fi

echo ""
echo "========================================"
echo "CHECKLIST FILE YANG HARUS ADA"
echo "========================================"
echo ""

# Required files
files=(
    "src/app/editor-blog/layout.tsx"
    "src/app/editor-blog/login/page.tsx"
    "src/app/editor-blog/(dashboard)/layout.tsx"
    "src/app/editor-blog/(dashboard)/page.tsx"
    "src/app/editor-blog/(dashboard)/posts/page.tsx"
    "src/app/editor-blog/(dashboard)/posts/PostActions.tsx"
    "src/app/editor-blog/(dashboard)/posts/new/page.tsx"
    "src/app/editor-blog/(dashboard)/posts/[slug]/page.tsx"
    "src/app/editor-blog/(dashboard)/posts/[slug]/EditPostForm.tsx"
    "src/app/editor-blog/(dashboard)/videos/page.tsx"
    "src/app/editor-blog/(dashboard)/seo/page.tsx"
    "src/lib/actions/editor-auth.ts"
    "src/lib/supabase/middleware.ts"
    "src/components/editor/EditorSidebar.tsx"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (TIDAK ADA!)"
        all_exist=false
    fi
done

echo ""

# Check file that should NOT exist
echo "========================================"
echo "FILE YANG TIDAK BOLEH ADA"
echo "========================================"
echo ""

bad_files=(
    "src/app/editor-blog/page.tsx"
    "src/app/editor-blog/posts/page.tsx"
    "src/app/editor-blog/videos/page.tsx"
    "src/app/editor-blog/seo/page.tsx"
)

for file in "${bad_files[@]}"; do
    if [ -f "$file" ]; then
        echo "⚠️  $file (HARUS DIHAPUS!)"
        all_exist=false
    else
        echo "✅ $file (tidak ada - benar)"
    fi
done

echo ""
echo "========================================"
echo "HASIL"
echo "========================================"
echo ""

if [ "$all_exist" = true ]; then
    echo "✅ Semua file sudah benar!"
    echo ""
    echo "Lanjutkan dengan:"
    echo "  npx tsc --noEmit"
    echo ""
else
    echo "❌ Ada file yang perlu diperbaiki!"
fi
