# 🔧 FIX: RLS Policy Error - Admin Cannot Add Data

## ❌ **ERROR:**
```
Error creating course: new row violates row-level security policy for table "courses"
```

## 🎯 **ROOT CAUSE:**

Admin login **tidak pakai Supabase Auth**, hanya localStorage. Jadi:
- `auth.uid()` = NULL saat admin login
- RLS policies cek `auth.uid()` untuk verify admin
- RLS block karena tidak bisa verify

## ✅ **QUICK FIX (Jalankan Sekarang!)**

### **Run SQL ini di Supabase:**

```sql
-- File: fix-admin-rls-policies.sql
-- Copy semua content, run di Supabase SQL Editor
```

**Apa yang dilakukan:**
- Buat bypass policy untuk INSERT operations
- Allow semua INSERT tanpa auth check (temporary)
- Admin bisa create course, assignment, chapter, dll

**Trade-off:**
- ⚠️ Less secure (anyone could INSERT if they bypass client)
- ✅ Quick fix, langsung jalan
- ✅ OK untuk development/testing

---

## 🛡️ **PROPER FIX (Recommended untuk Production)**

### **Option 1: Create Admin Account di Supabase Auth**

**Cara termudah via Dashboard:**

1. **Buka Supabase Dashboard** → Authentication → Users
2. **Add User:**
   - Email: `admin@kazedev.com`
   - Password: `159159`
   - ✅ Auto Confirm Email
3. **Create Profile via SQL:**
   ```sql
   INSERT INTO profiles (id, email, full_name, role, progress_percentage)
   SELECT 
     id,
     'admin@kazedev.com',
     'Administrator',
     'admin',
     0
   FROM auth.users
   WHERE email = 'admin@kazedev.com';
   ```

4. **Update AdminLogin.tsx:**
   ```tsx
   // Change from localStorage to Supabase Auth
   export const adminLogin = async (password: string) => {
     const { data, error } = await supabase.auth.signInWithPassword({
       email: 'admin@kazedev.com',
       password: password,
     });
     
     if (error) return { success: false, error: error.message };
     
     // Load profile to verify role = admin
     const { data: profile } = await supabase
       .from('profiles')
       .select('*')
       .eq('id', data.user.id)
       .single();
       
     if (profile?.role !== 'admin') {
       return { success: false, error: 'Not an admin account' };
     }
     
     return { success: true, user: profile };
   };
   ```

5. **Remove bypass policies:**
   ```sql
   DROP POLICY "Allow insert for admin bypass" ON courses;
   DROP POLICY "Allow insert for assignments bypass" ON assignments;
   DROP POLICY "Allow insert for questionnaires bypass" ON questionnaires;
   DROP POLICY "Allow insert for chapters bypass" ON course_chapters;
   ```

**Benefits:**
- ✅ Secure - proper auth.uid() check
- ✅ RLS policies work correctly
- ✅ Production-ready

### **Option 2: Use Service Role Key**

Di admin operations, pakai service role key (bypass RLS):

```tsx
// Create separate Supabase client for admin
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY! // Service role key
);

// Use supabaseAdmin for admin operations
```

**Benefits:**
- ✅ No need to change login flow
- ✅ Bypasses RLS completely for admin
- ⚠️ **DANGEROUS** - service key has full access

**Security Note:** Service role key harus di server-side, **JANGAN** exposed di client!

---

## 📋 **CHECKLIST - PILIH SALAH SATU:**

### **Quick Fix (Development):**
- [ ] Run `fix-admin-rls-policies.sql` di Supabase
- [ ] Test create course
- [ ] ✅ Should work immediately

### **Proper Fix (Production):**
- [ ] Create admin account di Supabase Auth Dashboard
- [ ] Run SQL insert admin profile
- [ ] Update `AdminLogin.tsx` to use Supabase auth
- [ ] Test admin login
- [ ] Remove bypass policies
- [ ] ✅ Secure & production-ready

---

## 🚀 **RECOMMENDATION:**

### **For NOW (Development):**
1. Run `fix-admin-rls-policies.sql` → **Quick fix!**
2. Continue development
3. Everything akan jalan normal

### **Before PRODUCTION:**
1. Implement Option 1 (Create Admin Account)
2. Update AdminLogin.tsx
3. Remove bypass policies
4. Test thoroughly

---

## 📊 **IMPACT:**

**Tables Affected:**
- ✅ `courses` - Admin bisa create
- ✅ `assignments` - Admin bisa create
- ✅ `questionnaires` - Admin bisa create  
- ✅ `course_chapters` - Admin bisa create
- ✅ `profiles` - Already has INSERT policy

**After fix, admin bisa:**
- Create courses ✅
- Add chapters ✅
- Create assignments ✅
- Grade submissions ✅
- All admin operations ✅

---

## 🔍 **VERIFY FIX:**

After running SQL:

1. **Test Create Course:**
   - Login as admin: `/admin` (password: 159159)
   - Go to: `/admin/courses/new`
   - Fill form & submit
   - ✅ Should work without error

2. **Test Other Operations:**
   - Create assignment
   - Add chapter
   - Create questionnaire
   - ✅ All should work

3. **Check RLS:**
   ```sql
   -- Verify policies exist
   SELECT * FROM pg_policies 
   WHERE tablename IN ('courses', 'assignments', 'questionnaires', 'course_chapters');
   ```

---

## ⚡ **QUICK START:**

```bash
# 1. Copy file content
cat fix-admin-rls-policies.sql

# 2. Paste & run di Supabase SQL Editor

# 3. Test immediately
# Go to: http://localhost:5173/admin/courses/new
# Create a course
# ✅ Should work!
```

---

**File yang harus dijalankan:** `fix-admin-rls-policies.sql`

**Jalankan SEKARANG untuk fix error!** 🚀
