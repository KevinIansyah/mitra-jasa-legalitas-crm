# BAB 3 – DASHBOARD ADMIN (lanjutan)

## 3.5 MODUL PROJECT

Modul Project digunakan untuk mengelola seluruh siklus pekerjaan layanan: daftar project, pembuatan project (terhubung ke data Pelanggan/PIC dan Perusahaan), halaman detail ber-tab (ringkasan, keuangan, tim, milestone, tugas, dokumen, hasil akhir, diskusi, aktivitas), serta arsip dokumen dan hasil akhir secara global dan template project. Setiap fitur mengikuti hak akses (permission) pengguna.

**Base URL:** seluruh path di bawah ini merupakan bagian dari `https://dashboard.mitrajasalegalitas.co.id`.

---

### 3.5.0 NAVIGASI & URL TAMBAHAN

Lokasi menu: **Sidebar → CRM & Proyek → Project** (submenu: Semua Project, Dokumen, Hasil Akhir, Template).

Tabel berikut melengkapi daftar path yang dipakai di modul ini (ganti `{id}` dengan ID numerik project; `{templateId}` dengan ID template).

| MENU / AREA | DESKRIPSI | URL |
|-------------|-----------|-----|
| Semua Project | Daftar dan ringkasan project | `/projects` |
| Buat Project | Form pembuatan project baru | `/projects/create` |
| Detail Project – Ringkasan | Informasi utama project | `/projects/{id}` |
| Detail Project – Ringkasan (alternatif) | Sama fungsinya dengan Ringkasan | `/projects/{id}/overview` |
| Detail Project – Keuangan | Ringkasan keuangan project, invoice & pengeluaran | `/projects/{id}/finance` |
| Detail Project – Tim | Anggota tim project | `/projects/{id}/team` |
| Detail Project – Milestone | Milestone project | `/projects/{id}/milestones` |
| Detail Project – Tugas | Tugas project | `/projects/{id}/tasks` |
| Detail Project – Dokumen | Dokumen project | `/projects/{id}/documents` |
| Detail Project – Hasil Akhir | Deliverable project | `/projects/{id}/deliverables` |
| Detail Project – Diskusi | Komentar / diskusi | `/projects/{id}/discussions` |
| Detail Project – Aktivitas | Log aktivitas | `/projects/{id}/activities` |
| Dokumen (global) | Arsip dokumen lintas project | `/projects/documents` |
| Hasil Akhir (global) | Arsip hasil akhir lintas project | `/projects/deliverables` |
| Template | Daftar template project | `/projects/templates` |
| Buat Template | Form template baru | `/projects/templates/create` |
| Ubah Template | Pengeditan template | `/projects/templates/{templateId}/edit` |

**Catatan tab Keuangan:** di aplikasi, tab **Keuangan** pada detail project hanya ditampilkan jika pengguna memiliki izin melihat invoice, pembayaran, **dan** pengeluaran keuangan sekaligus (`view-finance-invoices`, `view-finance-payments`, `view-finance-expenses`). Jika salah satu tidak ada, tab tersebut dapat disembunyikan.

---

### 3.5.1 SEMUA PROJECT

Halaman **Manajemen Project** menampilkan deskripsi: pengelolaan data dan informasi project secara terpusat. Akses: **Sidebar → CRM & Proyek → Project → Semua Project** atau `https://dashboard.mitrajasalegalitas.co.id/projects`.

**Informasi pada halaman**

1. **Header** — Judul *Manajemen Project* dan deskripsi singkat halaman.

2. **Kartu ringkasan (KPI)**  
   - **Total Project** — jumlah seluruh project terdaftar (semua status).  
   - **Berjalan** — project berstatus *In Progress*.  
   - **Selesai** — project berstatus *Completed*.  
   - **Ditunda / Dibatalkan** — jumlah project *On Hold* dan *Cancelled* (ditampilkan terpisah dalam teks footer kartu).

3. **Tabel data** — Kolom: **Project** (nama dan nama layanan), **Pelanggan** (nama PIC dan badge tier jika ada, serta nama perusahaan jika ada), **Status** (label status dan persentase progres), **Budget** (format Rupiah), **Project Leader**, **Aksi**.

#### 3.5.1.1 MELIHAT & MENCARI PROJECT

