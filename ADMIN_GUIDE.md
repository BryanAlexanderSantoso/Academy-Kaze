# Admin Features Guide - Kaze For Developers

## 🎯 Overview

Admin memiliki akses penuh untuk mengelola platform pembelajaran, termasuk create/edit/delete courses, assign tugas, dan memberikan nilai.

---

## 🔑 ADMIN LOGIN

**URL:** `/admin`
**Password:** `159159`

---

## 📚 COURSE MANAGEMENT

### 1. View All Courses
**Route:** `/admin/courses`

**Features:**
- ✅ List semua courses (published & draft)
- ✅ Filter by category (FE/BE/FS)
- ✅ Publish/Unpublish toggle
- ✅ Edit course
- ✅ Delete course

### 2. Create New Course
**Route:** `/admin/courses/new`

**Form Fields:**
- **Title** (required) - Nama course
- **Description** (required) - Deskripsi singkat
- **Category** (required) - Frontend / Backend / Fullstack
- **Duration (hours)** - Estimasi durasi belajar
- **Schedule Date** - Tanggal mulai course
- **Thumbnail URL** - Link gambar cover
- **Course Content** (required) - Materi lengkap (HTML/Markdown)
- **Published** - Checkbox untuk publish langsung

**Submit:** Klik "Create Course"

### 3. Edit Course
**Route:** `/admin/courses/:id/edit`

- Load data course yang sudah ada
- Edit semua field
- Save changes

### 4. Delete Course
- Dari halaman `/admin/courses`
- Klik icon trash
- Confirm delete

---

## 📝 ASSIGNMENT MANAGEMENT

### 1. View All Assignments
**Route:** `/admin/assignments`

**Features:**
- ✅ 3 kategori: Pending Review, Graded, Not Submitted
- ✅ Stats badges: Total pending, graded, not submitted
- ✅ Inline grading interface
- ✅ View submission links
- ✅ See due dates & overdue warnings

### 2. Grade Assignment
**Dari halaman:** `/admin/assignments`

**Steps:**
1. Klik "Grade Assignment" pada submission yang pending
2. Masukkan **Grade (0-100)**
3. (Optional) Masukkan **Feedback** untuk student
4. Klik "Submit Grade"

**Grade akan otomatis terlihat oleh student**

### 3. Create New Assignment
**Route:** `/admin/assignments/create`

**Form Fields:**
- **Select Course** (required) - Pilih course yang sudah dibuat
- **Due Date** (optional) - Deadline assignment
- **Select Students** (required) - Pilih 1 atau lebih student

**Bulk Selection:**
- ✅ "Select All Frontend" - Pilih semua student FE
- ✅ "Select All Backend" - Pilih semua student BE
- ✅ "Select All Fullstack" - Pilih semua student FS
- ✅ "Select All" - Pilih semua student
- ✅ "Clear All" - Hapus semua selection

**Submit:** Klik "Create Assignment(s)"

---

## 👥 STUDENT MONITORING

### View Student Progress
**Dari:** `/admin/dashboard`

**Data yang ditampilkan:**
- Total students
- Student name & email
- Learning path (FE/BE/FS)
- Progress percentage
- Recent submissions

---

## ⚡ QUICK ACTIONS (Dashboard)

Dari `/admin/dashboard`, admin bisa langsung akses:

1. **Create Course** → `/admin/courses/new`
2. **Manage Courses** → `/admin/courses`
3. **Grade Assignments** → `/admin/assignments`
4. **Create Assignment** → `/admin/assignments/create`

---

## 🗂️ DATABASE UPDATE REQUIRED

Sebelum menggunakan fitur admin, **JALANKAN SQL INI** di Supabase SQL Editor:

```sql
-- Tambah due_date column
ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Buat index
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
```

**File:** `add-deadline-column.sql`

---

## 📋 WORKFLOW ADMIN

### Scenario 1: Buat Course Baru → Assign ke Students

**Step 1:** Create Course
1. Pergi ke `/admin/courses/new`
2. Isi semua field (title, description, category, content)
3. Centang "Published" jika mau langsung publish
4. Klik "Create Course"

