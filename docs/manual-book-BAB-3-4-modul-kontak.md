# BAB 3 – DASHBOARD ADMIN (lanjutan)

## 3.4 MODUL KONTAK

Modul Kontak digunakan untuk mengelola **pelanggan (PIC)**, **perusahaan**, dan **pesan masuk** dari formulir kontak website. Penambahan dan pengeditan banyak dilakukan lewat *drawer* pada halaman daftar; halaman **detail** tersedia untuk pelanggan dan perusahaan. Semua fitur mengikuti hak akses (permission).

**Base URL:** setiap path di bawah ini merupakan bagian dari `https://dashboard.mitrajasalegalitas.co.id`.

---

### 3.4.0 NAVIGASI & URL

Lokasi menu: **Sidebar → CRM & Proyek → Kontak**.

| MENU | DESKRIPSI | URL |
|------|-----------|-----|
| Pelanggan (PIC) | Data kontak utama klien | `/contacts/customers` |
| Perusahaan | Badan usaha klien | `/contacts/companies` |
| Pesan Masuk | Pesan dari formulir website | `/contacts/messages` |

**URL tambahan**

| Halaman | URL |
|---------|-----|
| Detail pelanggan | `/contacts/customers/{id}` |
| Detail perusahaan | `/contacts/companies/{id}` |

*Ganti `{id}` dengan ID numerik. Operasi **tambah** / **ubah** pelanggan dan perusahaan pada umumnya melalui *drawer* di halaman daftar (bukan `/create` / `/edit` terpisah kecuali di masa depan ditambahkan).*

---

### 3.4.1 PELANGGAN (PIC) (`/contacts/customers`)

**Judul halaman:** *Manajemen Pelanggan* — deskripsi: **Kelola data dan informasi pelanggan secara terpusat**.

**Kartu ringkasan**

- **Total Pelanggan** — seluruh data pelanggan.  
- **Aktif** — pelanggan berstatus aktif; footer menyebut jumlah tidak aktif.  
- **Memiliki Akun** — terhubung ke akun login; footer menyebut yang belum terdaftar.  
- **Terhubung Perusahaan** — pelanggan yang punya relasi ke perusahaan; footer menyebut yang belum terhubung.

#### 3.4.1.1 MELIHAT & MENCARI

1. Buka **Kontak → Pelanggan (PIC)**.  
2. Pencarian: **Cari nama, email, atau nomor telepon pelanggan…**  
3. **Filter** (sheet): **tier**, **status**, **kepemilikan akun** (terdaftar / belum); badge jumlah filter aktif pada tombol Filter.  
4. **Reset Filter** di sheet atau **Reset semua** pada chip.  
5. Menu **Kolom** untuk menampilkan/menyembunyikan kolom.  
6. **Baris per halaman** 20–50 dan **pagination**.

#### 3.4.1.2 MENAMBAH PELANGGAN

1. Klik **Tambah** (izin buat pelanggan).  
2. Pada *drawer*, isi field wajib (nama, telepon/WhatsApp, email, tier, dll.) dan opsional (catatan).  
3. Simpan; daftar diperbarui.

#### 3.4.1.3 AKSI PADA BARIS

Sesuai izin dan tampilan kolom **Aksi**:

- **Buatkan / Kelola Akun** — alur portal: periksa email, buat akun baru, atau hubungkan akun existing; salin kredensial jika dibuat otomatis.  
- **Lihat Detail** — buka `/contacts/customers/{id}`.  
- **Edit** — ubah data lewat *drawer*.  
- **Hapus** — konfirmasi dialog.

#### 3.4.1.4 DETAIL PELANGGAN (`/contacts/customers/{id}`)

Halaman detail menampilkan profil, daftar perusahaan terkait, **riwayat project** (paginasi), serta ringkasan lain yang disediakan controller. Gunakan breadcrumb atau tombol kembali untuk kembali ke daftar.

---

### 3.4.2 PERUSAHAAN (`/contacts/companies`)

**Judul halaman:** *Manajemen Perusahaan* — deskripsi: **Kelola data dan informasi perusahaan secara terpusat**.

**Kartu ringkasan**

- **Total Perusahaan**  
- **Memiliki PIC** — perusahaan yang sudah punya pelanggan terhubung; footer menyebut yang belum punya PIC.  
- **Memiliki NPWP**  
- **Berbadan Hukum** — memiliki status legalitas (PT, CV, Firma, dll.)

#### 3.4.2.1 MELIHAT & MENCARI

1. Buka **Kontak → Perusahaan**.  
2. Gunakan pencarian, **Filter** (misalnya **status legalitas** dan **kategori bisnis**), menu **Kolom**, serta pagination dan ukuran halaman.  
3. Klik ikon expand pada baris untuk membuka **detail singkat** di bawah baris (jika tersedia).

#### 3.4.2.2 MENAMBAH PERUSAHAAN

1. Klik **Tambah** — isi *drawer* / form: nama (wajib), kontak, alamat (wajib), kota, provinsi, kode pos, NPWP, status legalitas, kategori bisnis, website, catatan, dll.  
2. Simpan.

#### 3.4.2.3 AKSI DATA

- **Lihat Detail Perusahaan** — `/contacts/companies/{id}`.  
- **Edit** — *drawer* pengeditan.  
- **Kelola PIC** — *drawer* dengan tab **Daftar** (ubah jabatan/kontak utama, hapus PIC) dan **Tambah** (cari pelanggan minimal dua karakter, jabatan, tandai kontak utama).  
- **Hapus** — dengan konfirmasi.

#### 3.4.2.4 DETAIL PERUSAHAAN

Menampilkan profil perusahaan, PIC terkait, dan informasi lain sesuai halaman detail; tautan ke detail pelanggan jika ada.

---

### 3.4.3 PESAN MASUK (`/contacts/messages`)

**Judul halaman:** *Pesan Masuk* — deskripsi: **Kelola pesan yang masuk dari halaman kontak website**.

**Kartu ringkasan**

- **Total Pesan**  
- **Belum Dibaca**  
- **Sudah Dibaca** — deskripsi: belum dihubungi  
- **Sudah Dihubungi** — selesai diproses

#### 3.4.3.1 MELIHAT & MENGELOLA

1. Buka **Kontak → Pesan Masuk**.  
2. Gunakan pencarian dan filter **status** (sesuai opsi di layar).  
3. Atur kolom, ukuran halaman, dan pagination.  
4. **Ubah status** pesan (baca/dihubungi/diarsipkan — sesuai aksi di tabel) jika diizinkan.  
5. **Hapus** pesan jika diizinkan.

---

### 3.4.4 RINGKASAN PERMISSION (TEKNIS)

| Area | Permission contoh |
|------|-------------------|
| Pelanggan | `view-contact-customers`, `create-contact-customers`, `edit-contact-customers`, `delete-contact-customers` |
| Perusahaan | `view-contact-companies`, `create-…`, `edit-…`, `delete-…` |
| Pesan Masuk | `view-contact-messages`, `edit-contact-messages`, `delete-contact-messages` |

---

*Diselaraskan dengan `routes/contacts.php`, `app/Http/Controllers/Contacts/`, dan `resources/js/pages/contacts/`.*