1. Buka menu **Project → Semua Project** pada sidebar.  
2. Gunakan kolom pencarian dengan placeholder **Cari nama project…**.  
3. Klik **Filter** untuk membuka panel filter: **Status** (Planning, In Progress, On Hold, Completed, Cancelled), **Pelanggan**, **Perusahaan**, **Layanan**. Badge pada tombol Filter menunjukkan jumlah filter aktif.  
4. Gunakan **Reset Filter** di dalam panel atau **Reset semua** pada chip filter aktif di bawah bilah alat.  
5. Gunakan menu **Kolom** untuk menampilkan atau menyembunyikan kolom tabel.  
6. Atur jumlah data per halaman (20, 30, 40, atau 50) dan gunakan kontrol pagination.  
7. Klik ikon panah pada kolom Aksi untuk **expand** baris: menampilkan **Tanggal Dibuat** dan **Deskripsi** singkat project. Klik lagi untuk menutup.

#### 3.5.1.2 MELIHAT DETAIL PROJECT

1. Pada tabel, klik ikon **mata** (*Detail Project*) pada baris yang diinginkan.  
2. Anda diarahkan ke halaman detail project (tab **Ringkasan**).

#### 3.5.1.3 MENGHAPUS PROJECT

1. Pastikan Anda memiliki izin hapus project.  
2. Klik ikon hapus pada kolom Aksi.  
3. Konfirmasi penghapusan pada dialog.  
4. Jika project sudah memiliki invoice, sistem menolak penghapusan dan menampilkan pesan kesalahan.

#### 3.5.1.4 MENAMBAH PROJECT

1. Klik tombol **Tambah** (tersedia jika memiliki izin membuat project).  
2. Anda diarahkan ke `/projects/create` (lihat **3.5.2**).

---

### 3.5.2 BUAT PROJECT

Halaman pembuatan project mengumpulkan data pelanggan, perusahaan (opsional), layanan, paket layanan, template (opsional), dan data project. Akses dari tombol **Tambah** pada daftar project atau langsung ke `https://dashboard.mitrajasalegalitas.co.id/projects/create`.

**Catatan:** jika halaman dibuka dari alur konversi **permintaan penawaran (quote)** yang disetujui, beberapa field dapat terisi otomatis (nama project, estimasi anggaran, layanan, dll.).

#### 3.5.2.1 PELANGGAN (PIC)

1. **Mencari pelanggan yang sudah ada:** ketik minimal dua karakter pada pencarian pelanggan, lalu pilih dari hasil.  
2. **Pelanggan baru:** isi data yang diminta (nama, email, telepon/WhatsApp, tier, catatan sesuai form).  
3. Anda dapat melepaskan pilihan pelanggan dan memilih/mengisi ulang sesuai kebutuhan.

#### 3.5.2.2 PERUSAHAAN

1. Pilih mode: tidak memakai perusahaan, memilih perusahaan yang sudah terhubung ke pelanggan, atau **membuat perusahaan baru**.  
2. Jika membuat perusahaan baru, lengkapi data sesuai form (nama, kontak, alamat, kota, provinsi, kode pos, NPWP, status legalitas, kategori bisnis, website, catatan, dll.).  
3. Sistem dapat menghubungkan pelanggan ke perusahaan baru sesuai aturan di backend.

#### 3.5.2.3 LAYANAN, PAKET, DAN TEMPLATE

1. Pilih **layanan** yang aktif dan dipublikasikan.  
2. Pilih **paket layanan** yang sesuai.  
3. **Template project (opsional):** jika dipilih, sistem menyalin **milestone** dan **checklist dokumen** dari template ke project baru (milestone mendapat tanggal relatif terhadap tanggal mulai project; dokumen awal berstatus belum diunggah).

#### 3.5.2.4 DATA PROJECT & PENYIMPANAN

1. Isi **nama project**, **deskripsi** (jika ada), **budget**, **tanggal mulai**, **rencana tanggal selesai**, dan **status awal** (misalnya *Planning*).  
2. Klik simpan untuk mengirim formulir.  
3. Setelah sukses: jika berasal dari konversi quote, Anda dapat diarahkan ke **detail project** dengan pesan sukses; jika tidak, kembali ke daftar project dengan pesan bahwa project berhasil ditambahkan.