**Step 2:** Assign Course sebagai Assignment
1. Pergi ke `/admin/assignments/create`
2. Pilih course yang baru dibuat
3. Set due date (optional)
4. Pilih students (bisa bulk select by path)
5. Klik "Create Assignment(s)"

**Step 3:** Wait for Submissions
- Students akan lihat assignment di dashboard mereka
- Students submit link (GitHub/Google Drive)

**Step 4:** Grade Submissions
1. Pergi ke `/admin/assignments`
2. Lihat di section "Pending Review"
3. Klik "Grade Assignment"
4. Masukkan grade (0-100) & feedback
5. Submit

### Scenario 2: Update Course Content

1. Pergi ke `/admin/courses`
2. Klik icon "Edit" pada course yang mau diupdate
3. Edit content atau field lainnya
4. Save changes

### Scenario 3: Unpublish Course

1. Pergi ke `/admin/courses`
2. Klik icon "Eye" untuk unpublish
3. Course jadi draft, tidak terlihat oleh students
4. Klik lagi untuk publish ulang

---

## 🎨 ADMIN UI FEATURES

### Course List
- ✅ Published badge (green) / Draft badge (gray)
- ✅ Category badges dengan warna berbeda
- ✅ Quick actions: Publish/Unpublish, Edit, Delete
- ✅ Schedule date & duration display

### Assignment Management
- ✅ Color-coded status: Yellow (Pending), Green (Graded), Red (Overdue)
- ✅ Inline grading form
- ✅ Student info display
- ✅ Submission link clickable
- ✅ Stats cards untuk monitoring

### Create Assignment
- ✅ Student list dengan checkboxes
- ✅ Learning path badges
- ✅ Bulk selection buttons
- ✅ Real-time selection counter

---

## 📊 ADMIN DASHBOARD STATS

**4 Stat Cards:**
1. **Total Students** - Jumlah member terdaftar
2. **Total Courses** - Jumlah courses di database
3. **Pending Reviews** - Assignments yang belum di-grade
4. **Avg Progress** - Rata-rata progress semua student

---

## 🔧 TROUBLESHOOTING

### Problem: "due_date column doesn't exist"
**Solusi:**
- Jalankan `add-deadline-column.sql` di Supabase
- Restart dev server

### Problem: Tidak bisa delete course
**Solusi:**
- Course mungkin masih ada assignments yang terkait
- Delete assignments dulu, baru delete course
- Atau ubah RLS policy untuk cascade delete

### Problem: Student tidak melihat assignment
**Solusi:**
- Pastikan course sudah published
- Pastikan student_id benar di assignment
- Pastikan learning_path student match dengan course category

---

## ✨ BEST PRACTICES

### Creating Courses
1. **Draft first:** Buat course sebagai draft, cek content
2. **Test publish:** Publish ke 1 student dulu untuk testing
3. **Bulk publish:** Setelah yakin, assign ke semua student

### Grading
1. **Provide feedback:** Selalu kasih feedback untuk student insight
2. **Be consistent:** Gunakan grading scale yang konsisten
3. **Grade promptly:** Grade sesegera mungkin setelah submission

### Assignment Creation
1. **Set realistic deadlines:** Berikan waktu cukup untuk students
2. **Group by path:** Assign berdasarkan learning path untuk relevansi
3. **Clear instructions:** Pastikan course content jelas tentang yang harus di-submit

---

## 🚀 NEXT FEATURES (Coming Soon)

- [ ] **Questionnaire Builder** - Create quizzes untuk students
- [ ] **Bulk Delete** - Delete multiple courses/assignments sekaligus
- [ ] **Student Detail Page** - Lihat detail lengkap per student
- [ ] **Assignment Templates** - Save assignment settings sebagai template
- [ ] **Auto-grading** - Grading otomatis untuk quiz
- [ ] **Export Reports** - Export student progress ke CSV/PDF
- [ ] **Email Notifications** - Auto send email saat grade keluar

---

## 📞 SUPPORT

Jika ada issue:
1. Cek console browser untuk error
2. Verifikasi SQL schema sudah lengkap
3. Pastikan RLS policies allow admin access
4. Check network tab untuk API errors

---

**Happy Teaching! 🎓**
