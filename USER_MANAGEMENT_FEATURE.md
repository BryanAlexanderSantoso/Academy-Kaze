# 👥 User Management Feature

Admin dapat mengelola semua user/murid dengan fitur ban dan unban.

## 🎯 Fitur

### 1. **Lihat Daftar User**
- Tampilkan semua user dengan informasi lengkap:
  - Nama & Email
  - Role (Admin/Member)
  - Learning Path
  - Premium Status
  - Tanggal Join
  - Status (Active/Banned)

### 2. **Search & Filter**
- **Search**: Cari user by name atau email
- **Filter by Role**: All / Members Only / Admins Only
- **Filter by Status**: All / Active / Banned

### 3. **Ban User**
- Admin bisa ban user member
- User yang di-ban tidak bisa login
- Konfirmasi sebelum ban
- Admin tidak bisa di-ban

### 4. **Unban User**
- Admin bisa unban user yang sudah di-ban
- User bisa login kembali setelah di-unban

## 🚀 Cara Akses

1. **Login sebagai Admin**
   - Go to: `http://localhost:5173/admin`
   - Masukkan password admin

2. **Buka User Management**
   - Klik icon **Users** 👥 di sidebar kiri (kedua dari atas)
   - Atau langsung ke: `http://localhost:5173/admin/users`

3. **Manage Users**
   - **Ban**: Klik tombol "Ban User" merah
   - **Unban**: Klik tombol "Unban" hijau
   - **Search**: Ketik nama/email di search bar
   - **Filter**: Pilih dropdown filter

## 📊 Database

### Migration Required:
```sql
-- Run this SQL in Supabase SQL Editor
-- File: supabase_migrations/add_is_banned_column.sql

ALTER TABLE profiles 
ADD COLUMN is_banned BOOLEAN DEFAULT FALSE NOT NULL;

CREATE INDEX idx_profiles_is_banned 
ON profiles(is_banned) 
WHERE is_banned = true;
```

### Table Structure:
```typescript
profiles {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'member'
  learning_path: 'fe' | 'be' | 'fs' | 'seo' | null
  is_premium: boolean
  is_banned: boolean  // ← NEW COLUMN
  created_at: timestamp
}
```

## 🔒 Security

### 1. **Login Protection**
- Banned users tidak bisa login
- Auto sign-out jika user sudah login saat di-ban
- Error message: "Your account has been suspended. Please contact support for assistance."

### 2. **Admin Protection**  
- Admin tidak bisa ban admin lain
- Hanya member yang bisa di-ban/unban
- Button "Ban User" tidak muncul untuk admin

### 3. **Permission Check**
- Halaman `/admin/users` butuh admin role
- Protected dengan `<ProtectedRoute requireAdmin>`

## 📱 UI Features

### Stats Cards
- **Total Users**: Jumlah seluruh user
- **Active Users**: User yang tidak di-ban
- **Banned Users**: User yang di-ban

### User Table
- **Responsive**: Mobile-friendly table
- **Sortable**: Sort by join date
- **Badges**: Visual indicators untuk:
  - Role (Admin/Member)
  - Learning Path (Frontend/Backend/Fullstack/SEO)
  - Premium Status (Crown icon 👑)
  - Account Status (Active ✓ / Banned ⛔)

### Actions
- **Ban Button**: Merah, dengan konfirmasi
- **Unban Button**: Hijau, langsung unban
- **Real-time Update**: Table update otomatis setelah ban/unban

## 🎨 Design

- **Clean Table Layout**: Professional admin interface
- **Color-coded Badges**: Easy visual scanning
- **Responsive Grid**: Works on mobile & desktop
- **Smooth Animations**: Framer Motion transitions
- **Search Highlight**: Real-time search filtering

## 🔧 Technical Details

### Files Added:
1. `/src/pages/admin/AdminUsers.tsx` - Main component
2. `/supabase_migrations/add_is_banned_column.sql` - DB migration

### Files Modified:
1. `/src/App.tsx` - Added route `/admin/users`
2. `/src/pages/AdminDashboard.tsx` - Added sidebar button
3. `/src/lib/auth.ts` - Added ban check in signIn()

### API Calls:
- **Load Users**: `supabase.from('profiles').select('*')`
- **Ban User**: `supabase.from('profiles').update({ is_banned: true })`
- **Unban User**: `supabase.from('profiles').update({ is_banned: false })`

## ⚠️ Important Notes

1. **Run Migration First!**
   - Sebelum pakai fitur ini, run SQL migration
   - Atau add column `is_banned` manual di Supabase dashboard

2. **Testing**
   - Test dengan account member
   - Jangan ban admin account
   - Verify login protection works

3. **Production Ready**
   - ✅ Security implemented
   - ✅ Error handling
   - ✅ Responsive design
   - ✅ User confirmations

## 📸 Screenshots

### User Table
- List semua users dengan info lengkap
- Search & filter functionality
- Ban/Unban buttons

### Stats Overview
- Total, Active, Banned counts
- Color-coded for quick insight

---

**Created**: 2026-02-14  
**Feature Status**: ✅ Ready to Use  
**Requires**: Supabase migration + Admin access
