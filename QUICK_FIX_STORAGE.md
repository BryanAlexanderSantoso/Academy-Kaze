# ⚡ QUICK FIX: Create Storage Bucket

## 🎯 **ERROR:**
```
Error uploading file. Make sure storage bucket "course-materials" exists.
```

---

## ✅ **5-STEP FIX (30 detik!):**

### **1. Buka Supabase Dashboard**
```
https://supabase.com/dashboard
→ Pilih project Anda
```

### **2. Click "Storage" di Sidebar**
```
Sidebar kiri → Storage
```

### **3. Click "New bucket"**
```
Tombol di kanan atas atau tengah
```

### **4. Isi Form:**
```
Name: course-materials
✅ Public bucket: ENABLE (penting!)
File size limit: 50 MB (default OK)
```

### **5. Click "Create bucket"**
```
Done! ✅
```

---

## 🔄 **ALTERNATIVE: Via SQL**

Jika prefer SQL, run ini di Supabase SQL Editor:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'course-materials');

CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'course-materials');
```

---

## ✅ **VERIFY:**

**Check bucket exists:**
```sql
SELECT * FROM storage.buckets WHERE name = 'course-materials';
```

Should return: 1 row

---

## 🎯 **SETELAH CREATE BUCKET:**

1. **Refresh halaman chapter management**
2. **Try upload file lagi**
3. **Should work!** ✅

---

## 📊 **SETTINGS:**

**Bucket Name:** `course-materials` (exactly!)
**Public:** ✅ YES (enable this!)
**Why public?** → Students bisa download files

---

## 🚨 **JIKA MASIH ERROR:**

### **Check 1: Bucket name match**
```javascript
// Di ManageChapters.tsx, line 80:
.from('course-materials')  // ← Must match bucket name
```

### **Check 2: RLS Policies**
Add bypass for storage:
```sql
CREATE POLICY "Allow all storage ops" ON storage.objects
FOR ALL USING (true);
```

---

## 🎉 **DONE!**

**Setelah create bucket:**
- ✅ Upload file works
- ✅ Files stored di Supabase Storage
- ✅ Public URLs generated automatically
- ✅ Students bisa download

---

**CREATE BUCKET SEKARANG!** 🚀

**Dashboard → Storage → New bucket → `course-materials` → ✅ Public → Create**

**Takes 30 seconds!** ⚡