---

### 3.5.3 DETAIL PROJECT

Setelah membuka project, judul halaman menjelaskan bahwa Anda dapat mengelola keuangan, tim, milestone, dokumen, dan aspek lain dari satu tempat.

**Tab horizontal** (hanya tab yang diizinkan permission yang akan tampil): **Ringkasan**, **Keuangan**, **Tim**, **Milestone**, **Tugas**, **Dokumen**, **Hasil Akhir**, **Diskusi**, **Aktivitas**. Klik nama tab untuk berpindah; URL mengikuti tabel pada **3.5.0**.

---

#### 3.5.3.1 RINGKASAN

Tab **Ringkasan** menampilkan profil project: pelanggan, perusahaan, layanan, paket, anggaran, tanggal rencana dan aktual, serta informasi terkait.

**Melihat dan mengubah data**

1. Secara default tampil mode **lihat**.  
2. Jika memiliki izin edit project, gunakan kontrol untuk masuk mode **ubah** (misalnya mengubah pelanggan dengan pencarian, memilih perusahaan, layanan, paket, nama, deskripsi, budget, tanggal mulai/rencana selesai, tanggal aktual mulai/selesai).  
3. Simpan perubahan atau batalkan sesuai tombol yang tersedia.

**Mengubah status project**

1. Gunakan kontrol ubah status (dropdown/dial sesuai tampilan) untuk memilih status: *Planning*, *In Progress*, *On Hold*, *Completed*, *Cancelled*.  
2. Konfirmasi pada dialog **Ubah Status Project** jika diminta.  
3. Saat status diubah ke *In Progress* atau *Completed*, tanggal aktual dapat diperbarui otomatis oleh sistem; saat kembali ke *Planning*, tanggal aktual dapat dikosongkan sesuai logika sistem.  
4. Pesan sukses menegaskan bahwa status project berhasil diperbarui.  
5. Saat project diselesaikan (*Completed*), klien dapat menerima notifikasi email (jika akun portal terhubung).

---

#### 3.5.3.2 KEUANGAN

Tab **Keuangan** memuat ringkasan angka dan dua blok utama: **Invoice** dan **Pengeluaran**.

**Kartu ringkasan (contoh label di antarmuka)**

- Total Dana (Budget)  
- Tagihan Kontrak (termasuk ringkasan excl. pajak dan terbayar)  
- Sisa Tagihan Kontrak  
- Invoice Additional  
- Total Pengeluaran (termasuk bagian yang dapat ditagihkan)  
- Belum Dibayar  
- Profit Kontrak  
- Profit Aktual  
- Total Diterima  

Setiap kartu dapat memiliki indikator tren (naik/turun) untuk bantuan interpretasi cepat.

**Invoice**

1. Dafftar invoice yang terkait dengan project ditampilkan dalam bentuk kartu/daftar.  
2. **Tambah Invoice** / **Tambah Invoice Pertama** membuka halaman pembuatan invoice di modul keuangan dengan project terpilih (query `project_id`). URL mengikuti pola `/finances/invoices/create?project_id={id}`.  
3. Untuk mengubah status invoice, mengunduh PDF, mencatat pembayaran, atau detail lainnya, gunakan prosedur modul **Keuangan** (invoice, pembayaran, kwitansi) pada bab terkait.

**Pengeluaran**

1. Daftar pengeluaran yang dialokasikan ke project.  
2. **Tambah** / **Tambah Pengeluaran Pertama** membuka *drawer* pencatatan pengeluaran terhubung ke project.  
3. Pengeditan pengeluaran dapat dilakukan dari *drawer* edit jika tersedia.  
4. Untuk definisi akun, vendor, atau jurnal, rujuk bab **Modul Keuangan**.

---

#### 3.5.3.3 TIM

Judul blok: **Anggota Tim** — daftar staff yang ditugaskan pada project.

**Menambah anggota**

1. Klik **Tambah** (jika sudah ada anggota) atau alur *empty state* **Tambah Anggota** pertama.  
2. Pada *drawer*, pilih pengguna dan peran, lalu simpan.

**Mengelola anggota**

