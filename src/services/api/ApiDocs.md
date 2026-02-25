# Kaze Developer API Service Layer 🚀

Dokumentasi ini menjelaskan secara detail tentang lapisan layanan API (API Service Layer) yang digunakan dalam platform Kaze Developer. Lapisan ini diabstraksikan dari Supabase untuk memberikan antarmuka yang bersih, terpusat, dan mudah dikelola untuk semua operasi data.

## 📌 Daftar Isi
1. [Struktur & Penggunaan](#1-struktur--penggunaan)
2. [Modul API](#2-modul-api)
   - [Auth](#auth-api)
   - [Profiles](#profiles-api)
   - [Courses](#courses-api)
   - [Chapters](#chapters-api)
   - [Assignments](#assignments-api)
   - [Payments](#payments-api)
   - [Questionnaires](#questionnaires-api)
   - [Storage](#storage-api)
   - [Promos](#promos-api)
   - [Support](#support-api)
3. [Penanganan Error](#3-penanganan-error)
4. [Panduan Pengembangan](#4-panduan-pengembangan)

---

## 1. Struktur & Penggunaan

Seluruh logika API berada di folder `src/services/api/`. Antarmuka utama diekspor melalui satu objek `api` dari `index.ts`.

### Impor Tunggal
Untuk menggunakan API di komponen apa pun, cukup impor objek `api`:

```tsx
import { api } from '../../services/api';

// Contoh penggunaan:
const data = await api.courses.getAll();
```

---

## 2. Modul API

### Auth API (`auth.ts`)
Mengangani autentikasi admin dan member.

| Method | Deskripsi | Argumen |
| :--- | :--- | :--- |
| `adminLogin` | Login admin menggunakan password statis (ENV). | `password: string` |
| `signUp` | Pendaftaran member baru & pembuatan profil otomatis. | `email, password, fullName` |
| `signIn` | Login member menggunakan Supabase Auth. | `email, password` |
| `signOut` | Logout dari sesi aktif. | - |
| `resetPassword` | Mengirim email instruksi reset password. | `email: string` |
| `updatePassword` | Memperbarui password user yang sedang login. | `newPassword: string` |

### Profiles API (`profiles.ts`)
Mengelola data pengguna, learning path, dan status premium.

| Method | Deskripsi | Argumen |
| :--- | :--- | :--- |
| `getById` | Mengambil data profil berdasarkan ID. | `id: string` |
| `update` | Memperbarui kolom data profil. | `id: string, updates: Partial<Profile>` |
| `updateLearningPath` | Mengubah jalur belajar user (fe, be, fs, seo). | `userId, path` |
| `cancelPremium` | Mencabut status premium user. | `id: string` |
| `getAllMembers` | Menampilkan semua user dengan role 'member'. | - |
| `getAll` | Menampilkan semua profil (untuk Admin). | - |
| `promoteToPremium` | Memberikan akses premium selama 30 hari. | `userId, type` |
| `getActiveStudentCount` | Hitung total siswa aktif (Landing Page). | - |

### Courses API (`courses.ts`)
Manajemen modul pembelajaran (Kursus).

| Method | Deskripsi | Argumen |
| :--- | :--- | :--- |
| `getAll` | Ambil semua kursus dengan filter category/published. | `options?: { category, includeUnpublished }` |
| `getById` | Ambil detail satu kursus. | `id: string` |
| `create` | Membuat kursus baru (Admin). | `courseData: Partial<Course>` |
| `update` | Mengedit kursus yang ada (Admin). | `id, updates` |
| `delete` | Menghapus kursus. | `id: string` |

### Chapters API (`chapters.ts`)
Manajemen bab/materi di dalam setiap kursus.

| Method | Deskripsi | Argumen |
| :--- | :--- | :--- |
| `getByCourse` | Ambil semua bab milik satu kursus. | `courseId: string` |
| `create` | Menambah bab baru. | `chapter: Partial<CourseChapter>` |
| `update` | Mengedit bab. | `id, updates` |
| `delete` | Menghapus bab. | `id: string` |
| `upsert` | Update jika ada ID, insert jika tidak ada. | `chapter: Partial<CourseChapter>` |

### Assignments API (`assignments.ts`)
Manajemen penugasan dan pengumpulan tugas siswa.

| Method | Deskripsi | Argumen |
| :--- | :--- | :--- |
| `getByStudent` | Ambil semua tugas milik siswa tertentu. | `studentId: string` |
| `getAll` | Ambil semua tugas dari semua siswa (Admin). | - |
| `create` | Memberikan tugas ke siswa. | `assignment: Partial<Assignment>` |
| `submit` | Siswa mengumpulkan link tugas. | `assignmentId, link` |
| `update` | Update data tugas (misal: memberikan nilai). | `id, updates` |

### Payments API (`payments.ts`)
Manajemen transaksi pembayaran premium manual.

| Method | Deskripsi | Argumen |
| :--- | :--- | :--- |
| `submitProof` | User mengunggah bukti bayar. | `paymentData: Partial<PremiumPayment>` |
| `getAll` | Ambil semua data pembayaran (Admin). | - |
| `updateStatus` | Approve/Reject pembayaran (Admin). | `id, status, notes` |

### Questionnaires API (`questionnaires.ts`)
Sistem kuis, survei, dan evaluasi.

| Method | Deskripsi | Argumen |
| :--- | :--- | :--- |
| `getPublished` | Ambil kuis yang sudah dipublikasikan. | - |
| `getUserResponses` | Ambil semua riwayat jawaban user. | `userId: string` |
| `getLatestUserResponse` | Ambil percobaan kuis terakhir user. | `questionnaireId, userId` |
| `upsertResponse` | Simpan progress atau kirim jawaban akhir kuis. | `response: Partial<QuestionnaireResponse>` |
| `getResponses` | Ambil semua jawaban masuk untuk kuis tertentu (Admin). | `questionnaireId: string` |

### Storage API (`storage.ts`)
Manajemen file upload (Bukti bayar & aset kursus).

| Method | Deskripsi | Argumen |
| :--- | :--- | :--- |
| `uploadPaymentProof` | Upload bukti transfer ke bucket `payment-proofs`. | `userId, file: File` |
| `uploadMaterial` | Upload aset materi/gambar ke bucket `course-materials`.| `courseId, file: File` |

---

## 3. Penanganan Error

Semua metode dalam API Layer dirancang untuk:
1. Melempar (`throw`) error asli dari Supabase jika terjadi kegagalan query.
2. Memungkinkan penanganan error di level komponen menggunakan blok `try...catch`.

Contoh pola yang disarankan:
```tsx
try {
    const result = await api.auth.signIn(email, pass);
    // Success logic
} catch (error: any) {
    alert("Gagal login: " + error.message);
}
```

---

## 4. Panduan Pengembangan

Jika Anda ingin menambah fitur baru:
1. **Buat file baru** di `src/services/api/[nama-fitur].ts`.
2. **Definisikan fungsi** yang jelas dengan JSDoc untuk membantu autocompletion.
3. **Daftarkan modul** tersebut di `src/services/api/index.ts`.
4. **Gunakan tipe data** dari `src/lib/supabase.ts` untuk menjamin type-safety.

---

**Dibuat dengan ❤️ untuk Ekosistem Kaze Developer**
