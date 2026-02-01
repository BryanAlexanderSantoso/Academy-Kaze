# 🔍 DEBUG: Data Tidak Masuk Database

## 🎯 **TROUBLESHOOTING STEPS:**

### **Step 1: Run Debug SQL**

**File:** `debug-database.sql`

Di Supabase SQL Editor, run queries di file itu untuk check:
- ✅ RLS policies exist?
- ✅ RLS enabled?
- ✅ Current auth.uid() value
- ✅ Existing courses count

**Expected Results:**
```sql
-- Should see bypass policies:
"Allow insert for admin bypass" - FOR INSERT
"Allow insert for assignments bypass" - FOR INSERT
"Allow insert for questionnaires bypass" - FOR INSERT
"Allow insert for chapters bypass" - FOR INSERT
```

---

### **Step 2: Test Browser Console**

1. **Open Browser Console:** (F12 atau Cmd+Option+I)
2. **Go to:** `http://localhost:5173/admin/courses/new`
3. **Fill form** dengan data test minimal:
   - Title: "Test Course"
   - Description: "Test"
   - Content: "Test content"
4. **Submit**
5. **Check Console** untuk logs:
   ```
   🚀 Attempting to create course with data: {...}
   📊 Supabase Response: {...}
   ```

**What to look for:**
- ❌ Error message → Copy error untuk debug
- ✅ Success + data returned → Data masuk!
- ⚠️ No error but no data → RLS issue

---

### **Step 3: Verify .env Configuration**

Check file `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Make sure:**
- ✅ URL benar (match dengan Supabase project)
- ✅ Anon key benar (bukan service role key)
- ✅ No extra spaces atau quotes

**Restart dev server after changes:**
```bash
# Stop: Ctrl+C
npm run dev
```

---

### **Step 4: Manual INSERT Test**

Di Supabase SQL Editor, test INSERT manual:

```sql
-- Test 1: Direct INSERT (bypass all checks)
INSERT INTO courses (title, description, category, content_body, is_published)
VALUES (
  'Manual Test Course',
  'Testing direct insert',
  'fe',
  '<p>Test content</p>',
  false
);

-- Check if inserted
SELECT * FROM courses WHERE title = 'Manual Test Course';
```

**If this works:**
- ✅ Database OK
- ✅ RLS policies OK
- ❌ Problem di client code atau Supabase client config

**If this fails:**
- ❌ RLS policies still blocking
- Need to check policies again

---

### **Step 5: Check Supabase Client**

Verify file: `src/lib/supabase.ts`

```tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Test in console:**
```tsx
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

Should show values, not empty strings!

---

## 🔧 **COMMON ISSUES & FIXES:**

### **Issue 1: SQL Not Applied**

**Symptom:** Bypass policies tidak exist di database

**Fix:**
```sql
-- Re-run fix-admin-rls-policies.sql
-- Make sure to run ALL lines
```

**Verify:**
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'courses' 
AND policyname LIKE '%bypass%';
```

Should return: `"Allow insert for admin bypass"`

---

### **Issue 2: Browser Cache**

**Symptom:** Old code running

**Fix:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear cache
3. Restart dev server

---

### **Issue 3: RLS Still Blocking**

**Symptom:** Error "violates row-level security policy"

**Nuclear Option:**
```sql
-- TEMPORARY: Disable RLS completely for testing
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Test insert
-- ...

-- Re-enable after testing
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
```

**WARNING:** Ini only untuk debug! Jangan leave disabled di production!

---

### **Issue 4: Wrong Supabase Project**

**Symptom:** Data masuk tapi ke wrong project

**Check:**
1. Buka Supabase Dashboard
2. Verify project name di URL
3. Make sure .env matches this project
4. Check table in correct project

---

## 📊 **DEBUGGING CHECKLIST:**

### Environment
- [ ] `.env` file exists
- [ ] VITE_SUPABASE_URL is correct
- [ ] VITE_SUPABASE_ANON_KEY is correct
- [ ] Dev server restarted after .env changes

### Database
- [ ] RLS policies exist (check with debug SQL)
- [ ] Bypass policies created
- [ ] Manual INSERT works
- [ ] Table structure correct

### Code
- [ ] Browser console open
- [ ] Logs appear when submitting form
- [ ] No JavaScript errors in console
- [ ] Supabase client initialized correctly

### Form
- [ ] All required fields filled
- [ ] No form validation errors
- [ ] Submit button clickable
- [ ] Loading state appears

---

## 🚀 **QUICK TEST:**

**Minimal test untuk verify everything works:**

1. **Browser Console open** (F12)
2. **Fill form:**
   - Title: "Test"
   - Description: "Test"  
   - Content: "Test"
3. **Submit**
4. **Look for:**
   ```
   🚀 Attempting to create course with data: {title: "Test", ...}
   📊 Supabase Response: {data: [{...}], error: null}
   ✅ Course created successfully: {...}
   ```
5. **Check database:**
   ```sql
   SELECT * FROM courses ORDER BY created_at DESC LIMIT 1;
   ```

**If you see the course:** ✅ **WORKING!**

**If not:** Copy error dari console dan check steps above!

---

## 📞 **NEXT STEPS:**

1. **Run `debug-database.sql`** → Check policies
2. **Open browser console** → Try create course
3. **Copy any errors** → Send error untuk further debug
4. **Test manual INSERT** → Verify database access

**Updated CreateCourse.tsx dengan console logs - try creating course sekarang!** 🎯