1. Setiap baris menampilkan nama, email, dan **posisi** (badge: *Project Leader*, *Team Member*, *Observer*).  
2. Klik badge posisi (jika memiliki izin edit anggota) untuk memilih posisi baru; konfirmasi pada dialog **Ubah Posisi Anggota Tim**.  
3. **Hapus** anggota melalui ikon hapus dengan dialog konfirmasi (izin hapus anggota).

---

#### 3.5.3.4 MILESTONE

Ringkasan kartu: **Total**, **Selesai**, **Sedang Berjalan**, **Terhambat**, serta indikator persentase selesai.

**Menambah milestone**

1. Klik **Tambah** dan isi formulir (judul, deskripsi, estimasi durasi, offset hari, tanggal terkait sesuai form).  
2. Simpan.

**Mengubah urutan**

1. Gunakan kontrol naik/turun pada setiap milestone untuk menukar urutan (reorder).

**Mengubah status & lainnya**

1. Ubah status milestone (*Not Started*, *In Progress*, *Completed*, *Blocked*, *Cancelled*) sesuai kontrol pada kartu.  
2. Perhatikan bahwa milestone tertentu yang sedang berjalan atau selesai mungkin tidak dapat dihapus (aturan *undeletable* pada status).

**Menghapus**

1. Hapus milestone jika diizinkan dan status memungkinkan; konfirmasi jika ada.

---

#### 3.5.3.5 TUGAS

Ringkasan: **Total**, **Selesai**, **Sedang Berjalan**, **Terlambat** (tugas melewati tenggat dan belum selesai/dibatalkan).

**Menambah tugas**

1. Klik **Tambah** dan isi: judul, deskripsi, prioritas (*Low*, *Medium*, *High*, *Urgent*), status (*To Do*, *In Progress*, *Review*, *Completed*, *Cancelled*), tenggat waktu, penugasan ke anggota tim, dan opsional **milestone** terkait.  
2. Simpan.

**Mengelola tugas**

1. Pada setiap kartu tugas, ubah **status** atau **prioritas** melalui kontrol yang disediakan.  
2. Edit detail atau hapus tugas sesuai izin.

---

#### 3.5.3.6 DOKUMEN

Ringkasan status dokumen pada project: antara lain **Terverifikasi**, **Menunggu Review**, **Ditolak**, **Belum Upload**.

**Menambah entri dokumen**

1. Klik **Tambah** dan isi metadata dokumen (nama, format, wajib/tidak, catatan, dll. sesuai form).  
2. Unggah file melalui alur **Upload** pada kartu dokumen jika file belum ada.

**Mengelola dokumen**

1. **Lihat** file di tab baru, **Unduh**, atau **Unduh Semua** jika tersedia.  
2. **Urutkan** dokumen naik/turun jika fitur reorder tersedia.  
3. **Ubah status** (misalnya ke *Verified* atau *Rejected*); untuk penolakan, isi alasan jika diminta.  
4. **Enkripsi** atau ubah flag terkait keamanan melalui dialog konfirmasi jika tersedia.  
5. **Edit** metadata atau **Hapus** dokumen sesuai izin; dokumen pada status tertentu mungkin tidak boleh dihapus.

Pengguna yang merupakan anggota tim dengan hak verifikasi dokumen dapat melakukan tindakan persetujuan sesuai kebijakan yang ditampilkan di layar.

---

#### 3.5.3.7 HASIL AKHIR (DELIVERABLE)

Daftar file/entri hasil akhir untuk klien: tambah, ubah metadata, unggah file, unduh, tandai versi final, pengaturan keamanan (misalnya enkripsi), dan hapus sesuai izin.

---

#### 3.5.3.8 DISKUSI

1. Menampilkan utas komentar dengan balasan bersarang.  
2. Tambah komentar baru, balas komentar, atau ubah/hapus komentar sendiri sesuai izin diskusi project.

---

#### 3.5.3.9 AKTIVITAS

1. Menampilkan log aktivitas terkait project (perubahan pada project, milestone, invoice, pengeluaran, anggota, tugas, dokumen, hasil akhir, dll.).  
2. Gunakan pagination untuk melihat halaman berikutnya.

---

### 3.5.4 DOKUMEN (GLOBAL)

Halaman **Manajemen Dokumen** — deskripsi: mengelola dokumen terkait project, menambah, melihat, dan mengunduh file. Akses: **Project → Dokumen** atau `/projects/documents`.

