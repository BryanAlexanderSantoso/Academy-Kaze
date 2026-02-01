# 🚀 DEPLOY TO VERCEL GUIDE

Ikuti langkah-langkah berikut untuk mendeploy **Kaze For Developers** ke Vercel agar bisa diakses secara online.

---

## 1️⃣ **Persiapan Git (GitHub/GitLab/Bitbucket)**

Vercel bekerja paling baik jika project Anda ada di GitHub. Jika belum, lakukan ini di terminal:

```bash
# Inisialisasi git jika belum
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "🚀 Initial commit: Ready for deployment"
```

Lalu buat repository baru di GitHub dan ikuti instruksi untuk **"push an existing repository"**.

---

## 2️⃣ **Connect ke Vercel**

1.  Buka [vercel.com](https://vercel.com) dan login.
2.  Klik tombol **"Add New..."** → **"Project"**.
3.  Impor repository GitHub Anda yang tadi.

---

## 3️⃣ **Konfigurasi Project di Vercel**

Vercel akan secara otomatis mendeteksi bahwa ini adalah project **Vite**.

### **⚙️ Build & Output Settings:**
Biarkan default (Vercel sudah tahu cara handle Vite).

### **🔐 Environment Variables:**
Ini bagian **PALING PENTING**. Anda harus memasukkan variable dari file `.env` Anda ke dashboard Vercel:

Lari ke **Project Settings** → **Environment Variables** lalu tambahkan:

| Key | Value (Ambil dari file .env Anda) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `VITE_ADMIN_PASSWORD` | `password_admin_anda` |

---

## 4️⃣ **Deployment Details**

*   **Framework Preset:** Vite
*   **Root Directory:** `./`
*   **Build Command:** `npm run build`
*   **Output Directory:** `dist`

Klik **"Deploy"**! 🚀

---

## 🛠️ **Troubleshooting (Masalah Umum)**

### **1. Routing Error (404 saat refresh)**
Jika Anda refresh halaman selain homepage lalu muncul error 404, jangan khawatir. Saya sudah menambahkan file **`vercel.json`** di root folder untuk menangani routing Single Page Application (SPA).

### **2. Build Error (TypeScript)**
Jika build gagal karena error TypeScript, Anda bisa mencoba mengubah build command di Vercel menjadi:
`vite build` (melewati pengecekan `tsc` jika mendesak).

### **3. Supabase Error**
Pastikan URL dan Anon Key yang Anda masukkan di Environment Variables Vercel **sama persis** dengan yang ada di `.env` lokal.

---

## ✅ **Selesai!**
Setelah statusnya **"Congratulations!"**, Anda akan mendapatkan URL (contoh: `kaze-developer.vercel.app`).

Selamat! Project Anda sudah online! 🎉
