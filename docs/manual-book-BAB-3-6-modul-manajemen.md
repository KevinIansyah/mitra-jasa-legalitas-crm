# BAB 3 – DASHBOARD ADMIN (lanjutan)

## 3.6 MODUL MANAJEMEN (STAFF & TASK)

Modul ini digunakan untuk mengelola akun dan profil **staff** internal (bukan role *user* pelanggan), serta memantau **tugas** dan **project** milik pengguna yang sedang login. Penambahan dan pengeditan staff dilakukan melalui *drawer* pada halaman daftar; tidak ada halaman terpisah untuk `/staff/create` atau `/staff/{id}/edit` (kedua URL tersebut mengarahkan kembali ke daftar staff). Semua fitur mengikuti hak akses (permission).

**Base URL:** setiap path di bawah ini merupakan bagian dari `https://dashboard.mitrajasalegalitas.co.id`.

---

### 3.6.0 NAVIGASI & URL

Lokasi menu: **Sidebar → Manajemen → Staff & Task**.

| MENU | DESKRIPSI | URL |
|------|-----------|-----|
| Daftar Staff | Menampilkan dan mengelola data anggota tim internal | `/staff` |
| My Tasks | Daftar tugas yang ditugaskan kepada **pengguna yang sedang login** | `/staff/{id}/my-tasks` |
| My Projects | Project yang diikuti staff **pengguna yang sedang login** | `/staff/{id}/my-projects` |

**Penting:** pada `{id}` untuk **My Tasks** dan **My Projects**, sistem hanya mengizinkan akses jika `{id}` sama dengan ID pengguna yang sedang login. Mengganti `{id}` dengan staff lain mengembalikan **403** (akses ditolak). Di sidebar, nilai `{id}` otomatis memakai ID Anda.

**Catatan:** rute `/staff/create` dan `/staff/{id}/edit` ada di server tetapi **mengalihkan** ke halaman daftar staff; operasi tambah/ubah dilakukan lewat *drawer* di `/staff`.

---

### 3.6.1 DAFTAR STAFF (`/staff`)

Halaman **Manajemen Staff** — deskripsi: pengelolaan data dan informasi staff secara terpusat. Akses: **Staff & Task → Daftar Staff** atau `https://dashboard.mitrajasalegalitas.co.id/staff`.

**Informasi pada halaman**

1. **Header** — Judul *Manajemen Staff* dan deskripsi singkat.

2. **Kartu ringkasan (KPI)**  
   - **Total Staff** — seluruh staff terdaftar (peran selain *user*).  
   - **Available** — status ketersediaan *Available*; footer menyebut berapa staff yang sedang tidak tersedia.  
   - **Busy** — staff berstatus *Busy* (sedang menangani project).  
   - **On Leave** — staff berstatus *On Leave* (cuti).

3. **Tabel** — Kolom: **Staff** (avatar, nama, email), **Role** (badge), **Status** (badge *Status Ketersediaan*: Available / Busy / On Leave, dan badge **Status Akun** sesuai pengaturan akun), **Maks. Project** (format `jumlah aktif / maksimum` untuk kapasitas bersamaan), **Keahlian** (hingga tiga badge + penanda sisa jika lebih dari tiga), **Token AI** (terpakai, batas harian, sisa), **Aksi** (edit, hapus sesuai izin).

#### 3.6.1.1 MELIHAT & MENCARI STAFF

1. Buka **Staff & Task → Daftar Staff**.  
2. Gunakan kolom pencarian: **Cari nama atau email staff…**  
3. Klik **Filter** untuk membuka panel: **Status Akun** (aktif/nonaktif/suspend sesuai daftar di sistem), **Status Ketersediaan** (*Available*, *Busy*, *On Leave*).  
4. Badge pada tombol Filter menunjukkan jumlah filter aktif; gunakan **Reset Filter** di panel atau **Reset semua** pada chip di bawah.  
5. Gunakan menu **Kolom** untuk menampilkan atau menyembunyikan kolom.  
6. Atur **Baris per halaman** (20, 30, 40, atau 50) dan gunakan kontrol **pagination** (halaman pertama/sebelumnya/selanjutnya/terakhir).

#### 3.6.1.2 MENAMBAH STAFF

1. Pastikan memiliki izin membuat staff.  
2. Klik tombol **Tambah** — *drawer* **Tambah Staff Baru** terbuka dari bawah layar.  
3. Isi bagian **Informasi Akun:** **Nama**, **Role** (daftar role selain *user*), **Email**, **Phone**, **Password** dan **Konfirmasi Password**.  
4. Isi bagian **Profil Staff:** **Status Ketersediaan**, **Maks. Project Bersamaan** (angka, batas umum 1–20), **Keahlian** (pisahkan dengan koma), **Jabatan**, **Deskripsi** (wajib), **Tanggal Mulai / Selesai Cuti** (opsional), **Catatan** (opsional).  
5. Isi **Pengaturan AI — Token Harian** jika kebijakan perusahaan memakai batas pemakaian token.  
6. Kirim formulir; setelah sukses, daftar diperbarui dan *drawer* tertutup.

