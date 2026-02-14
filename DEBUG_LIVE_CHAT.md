# 🔍 Debug Instructions - Live Chat Not Showing Messages

## Kemungkinan Masalah:

### 1. ❌ **Migration Belum Dijalankan**
Table `support_messages` belum ada di database.

**Solution:**
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi file `supabase_migrations/create_support_chat.sql`
3. Klik "Run" / Execute
4. Pastikan muncul notice: "support_messages table created successfully"

---

### 2. ❌ **RLS Policies Terlalu Strict**
Admin tidak bisa lihat pesan member karena RLS (Row Level Security).

**Solution:**
Run debug script untuk cek:
```sql
-- Copy paste di Supabase SQL Editor
-- File: supabase_migrations/debug_support_chat.sql
```

Lihat hasil:
- Jika `table_exists` = FALSE → Run migration dulu
- Jika `total_messages` = 0 → Pesan belum terkirim
- Jika ada pesan tapi admin tidak bisa lihat → RLS issue

---

### 3. ❌ **Pesan Error Saat Insert**
Member tidak bisa insert pesan karena permission atau constraint.

**Cara Debug:**

**A. Sebagai Member:**
1. Login sebagai member
2. Buka floating chat button (pojok kanan bawah)
3. Ketik pesan dan kirim
4. **Buka Browser Console (F12)** → Tab Console
5. Lihat log:
   ```
   [LiveChat] Sending message...
   [LiveChat] Message sent successfully: [...]
   ```
6. Jika ada error → Screenshot dan kirim

**B. Sebagai Admin:**
1. Login sebagai admin
2. Buka `/admin/support`
3. **Buka Browser Console (F12)** → Tab Console
4. Lihat log:
   ```
   [AdminSupport] Loading user chats...
   [AdminSupport] Messages data: [...]
   [AdminSupport] Total messages: X
   ```
5. Jika total messages = 0 padahal sudah kirim → RLS issue

---

## 🔧 **Quick Fix - Temporary Disable RLS for Testing**

Jika mau test cepat tanpa RLS issue:

```sql
-- TEMPORARY: Disable RLS untuk testing
ALTER TABLE support_messages DISABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING:** Ini TIDAK aman untuk production! Setelah test, enable kembali:

```sql
-- Re-enable RLS setelah test
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
```

---

## 📝 **Checklist Debug:**

- [ ] Migration sudah dijalankan?
- [ ] Table `support_messages` exists di database?
- [ ] RLS enabled di table?
- [ ] Member bisa insert pesan? (cek console)
- [ ] Admin bisa select pesan? (cek console)
- [ ] Browser console menunjukkan error apa?

---

## 💡 **Expected Console Logs:**

### ✅ **Working - Member Side:**
```
[LiveChat] Sending message... { user_id: "...", message: "..." }
[LiveChat] Message sent successfully: [{...}]
```

### ✅ **Working - Admin Side:**
```
[AdminSupport] Loading user chats...
[AdminSupport] Messages data: [{...}]
[AdminSupport] Total messages: 1
[AdminSupport] Unique user IDs: ["..."]
[AdminSupport] Profiles data: [{...}]
[AdminSupport] Final chats: [{...}]
```

### ❌ **Error Examples:**
```
[LiveChat] Insert error: { code: "42501", message: "new row violates row-level security policy" }
```
→ RLS policy terlalu strict

```
[AdminSupport] Error fetching messages: { code: "42P01", message: "relation 'support_messages' does not exist" }
```
→ Migration belum dijalankan

---

## 🚀 **To Resume:**

Sekarang:
1. **Test sebagai member** - kirim pesan dan cek console
2. **Test sebagai admin** - buka /admin/support dan cek console
3. **Screenshot console logs** jika ada error
4. Kasih tau hasil nya!
