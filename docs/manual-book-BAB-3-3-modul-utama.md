# BAB 3 – DASHBOARD ADMIN (lanjutan)

## 3.3 MODUL UTAMA

Modul **Utama** mencakup **Dashboard** (ringkasan kinerja dan aktivitas) dan **Manajemen Role** (peran pengguna beserta hak akses). Semua fitur mengikuti permission.

**Base URL:** setiap path di bawah ini merupakan bagian dari `https://dashboard.mitrajasalegalitas.co.id`.

---

### 3.3.0 NAVIGASI & URL

Lokasi menu: **Sidebar → Utama**.

| MENU | DESKRIPSI | URL |
|------|-----------|-----|
| Dashboard | Ringkasan aktivitas, statistik, dan grafik | `/` |
| Manajemen Role | Daftar role dan pengaturan hak akses | `/roles` |
| Hak Akses (per role) | Pengelompokan permission per fitur | `/roles/{id}/permissions/edit` |

**Catatan:** penambahan dan pengeditan role pada daftar dilakukan lewat *drawer* di halaman `/roles` (bukan halaman terpisah), kecuali halaman khusus **Hak Akses** di atas.

---

### 3.3.1 DASHBOARD (`/`)

Setelah login, Anda dapat membuka Dashboard melalui menu **Dashboard** pada sidebar atau URL root.

**Header**

- Sapaan dinamis: *Selamat pagi/siang/sore/malam* sesuai jam perangkat, diikuti nama depan pengguna.  
- Deskripsi: **Ringkasan kinerja, komunikasi, dan proyek**.

**Kartu KPI (tren dalam persen dibanding periode pembanding)**

1. **Pendapatan Bulan Ini** — pendapatan bulan berjalan dari pencatatan jurnal; footer memuat teks penjelasan dan **total kumulatif** pendapatan seumur (format ringkas).  
2. **Pesan Kontak (7 Hari)** — jumlah pesan formulir kontak dalam 7 hari terakhir; dibandingkan dengan 7 hari sebelumnya; footer menyertakan total pesan keseluruhan.  
3. **Sesi Chat (7 Hari)** — jumlah sesi chat AI dalam 7 hari terakhir; dibandingkan periode sebelumnya; footer menyertakan total sesi.  
4. **Perusahaan Terdaftar** — total perusahaan; tren memakai pendaftaran baru 30 hari vs periode sebelumnya.  
5. **Pengguna** — total akun pengguna; pembandingan pendaftaran bulan ini vs bulan lalu.  
6. **Proyek** — total project; pembandingan project baru bulan ini vs bulan lalu.  
7. **Artikel Terbit** — total artikel blog yang terpublikasi; pembandingan terbit bulan ini vs bulan lalu.

**Grafik dan visualisasi**

1. **Pendapatan & Pengeluaran per Bulan** — area chart **12 bulan terakhir**; garis hijau: pendapatan (jurnal), garis merah: pengeluaran/beban; sumbu vertikal dalam Rupiah (format ringkas). Arahkan kursor untuk melihat nilai lengkap per bulan.  
2. **Aktivitas 7 Hari Terakhir** — area chart harian: garis biru **pesan kontak** baru, garis ungu **sesi chat AI**; sumbu vertikal = jumlah per hari.  
3. **Status Sesi Chat** — diagram donat: pembagian sesi menurut status (**Aktif**, **Ditutup**, **Dikonversi** — label Indonesia dari backend); angka di tengah = total sesi. Jika belum ada data, tampil pesan **Belum ada data sesi chat**.

**Interaksi**

- Tooltip pada grafik menampilkan detail nilai atau tanggal.  
- Gunakan menu sidebar untuk menuju modul lain (CRM, keuangan, dll.).

---

### 3.3.2 MANAJEMEN ROLE (`/roles`)

**Judul halaman:** *Manajemen Role* — deskripsi: **Kelola daftar role dan hak akses pengguna**.

**Tabel**

- Kolom: **Nama**, **Aksi**.  
- **Cari nama…** — filter pencarian.  
- **Kolom** — tampilkan/sembunyikan kolom.  
- **Baris per halaman:** 20, 30, 40, atau 50; pagination lengkap (halaman pertama/terakhir, sebelumnya/selanjutnya).

#### 3.3.2.1 MENAMBAH ROLE

1. Klik **Tambah** pada bilah alat (izin `create-roles`).  
2. Isi nama role pada *drawer* (disarankan huruf kecil dan tanda hubung untuk beberapa kata).  
3. Simpan.

#### 3.3.2.2 MENGUBAH ROLE

1. Klik ikon pensil **Edit Role** pada baris (izin `edit-roles`).  
2. Ubah nama pada *drawer*.  
3. Simpan.  
4. **Pengecualian:** role **`super-admin`** dan **`user`** tidak dapat diubah atau dihapus dari tabel (tombol dinonaktifkan).

#### 3.3.2.3 MENGHAPUS ROLE

1. Klik hapus dengan konfirmasi (izin `delete-roles`).  
2. Role **super-admin** dan **user** tidak dapat dihapus.  
3. Jika role masih dipakai pengguna, sistem dapat menolak penghapusan (sesuasi pesan error backend).

#### 3.3.2.4 MENGATUR HAK AKSES (PERMISSION)

1. Klik ikon **Berikan Hak Akses** (perisai) pada baris role (izin `edit-permissions`).  
2. Anda diarahkan ke `/roles/{id}/permissions/edit`.  
3. **Judul halaman:** *Manajemen Hak Akses (nama_role)* — deskripsi: mengatur hak akses untuk role terpilih.  
4. Permission dikelompokkan per fitur (misalnya Manajemen Role, Manajemen Kontak, Proyek, Keuangan); per item biasanya ada sakelar untuk **Lihat**, **Tambah**, **Ubah**, **Hapus** (sesuai yang tersedia untuk resource tersebut).  
5. Klik **Simpan** untuk menerapkan.  
6. Klik **Reset** untuk mengembalikan pilihan ke kondisi awal halaman.  
7. Role **super-admin** dan **user**: ikon hak akses nonaktif (tidak dapat dibuka).

---

### 3.3.3 RINGKASAN PERMISSION (TEKNIS)

| Fitur | Permission umum |
|-------|-----------------|
| Melihat Dashboard | Tidak memakai permission khusus pada rute (pengguna terautentikasi). |
| Melihat daftar role | `view-roles` |
| Menambah role | `create-roles` |
| Mengubah nama role | `edit-roles` |
| Menghapus role | `delete-roles` |
| Mengatur hak akses | `edit-permissions` |

---

*Diselaraskan dengan `app/Http/Controllers/DashboardController.php`, `resources/js/pages/dashboard.tsx`, `routes/web.php` (grup roles), dan `resources/js/pages/roles/`.*