#### 3.6.1.3 MENGUBAH STAFF

1. Pada baris staff, klik ikon **Edit** (*Edit Staff*) jika memiliki izin edit.  
2. *Drawer* **Edit Staff** terbuka dengan data terisi.  
3. Ubah **Status Akun**, **Nama**, **Role**, **Email**, **Phone**, **Password** (opsional; kosongkan jika tidak diganti), serta field profil yang sama seperti tambah staff.  
4. Simpan; pesan sukses menegaskan data staff diperbarui.

#### 3.6.1.4 MENGHAPUS STAFF

1. Klik ikon hapus pada kolom Aksi (izin hapus staff).  
2. Baca peringatan: data staff beserta akun login akan dihapus permanen.  
3. Konfirmasi penghapusan.

---

### 3.6.2 MY TASKS (`/staff/{id}/my-tasks`)

Halaman **My Tasks** — menampilkan tugas project yang **ditugaskan kepada Anda**. Deskripsi header memuat nama staff terkait. URL contoh: `https://dashboard.mitrajasalegalitas.co.id/staff/123/my-tasks` (ganti `123` dengan ID pengguna Anda; harus sama dengan akun login).

**Informasi pada halaman**

1. **Kartu ringkasan:** **Total**, **Selesai**, **Sedang Berjalan**, **Terlambat** (tugas melewati tenggat dan belum selesai/dibatalkan).

2. **Daftar tugas** dikelompokkan menurut **status** (*To Do*, *In Progress*, *Review*, *Completed*, *Cancelled*). Grup tanpa tugas disembunyikan.

3. **Setiap kartu tugas** dapat menampilkan: judul, **prioritas** (*Low*, *Medium*, *High*, *Urgent*), nama **milestone** (jika ada), **tenggat** (dengan penanda terlambat), **assignee**, deskripsi, dan tautan **Lihat Detail Project: [nama project]** menuju tab **Tugas** project terkait.

#### 3.6.2.1 MENGUBAH STATUS TUGAS DARI MY TASKS

1. Pada kartu tugas yang belum selesai/dibatalkan, klik badge status untuk membuka menu.  
2. Pilih status baru (*To Do*, *In Progress*, *Review*, *Completed*, *Cancelled*).  
3. Tunggu konfirmasi sukses; daftar diperbarui.

*Tugas yang sudah **Completed** atau **Cancelled** tidak dapat diubah statusnya dari menu ini.*

#### 3.6.2.2 KETIKA BELUM ADA TUGAS

Pesan **Belum ada tugas yang ditugaskan** ditampilkan pada area kosong.

---

### 3.6.3 MY PROJECTS (`/staff/{id}/my-projects`)

Halaman **My Projects** — daftar project di mana Anda terdaftar sebagai anggota tim. Deskripsi header memuat nama staff. URL mengikuti pola `/staff/{id}/my-projects` dengan `{id}` **harus** ID pengguna yang sedang login.

**Informasi pada halaman**

1. Ringkasan jumlah total project dan indikator halaman jika ada lebih dari satu halaman (12 project per halaman).

2. **Kartu project** (grid): nama project, nama pelanggan, **badge status** project, layanan, tanggal mulai dan rencana selesai, serta **bilah progress** persentase.

3. Klik kartu untuk membuka **detail project** (tab Ringkasan).

#### 3.6.3.1 PAGINATION

Jika ada banyak project, gunakan tombol **Sebelumnya** / **Selanjutnya** di bawah daftar untuk berpindah halaman.

#### 3.6.3.2 KETIKA BELUM ADA PROJECT

Pesan **Belum ada project yang ditugaskan** ditampilkan pada area kosong.

---

### 3.6.4 HAK AKSES (RINGKAS)

| Aktivitas | Permission (nama teknis) |
|-----------|---------------------------|
| Melihat daftar staff | `view-staff` |
| Menambah staff | `create-staff` |
| Mengubah staff | `edit-staff` |
| Menghapus staff | `delete-staff` |
| Membuka My Tasks | `view-staff-my-task` |
| Membuka My Projects | `view-staff-my-project` |

---

*Dokumen ini diselaraskan dengan `app/Http/Controllers/StaffController.php`, `routes/staff.php`, dan halaman di `resources/js/pages/staff/`.*
