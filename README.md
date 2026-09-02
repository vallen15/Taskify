# Taskify - Todo & Productivity Management App

Aplikasi Manajemen Tugas dan Produktivitas Harian modern yang dibangun menggunakan stack **Bun + Elysia.js** (Backend API), **React + TypeScript + Vite + Tailwind CSS** (Frontend UI), dan **PostgreSQL + Prisma ORM** (Database Layer).

---

## 🚀 Fitur Utama

- 📊 **Dashboard Productivity Analytics:** Ringkasan Total Tugas, Tugas Selesai, Tugas Tertunda, Persentase Penyelesaian (% Completion Rate), Peringatan Jatuh Tempo (*Overdue Warning*), dan Grafik Recharts Aktivitas Harian.
- 📝 **Manajemen Tugas & To-Do (CRUD):** Tambah, edit, dan hapus tugas lengkap dengan judul, deskripsi, prioritas (*Low, Medium, High, Urgent*), status (*Pending, In Progress, Completed*), tanggal jatuh tempo, dan tag kategori.
- 📂 **Manajemen Kategori / Proyek:** Pengelompokan tugas berdasarkan proyek/topik dengan warna badge custom.
- 🔍 **Filter & Pencarian Cepat:** Pencarian real-time dan filter berdasarkan status, tingkat prioritas, dan kategori.
- 🔐 **Autentikasi Pengguna:** Endpoint login & registrasi pengguna berbasis JWT token.
- 🧪 **Pengujian Otomatis (Testing Tasks):** 22 Unit & Integration Tests bawaan **Bun Test** (100% PASS).

---

## 🛠️ Tech Stack

- **Backend:** [Bun](https://bun.sh/) (v1.3+), [Elysia.js](https://elysiajs.com/) (v1.2+), Prisma ORM (v6+), JWT, CORS, Swagger API UI.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons, Recharts.
- **Database:** PostgreSQL (atau SQLite fallback untuk pengujian lokal instan).
- **Testing Framework:** Bun Test Runner.

---

## ⚙️ Langkah Setup & Instalasi

### 1. Setup Backend (Bun + Elysia + Prisma)

1. Masuk ke folder `backend`:
   ```bash
   cd "E:\semester 7\project magang\project 3\backend"
   ```

2. Install dependensi:
   ```bash
   bun install
   ```

3. Jalankan Migrasi & Seed Data Sample:
   ```bash
   bun db:push
   bun db:seed
   ```

4. Jalankan Backend Server:
   ```bash
   bun run dev
   ```
   Backend berjalan di: **`http://localhost:3001`**  
   Dokumentasi Swagger UI otomatis di: **`http://localhost:3001/swagger`**

---

### 2. Setup Frontend (React + TypeScript + Vite)

1. Buka terminal baru dan masuk ke folder `frontend`:
   ```bash
   cd "E:\semester 7\project magang\project 3\frontend"
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Jalankan Frontend Server:
   ```bash
   npm run dev
   ```
   Frontend berjalan di: **`http://localhost:3000`**

---

## 🧪 Panduan Pengujian (Testing Tasks)

Seluruh pengujian dilakukan menggunakan **Bun Test** runner.

Masuk ke folder `backend`:
```bash
cd "E:\semester 7\project magang\project 3\backend"
```

### 1. Menjalankan Seluruh Test Suite
```bash
bun test
```

### 2. Menjalankan Unit Testing
Menguji fungsi kalkulasi persentase penyelesaian, indikator tugas *overdue*, pembobotan prioritas, dan validasi input request.
```bash
bun test tests/unit
```

### 3. Menjalankan Integration Testing
Menguji alur komunikasi rute API Elysia.js, penanganan status HTTP (200, 400, 404, 409), serta integrasi Prisma ORM database.
```bash
bun test tests/integration
```

---

## 📄 Dokumentasi API Endpoints

### 1. Autentikasi (`/api/auth`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/register` | Mendaftarkan pengguna baru. |
| `POST` | `/api/auth/login` | Login & mendapatkan JWT Token. |
| `GET` | `/api/auth/me` | Memeriksa profil pengguna berdasarkan token. |

### 2. Kategori Tugas (`/api/categories`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/categories` | Mengambil daftar seluruh kategori tugas. |
| `POST` | `/api/categories` | Membuat kategori tugas baru. |
| `PUT` | `/api/categories/:id` | Memperbarui nama/warna kategori. |
| `DELETE` | `/api/categories/:id` | Menghapus kategori. |

### 3. Tugas / Todo (`/api/tasks`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/tasks` | Mengambil daftar tugas (dukungan pencarian `search`, filter `status`, `priority`, `categoryId`, & paginasi). |
| `GET` | `/api/tasks/:id` | Mengambil detail tugas tunggal. |
| `POST` | `/api/tasks` | Membuat tugas baru. |
| `PUT` | `/api/tasks/:id` | Memperbarui rincian tugas atau toggle status selesai. |
| `DELETE` | `/api/tasks/:id` | Menghapus tugas. |

### 4. Dashboard Analytics (`/api/dashboard`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Mengembalikan agregasi statistik produktivitas dan grafik mingguan. |