**Informasi pada halaman**

1. **Header** — judul dan deskripsi.  
2. **Kartu ringkasan:** Total Dokumen; Terverifikasi; Menunggu Review; Ditolak / Belum Upload (footer memecah jumlah ditolak dan belum diunggah).  
3. **Tabel** — daftar dokumen dari seluruh project dengan pencarian, filter status, menu kolom, ukuran halaman, dan pagination. Baris dapat di-*expand* untuk detail; gunakan tautan ke project terkait jika ditampilkan di kolom.

---

### 3.5.5 HASIL AKHIR (GLOBAL)

Halaman **Manajemen Hasil Akhir** — deskripsi: daftar dokumen hasil akhir beserta status final dan pengaturan keamanan. Akses: **Project → Hasil Akhir** atau `/projects/deliverables`.

**Informasi pada halaman**

1. **Kartu ringkasan:** Total Hasil Akhir; Versi Final; Draft / Revisi; Terenkripsi.  
2. **Tabel** — pencarian, pagination, dan kolom sesuai implementasi (misalnya nama, project, status final, enkripsi).

---

### 3.5.6 TEMPLATE PROJECT

Halaman pengelolaan template untuk mempercepat pembuatan project (milestone dan checklist dokumen). Akses: **Project → Template** atau `/projects/templates`.

**Informasi pada halaman**

1. **Header** — judul modul template (sesuai tampilan) dan deskripsi.  
2. **Kartu ringkasan:** Total Template; Aktif; Dengan Konten; pembagian **Service Based** vs **Custom**.  
3. **Tabel:** kolom antara lain **Template** (nama, badge Service Based atau Custom, nama layanan jika ada), **Durasi Estimasi** (hari), jumlah **Milestone**, jumlah **Dokumen**, **Status** (*Active* / *Inactive*), **Aksi**.

#### 3.5.6.1 MELIHAT & MENCARI TEMPLATE

1. Gunakan **Cari nama template…**.  
2. Buka **Filter:** Layanan, Tipe (*Service Based* / *Custom*), Status (*Active* / *Inactive*).  
3. Gunakan **Kolom** untuk menampilkan/menyembunyikan kolom.  
4. Atur jumlah data per halaman dan pagination.  
5. Klik expand pada baris untuk detail tambahan jika ada.

#### 3.5.6.2 MENAMBAH TEMPLATE

1. Klik **Tambah** menuju `/projects/templates/create`.  
2. Pilih mode pembuatan: **Custom** atau **dari layanan** (*from service*).  
3. Jika dari layanan, pilih layanan dan muat data; sistem dapat mengisi nama, deskripsi, durasi estimasi, serta daftar milestone dan dokumen dari layanan.  
4. Untuk **Custom**, isi nama, deskripsi, durasi estimasi (hari), status (*Active*/*Inactive*), **catatan**.  
5. Kelola **Milestone:** tambah, ubah, hapus, urutkan naik/turun; isi judul, deskripsi, durasi estimasi, offset hari, urutan.  
6. Kelola **Dokumen:** tambah, ubah, hapus, urutkan; isi nama, deskripsi, format dokumen, wajib/tidak, catatan.  
7. Simpan template.

#### 3.5.6.3 MENGUBAH TEMPLATE

1. Pada daftar, klik ikon **Edit** atau buka `/projects/templates/{templateId}/edit`.  
2. Ubah data umum (nama, deskripsi, layanan terkait jika ada, durasi, status, catatan).  
3. Sesuaikan daftar milestone dan dokumen seperti pada pembuatan.  
4. Simpan perubahan.

#### 3.5.6.4 MENDUPLIKASI TEMPLATE

1. Pada baris template, klik ikon **Duplikasi Template** (salinan).  
2. Tunggu proses selesai; notifikasi sukses menegaskan template telah diduplikasi.

#### 3.5.6.5 MENGHAPUS TEMPLATE

1. Klik hapus pada baris (jika tersedia dan Anda memiliki izin).  
2. Konfirmasi penghapusan.

---

*Dokumen ini disusun agar selaras dengan perilaku antarmuka di `resources/js/pages/projects/` dan rute di `routes/projects.php` serta modul keuangan terkait project.*
