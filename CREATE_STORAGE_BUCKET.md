# 📦 CREATE STORAGE BUCKET - course-materials

## 🎯 **ERROR:**
```
Error uploading file. Make sure storage bucket "course-materials" exists.
```

## ✅ **SOLUTION: Create Storage Bucket**

### **Method 1: Via Supabase Dashboard (RECOMMENDED)**

**Steps:**

1. **Buka Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Pilih project Anda

2. **Navigate to Storage**
   - Sidebar kiri → Click **"Storage"**

3. **Create New Bucket**
   - Click tombol **"New bucket"** atau **"Create bucket"**

4. **Bucket Settings:**
   ```
   Name: course-materials
   Public bucket: ✅ YES (ENABLE THIS!)
   File size limit: 50MB (default OK)
   Allowed MIME types: Leave empty (allow all)
   ```

5. **Click "Create bucket"**

6. **DONE!** ✅ Bucket created

---

### **Method 2: Via SQL (Alternative)**

Jika prefer via SQL, run ini di Supabase SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,  -- Public bucket
  52428800,  -- 50MB limit
  NULL  -- Allow all file types
)
ON CONFLICT (id) DO NOTHING;

-- Set RLS policies for bucket (allow public access)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-materials');

CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "Authenticated Update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'course-materials');

CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'course-materials');
```

---

## 🔍 **VERIFY BUCKET EXISTS:**

### **Via Dashboard:**
1. Go to Storage
2. You should see `course-materials` bucket in list
3. Click on it → Should open bucket view

### **Via SQL:**
```sql
SELECT * FROM storage.buckets WHERE name = 'course-materials';
```

Should return 1 row with bucket details.

---

## 🎯 **AFTER CREATING BUCKET:**

### **Test Upload:**

1. **Go to:** `/admin/courses/{course-id}/chapters`
2. **Add New Chapter:**
   - Title: "Test Chapter"
   - Material Type: **Upload File**
   - Select any file (PDF, image, etc)
3. **Submit**

**Expected:**
- ✅ Upload progress appears
- ✅ "✓ filename.pdf" success message
- ✅ Chapter created with file attached
- ✅ No error!

---

## 📊 **BUCKET CONFIGURATION:**

### **Recommended Settings:**

```yaml
Bucket Name: course-materials
Public: YES ✅
  → Files accessible via public URL
  → Students bisa download/view files

File Size Limit: 50MB
  → Suitable for PDFs, videos, images
  → Increase if needed for larger files

Allowed MIME types: (empty)
  → Allow all file types
  → Or restrict to: 
    - application/pdf
    - image/*
    - video/mp4
```

### **RLS Policies:**

```sql
-- Anyone can view/download files
FOR SELECT: Public access ✅

-- Authenticated users can upload
FOR INSERT: Authenticated ✅

-- Owner/admin can update/delete
FOR UPDATE/DELETE: Authenticated ✅
```

---

## 🔐 **SECURITY NOTES:**

### **Public Bucket = Safe?**

✅ **YES, if:**
- Files are course materials (PDFs, videos)
- Content is meant for students
- No sensitive data in files

❌ **NO, if:**
- Private student data
- Internal documents
- Sensitive information

**For course materials:** Public bucket is **RECOMMENDED** agar students bisa access tanpa auth.

### **File Size Limits:**

Default 50MB works for:
- ✅ PDF documents (up to 20MB)
- ✅ Images (up to 10MB)
- ✅ Short videos (up to 50MB)

For longer videos:
- Consider external hosting (YouTube, Vimeo)
- Use "External Link" material type instead
- Or increase bucket limit to 100MB+

---

## 🚀 **QUICK START:**

### **Fastest Method:**

1. **Supabase Dashboard** → **Storage** → **New bucket**
2. Name: `course-materials`
3. ✅ Check "Public bucket"
4. **Create**
5. **Done!** Try upload again

**Takes 30 seconds!** ⚡

---

## 🐛 **TROUBLESHOOTING:**

### **Error: "Bucket already exists"**

Good! Bucket sudah ada. Check:
```sql
SELECT * FROM storage.buckets WHERE name = 'course-materials';
```

If exists, tapi masih error → Check RLS policies:
```sql
-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### **Error: "Permission denied"**

Add bypass policies untuk storage:
```sql
-- Allow all operations on storage.objects
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write access" ON storage.objects
  FOR INSERT WITH CHECK (true);
```

### **Error: "File too large"**

Increase bucket size limit:
1. Dashboard → Storage → course-materials
2. Settings → File size limit
3. Change to 100MB atau lebih
4. Save

---

## 📁 **FILE STRUCTURE:**

After upload, files stored as:

```
storage/
  course-materials/
    {course-id}/
      {random-uuid}.pdf
      {random-uuid}.mp4
      {random-uuid}.jpg
```

**Public URL format:**
```
https://{project}.supabase.co/storage/v1/object/public/course-materials/{course-id}/{file-name}
```

**Students access via this URL!** ✅

---

## ✅ **FINAL CHECKLIST:**

- [ ] Create bucket `course-materials`
- [ ] Enable "Public bucket"
- [ ] Set file size limit (50MB+)
- [ ] Test upload file
- [ ] Verify file accessible
- [ ] Check public URL works

---

## 🎉 **READY!**

**After creating bucket:**
- ✅ Upload files works
- ✅ Students bisa download
- ✅ Public URLs generated
- ✅ Full chapter system functional

---

**CREATE BUCKET SEKARANG di Supabase Dashboard!** 🚀

**Location:** Dashboard → Storage → New bucket → `course-materials` → Public ✅
