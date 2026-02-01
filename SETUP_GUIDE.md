# Setup Guide - Kaze For Developers

## Langkah 1: Setup Supabase

### 1.1 Buat Akun Supabase
1. Kunjungi https://supabase.com
2. Klik "Start your project"
3. Sign up dengan GitHub/Google atau email

### 1.2 Buat Project Baru
1. Setelah login, klik "New Project"
2. Pilih organization atau buat baru
3. Isi detail project:
   - **Name**: Kaze Developer
   - **Database Password**: Buat password yang kuat (simpan ini!)
   - **Region**: Pilih yang terdekat dengan lokasi Anda
4. Klik "Create new project"
5. Tunggu 2-3 menit hingga project selesai dibuat

### 1.3 Dapatkan API Credentials
1. Setelah project dibuat, buka dashboard
2. Klik icon ⚙️ **Settings** di sidebar kiri
3. Pilih **API** dari menu Settings
4. Copy dua value berikut:
   - **Project URL** (contoh: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (key yang panjang)

### 1.4 Jalankan Database Schema
1. Kembali ke dashboard Supabase
2. Klik **SQL Editor** di sidebar kiri
3. Klik tombol **+ New query**
4. Buka file `supabase-schema.sql` dari project ini
5. Copy SELURUH isi file
6. Paste ke SQL Editor
7. Klik tombol **Run** (atau tekan Ctrl/Cmd + Enter)
8. Tunggu hingga muncul pesan "Success. No rows returned"

✅ Database Anda sekarang sudah siap!

---

## Langkah 2: Konfigurasi Environment Variables

### 2.1 Edit File .env
1. Buka file `.env` di root project
2. Ganti value berikut dengan credentials dari Supabase:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ADMIN_PASSWORD=159159
```

**Contoh Lengkap:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ADMIN_PASSWORD=159159
```

⚠️ **Penting**: Pastikan tidak ada spasi sebelum atau sesudah `=`

---

## Langkah 3: Testing Aplikasi

### 3.1 Cek Development Server
Development server sudah berjalan di: **http://localhost:5173**

### 3.2 Test Member Flow
1. Buka browser dan kunjungi `http://localhost:5173`
2. Klik **"Sign up"**
3. Daftar dengan email dan password (contoh):
   - Email: `student@test.com`
   - Password: `password123`
   - Full Name: `Test Student`
4. Setelah signup, pilih learning path:
   - Frontend Development
   - Backend Development
   - Fullstack Development
5. Explore member dashboard

### 3.3 Test Admin Flow
1. Buka `http://localhost:5173/admin`
2. Masukkan password: `159159`
3. Klik "Access Admin Panel"
4. Explore admin dashboard

---

## Langkah 4: Verifikasi Database

### 4.1 Cek Tabel di Supabase
1. Buka Supabase dashboard
2. Klik **Table Editor** di sidebar
3. Anda harus melihat 4 tabel:
   - ✅ profiles
   - ✅ courses
   - ✅ assignments
   - ✅ questionnaires

### 4.2 Cek Data Profiles
1. Klik tabel **profiles**
2. Setelah signup, Anda akan melihat row baru dengan data user
3. Periksa kolom:
   - id, email, full_name
   - role = "member"
   - learning_path (setelah onboarding)

---

## Troubleshooting

### Problem: "Failed to fetch" atau "Invalid API key"
**Solusi:**
- Pastikan `.env` file sudah benar
- Restart development server: `Ctrl+C` lalu `npm run dev`
- Clear browser cache

### Problem: Login tidak berfungsi
**Solusi:**
- Buka Supabase dashboard → Authentication → Settings
- Pastikan "Enable Email Provider" is ON
- Pastikan "Confirm Email" is OFF (untuk testing)

### Problem: Data tidak muncul
**Solusi:**
- Buka browser console (F12)
- Lihat apakah ada error di Network tab
- Pastikan RLS policies sudah dibuat (cek SQL schema)

### Problem: Admin login gagal
**Solusi:**
- Pastikan menggunakan `/admin` route
- Password harus persis: `159159`
- Clear localStorage: `localStorage.clear()` di console

---

## Fitur yang Sudah Selesai ✅

### Authentication
- ✅ Member signup dengan email/password
- ✅ Member login
- ✅ Admin login dengan password
- ✅ Protected routes
- ✅ Session persistence
- ✅ Logout

### Member Dashboard
- ✅ Overview dengan stats
- ✅ Courses list (filtered by learning path)
- ✅ Course detail page
- ✅ Assignments submission
- ✅ Questionnaires list
- ✅ Profile page dengan edit

### Admin Dashboard
- ✅ Statistics overview
- ✅ Student list dengan progress
- ✅ Assignment review queue
- ✅ Quick action links

### Database
- ✅ Complete schema dengan RLS
- ✅ All tables created
- ✅ Indexes untuk performance
- ✅ Row Level Security policies

### UI/UX
- ✅ Apple-esque clean design
- ✅ Responsive mobile layout
- ✅ Dynamic theming per learning path
- ✅ Smooth animations
- ✅ Loading states

---

## Fitur yang Perlu Ditambahkan (Optional)

### Priority 1 - Core Features
- [ ] **Admin: Create Course** - Form untuk membuat course baru
- [ ] **Admin: Edit Course** - Edit course yang sudah ada
- [ ] **Admin: Grade Assignment** - UI untuk memberi nilai
- [ ] **Admin: Create Questionnaire** - Form builder untuk quiz
- [ ] **Rich Text Editor** - Untuk course content (TipTap/Quill)

### Priority 2 - Enhanced Features
- [ ] **File Upload** - Upload assignment files ke Supabase Storage
- [ ] **Questionnaire Builder** - Dynamic form dengan berbagai tipe soal
- [ ] **Progress Calculation** - Auto-update progress berdasarkan completion
- [ ] **Notification System** - Real-time notifications
- [ ] **Search & Filter** - Advanced filtering di course list

### Priority 3 - Advanced Features
- [ ] **Discussion Forum** - Student collaboration
- [ ] **Certificate Generation** - PDF certificates saat selesai
- [ ] **Analytics Dashboard** - Charts dengan Recharts
- [ ] **Dark Mode** - Theme switcher
- [ ] **Email Notifications** - Send emails via Resend/SendGrid
- [ ] **Video Lessons** - Embed YouTube/Vimeo
- [ ] **Code Playground** - Integrated code editor

---

## Commands Cheat Sheet

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build production
npm run preview          # Preview production build

# Linting
npm run lint             # Check code quality

# Dependencies
npm install --legacy-peer-deps    # Install/update dependencies
```

---

## File Structure Reference

```
src/
├── components/          # Reusable components (untuk future use)
├── contexts/
│   └── AuthContext.tsx # Global auth state
├── lib/
│   ├── supabase.ts     # Supabase client & types
│   └── auth.ts         # Auth utilities
├── pages/
│   ├── Login.tsx       # Member login
│   ├── Signup.tsx      # Member signup
│   ├── AdminLogin.tsx  # Admin login
│   ├── Onboarding.tsx  # Learning path selection
│   ├── MemberDashboard.tsx  # Member layout
│   ├── AdminDashboard.tsx   # Admin overview
│   └── dashboard/
│       ├── DashboardOverview.tsx  # Member home
│       ├── Courses.tsx            # Courses list
│       ├── CourseDetail.tsx       # Course content
│       ├── Assignments.tsx        # Assignment submission
│       ├── Questionnaires.tsx     # Quiz list
│       └── Profile.tsx            # User profile
├── App.tsx             # Router & routes
├── main.tsx            # Entry point
└── index.css           # Global styles + Tailwind
```

---

## Support

Jika ada masalah:
1. Cek console browser (F12) untuk error messages
2. Cek terminal untuk server errors
3. Verifikasi `.env` file sudah benar
4. Pastikan Supabase project aktif
5. Restart development server

---

**🎉 Platform Anda sudah siap digunakan!**

Untuk mulai menggunakan, jalankan:
```bash
npm run dev
```

Lalu buka: http://localhost:5173
