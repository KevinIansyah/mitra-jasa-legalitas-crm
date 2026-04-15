# BAB 3 – DASHBOARD ADMIN (lanjutan)

## 3.7 MODUL KEUANGAN

Modul Keuangan mengelola alur penjualan dan pencatatan akuntansi: permintaan penawaran, proposal, estimasi, invoice project, pembayaran, pengeluaran, vendor, bagan akun, jurnal, dan saldo awal. Setiap submenu dapat dibatasi dengan permission terpisah.

**Base URL**

```
https://dashboard.mitrajasalegalitas.co.id
```

Semua path di bawah ini relatif terhadap host di atas.

---

### 3.7.1 NAVIGASI & URL

Lokasi menu: **Sidebar → Manajemen → Keuangan**.

| MENU | DESKRIPSI | URL |
|------|-----------|-----|
| Permintaan Penawaran | Daftar permintaan penawaran (quote) | `/finances/quotes` |
| Proposal | Proposal bisnis kepada klien | `/finances/proposals` |
| Estimasi | Estimasi biaya | `/finances/estimates` |
| Invoice | Tagihan project | `/finances/invoices` |
| Pembayaran | Pembayaran dari invoice | `/finances/payments` |
| Pengeluaran | Biaya operasional / project | `/finances/expenses` |
| Vendor | Data vendor/supplier | `/finances/vendors` |
| Akun | Chart of accounts | `/finances/accounts` |
| Jurnal | Entri jurnal | `/finances/journal-entries` |
| Saldo Awal | Input saldo awal | `/finances/opening-balance` |

**URL tambahan (contoh)**

| Aktivitas | URL |
|-----------|-----|
| Buat invoice | `/finances/invoices/create` |
| Detail / ubah invoice | `/finances/invoices/{id}`, `/finances/invoices/{id}/edit` |
| Buat proposal | `/finances/proposals/create` |
| Detail / ubah proposal | `/finances/proposals/{id}`, `/finances/proposals/{id}/edit` |
| Buat estimasi | `/finances/estimates/create` (dapat menyertakan `quote_id` lewat alur dari quote) |
| Detail / ubah estimasi | `/finances/estimates/{id}`, `/finances/estimates/{id}/edit` |
| Buat vendor | `/finances/vendors/create` |
| Ubah vendor | `/finances/vendors/{id}/edit` |
| Detail quote | `/finances/quotes/{id}` |
| Konversi quote → project | `/finances/quotes/{id}/convert` |
| Pengeluaran belum tertagih (project) | `/projects/{projectId}/unbilled-expenses` |

---

### 3.7.2 PERMINTAAN PENAWARAN (`/finances/quotes`)

**Judul halaman:** *Permintaan Penawaran* — mengelola permintaan penawaran dari klien/prospek.

**Ringkasan & daftar**

1. Buka **Keuangan → Permintaan Penawaran**.
2. Gunakan **pencarian** dan tombol **Filter** (sheet). Field filter pada panel: **Status**, **Timeline**, **Sumber** (nilai pasti mengikuti opsi di layar).
3. Tabel: kolom dapat diatur lewat menu **Kolom**; pagination dan ukuran halaman sesuai kontrol di bawah tabel.

**Detail quote** (`/finances/quotes/{id}`)

1. Buka baris atau tautan detail.
2. **Ringkasan permintaan** menampilkan antara lain:
   - **Status** (dapat diubah lewat dropdown jika memiliki izin edit; status *converted* / *rejected* bersifat final untuk beberapa aksi).
   - **Timeline**, **Sumber**, **Budget Range** (jika ada).
   - **Nama project**, **Deskripsi** (jika diisi).
   - Jika status ditolak dan ada data: **Alasan penolakan**.
3. **Pemohon:** Nama, Email, Waktu request, Waktu dihubungi, Waktu dikonversi (jika ada).
4. **Customer terhubung:** Nama, Email, Telepon — atau keterangan belum terhubung.
5. **Layanan & bisnis:** Layanan, Paket, Tipe bisnis, Status legal, Budget range — sesuai data quote.
6. **Project terkait:** jika sudah ada project hasil konversi, nama dan status ditampilkan.
7. **Estimasi terkait:** daftar estimasi dengan aksi sesuai izin (buat estimasi, ubah status, revisi, dll.).
8. **Konversi ke project:** tombol mengarah ke `/finances/quotes/{id}/convert` (memerlukan permission **create-projects** dan quote harus *convertible*).
9. **Buat estimasi:** mengarah ke pembuatan estimasi dengan konteks quote (permission **create-finance-estimates**).

*Catatan:* Form pengajuan quote untuk pengguna akhir berada di luar modul admin ini; di dashboard fokus pada peninjauan, status, estimasi, dan konversi.

---

### 3.7.3 PROPOSAL — DAFTAR & ALUR (`/finances/proposals`)

**Judul halaman:** *Proposals*.

1. Buka **Keuangan → Proposal**.
2. Ringkasan KPI, pencarian, dan filter status sesuai halaman.
3. **Tambah:** `/finances/proposals/create`.
4. **Detail:** `/finances/proposals/{id}` — isi, lampiran/PDF jika tersedia.
5. **Ubah:** `/finances/proposals/{id}/edit`.
6. Aksi **status**, **unduh PDF**, **regenerate PDF**, **hapus** mengikuti tombol dan permission.

**Form buat / ubah proposal** (halaman create/edit)

**Bagian Info Proposal**

- **Customer** * — pencarian minimal 2 karakter; setelah dipilih ditampilkan kartu profil singkat (hapus pilihan dengan tombol X jika bukan mode edit terkunci).
- **Nama project** * — teks.
- **Tanggal proposal** * — date picker.
- **Berlaku hingga** — opsional, date picker.

**Bagian Item Proposal**

- Tombol **Tambah Item** menambah baris.
- Per baris (**Item #n**):
  - **Deskripsi** * — textarea.
  - **Qty** — angka.
  - **Harga satuan** — angka.
  - **Pajak (%)** — 0–100.
  - **Diskon (%)** — 0–100.
  - Hapus baris (dibatasi minimal satu baris).
- **Ringkasan** di sisi kanan: Subtotal, Diskon, Pajak, Total; tombol **Simpan**.

**Bagian Catatan**

- **Catatan** — textarea (opsional).

---

### 3.7.4 ESTIMASI — DAFTAR & FORM (`/finances/estimates`)

**Judul halaman:** *Estimates*.

1. Buka **Keuangan → Estimasi**.
2. **Buat:** `/finances/estimates/create` — dapat dari quote (`quote_id`), dari proposal, atau langsung (tanpa quote/proposal).
3. **Detail / edit:** `/finances/estimates/{id}`, `/finances/estimates/{id}/edit`.
4. Status, revisi, PDF — sesuai tombol di layar.

**Form estimate** (create/edit)

**Bagian Info Estimate**

- Jika dari **quote:** kartu baca-only **Permintaan Penawaran** (nomor referensi, nama project, status).
- Jika dari **proposal:** kartu baca-only **Proposal** (nomor proposal, nama project, customer, status).
- Jika **langsung (tanpa quote/proposal):** **Customer** * — pola pencarian dan kartu sama seperti proposal.
- **Tanggal estimate** * — date picker.
- **Berlaku hingga** — opsional.

**Bagian Item Estimasi**

- Tombol **Tambah Item**.
- Per baris: **Deskripsi** *, **Qty**, **Harga satuan**, **Pajak (%)**, **Diskon (%)** (pola sama dengan item proposal).
- Jika dibuat dari proposal, item dapat terisi otomatis dari proposal lalu dapat diedit.

**Bagian Catatan**

- **Catatan** — textarea.

---

### 3.7.5 INVOICE — DAFTAR & FORM (`/finances/invoices`)

**Judul halaman:** *Manajemen Invoice*.

**Kartu ringkasan (contoh label UI):** Total Invoice, Dikirim, Lunas, Jatuh Tempo — dengan angka agregat sesuai halaman.

**Daftar**

1. Filter **status** dan **tipe** invoice; pencarian; kolom; pagination.

**Form buat / ubah invoice** (`/finances/invoices/create`, `/finances/invoices/{id}/edit`)

*Dua konteks:* dari project (`fromProject`, project terpilih) atau **global** (pilih customer).

**Info Invoice**

- **Project** — hanya baca jika dari project: nama, customer, badge status.
- **Customer** * — jika **bukan** dari project: pencarian nama (min. 2 karakter), lalu kartu customer terpilih.
- **Tipe invoice** * — pilihan: Down Payment, Progress Payment, Final Payment, Additional Payment.
- **Tanggal invoice** *, **Jatuh tempo** * — date picker.

**Jumlah tagihan** — untuk tipe **bukan** Additional:

- **Persentase dari budget (%)** — jika ada project ber-budget: mengisi ulang **Amount** dari persentase × budget (opsional).
- **Amount** * — nominal dasar sebelum pajak/diskon level invoice.
- **Pajak (%)**, **Diskon (%)** — opsional.
- Untuk tipe **DP / Progress / Final** (invoice kontrak): blok **Deskripsi** (satu baris) dan **Rincian** (daftar baris teks + tambah per baris; placeholder contoh termin).
- Untuk tipe **Additional:** tidak memakai blok persentase kontrak; mengganti ke **Item Invoice** (lihat bawah).

**Item Invoice** — hanya untuk tipe **Additional Payment**

- Tombol **Import** membuka pemilih **pengeluaran billable** yang belum ditagihkan (jika dari project dan ada `project_id`).
- Tombol **Tambah** menambah baris item.
- Per baris:
  - **Deskripsi** * — textarea.
  - **Rincian item** — sub-baris detail tambahan (jika digunakan di UI).
  - **Qty**, **Harga satuan**, **Pajak (%)**, **Diskon (%)**.
- Ringkasan kanan menghitung total dengan logika **per baris** (mode additional).

**Catatan**

- **Catatan** — teks untuk customer.
- **Instruksi pembayaran** — teks (contoh nomor rekening transfer).

---

### 3.7.6 PEMBAYARAN (`/finances/payments`)

**Judul halaman:** *Manajemen Pembayaran*.

**Kartu ringkasan:** misalnya Total Pembayaran, Menunggu Verifikasi, Terverifikasi, Ditolak — mengikuti label di layar.

**Daftar**

1. Pencarian; **Filter** sheet: **Status**, **Metode pembayaran**.
2. Expander baris atau aksi untuk melihat **detail pembayaran** (drawer).

**Form Tambah Pembayaran** (drawer dari konteks invoice)

- **Invoice** * — kartu baca-only: nomor invoice, total invoice.
- **Nominal** * — angka (default dapat diisi total invoice).
- **Tanggal bayar** * — date picker.
- **Metode pembayaran** — pilih dari daftar (warna/label sesuai UI).
- **No. referensi** — opsional.
- **Catatan** — textarea.
- **Bukti pembayaran** — unggah gambar/PDF (drag-drop atau klik; format di UI: JPG, PNG, WEBP, PDF; batas ukuran mengikuti validasi layar).

Verifikasi (setujui/tolak), unduh kwitansi PDF, dan edit entri mengikuti permission dan tombol pada detail invoice/pembayaran.

---

### 3.7.7 PENGELUARAN (`/finances/expenses`)

**Judul halaman:** *Manajemen Pengeluaran*.

**Form Tambah Pengeluaran** (drawer; konteks project dapat mengunci project)

- **Project** — opsional: pencarian nama project (min. 2 karakter) atau kartu project terkunci jika dari tab project.
- **Vendor** — pilih dari pencarian (min. 2 karakter), **input nama manual**, atau kosongkan sesuai kebijakan; tautan *Input manual* / *Cari dari daftar*.
- **Kategori** * — select.
- **Nominal** * — angka.
- **Deskripsi** * — textarea.
- **Tanggal** * — date picker.
- **Bukti struk** — unggah (JPG, PNG, WEBP, PDF; drag-drop; maks. sesuai teks di UI).
- **Ditagihkan ke pelanggan** — switch (hanya jika ada project): mengaktifkan flag billable untuk muncul sebagai saran di invoice additional.

---

### 3.7.8 VENDOR — FORM (`/finances/vendors/create`, `/finances/vendors/{id}/edit`)

**Informasi vendor**

- **Status** — hanya pada edit: Active / Inactive.
- **Nama vendor** * — teks.
- **Kategori** — select.
- **NPWP**, **Telepon**, **Email** — opsional (email memvalidasi format jika diisi).
- **Alamat** — textarea.
- **Catatan** — textarea.

**Rekening bank** — nol atau lebih; untuk setiap rekening:

- **Nama bank** *, **Nomor rekening** *, **Atas nama** *.
- Satu rekening dapat ditandai **Utama**; tombol hapus/tetapkan utama sesuai UI.

---

### 3.7.9 AKUN (`/finances/accounts`)

**Daftar:** pencarian (kode/nama); filter **tipe**, **status** di sheet; tombol **Tambah**.

**Form Tambah Akun** (drawer)

- **Nama akun** *, **Kode akun** *.
- **Tipe akun** * — memfilter pilihan kategori berikutnya.
- **Kategori** * — tergantung tipe.
- **Normal balance** * — Debit atau Credit (default otomatis saat ganti tipe: aset → debit, lainnya → credit pada penambahan).

**Form Ubah Akun** (drawer): field yang sama dengan tambah, ditambah **Status** akun (misalnya aktif/nonaktif) sesuai layar; akun sistem dapat memiliki pembatasan pengeditan.

---

### 3.7.10 JURNAL (`/finances/journal-entries`)

**Daftar:** filter **Tipe jurnal**, **Dari tanggal**, **Sampai tanggal**; pencarian sesuai placeholder di kolom.

**Form Tambah / Edit Jurnal Manual** (drawer)

- **Tanggal** * — date picker.
- **Keterangan** * — textarea.
- **Baris jurnal:** untuk setiap baris — **Akun** (select), **Debit (Rp)**, **Kredit (Rp)**, **Keterangan** (per baris).
- Tambah/hapus baris; total debit harus sama dengan total kredit (toleransi pembulatan di UI).
- Deskripsi drawer: transaksi penyesuaian atau koreksi.

---

### 3.7.11 SALDO AWAL (`/finances/opening-balance`)

**Peringatan UI**

- Belum diisi: informasi bahwa saldo awal biasanya sekali; setelah transaksi tercatat, perubahan besar melalui **jurnal manual**.
- Sudah diisi: tanggal pencatatan; ringkasan per akun; untuk koreksi setelah terkunci gunakan jurnal manual.

**Form Input / Ubah**

1. **Tanggal saldo awal** — date picker.
2. **Akun & saldo:** tambah baris dengan memilih **akun** (hanya yang belum dipilih di daftar) dan **nominal saldo awal**; daftar baris dapat dihapus per baris.
3. **Simpan** — pertama kali POST; jika mode ubah diizinkan, PUT sesuai alur backend.

---

## 3.8 MODUL LAPORAN

Modul Laporan menampilkan laporan keuangan agregat. Menu: **Sidebar → Manajemen → Laporan**. Permission melihat laporan: **`view-finance-reports`**.

**Base URL**

```
https://dashboard.mitrajasalegalitas.co.id
```

---

### 3.8.1 URL LAPORAN

| MENU | DESKRIPSI | URL |
|------|-----------|-----|
| Laba Rugi | Pendapatan vs beban (periode) | `/finances/reports/profit-loss` |
| Neraca | Posisi keuangan (per tanggal) | `/finances/reports/balance-sheet` |
| Arus Kas | Kas masuk/keluar (periode) | `/finances/reports/cash-flow` |

**Ekspor PDF** (query mengikuti filter aktif di halaman)

| Laporan | Contoh path |
|---------|-------------|
| Laba Rugi | `/finances/reports/profit-loss/pdf?from=...&to=...` |
| Neraca | `/finances/reports/balance-sheet/pdf?as_of=...` |
| Arus Kas | `/finances/reports/cash-flow/pdf?from=...&to=...` |

Tombol **Export PDF** di setiap halaman membuka PDF di tab baru dengan parameter yang sama dengan filter.

---

### 3.8.2 FILTER LAPORAN (UI)

**Laba Rugi & Arus Kas**

- Tombol **Filter** membuka sheet **Filter Periode**.
- Field: **Dari Tanggal**, **Sampai Tanggal** — date picker (tahun 2020–2040).
- **Terapkan** — memuat ulang halaman dengan query `from` dan `to`.

**Neraca**

- Tombol **Filter** membuka sheet **Filter Tanggal**.
- Field: **Per Tanggal** — date picker.
- **Terapkan** — query `as_of`.

---

### 3.8.3 LAPORAN LABA RUGI

**Judul:** *Laporan Laba Rugi* — ringkasan pendapatan dan beban dalam periode.

1. Setelah filter: tiga kartu ringkas **Total Pendapatan**, **Total Beban**, **Laba Bersih** / **Rugi Bersih** dengan rentang tanggal pada deskripsi.
2. Grafik **Pendapatan & Beban per Bulan** — toggle seri Pendapatan / Beban; tooltip nilai Rupiah.
3. Bagian bawah: tabel/detail pendapatan dan beban per akun.

---

### 3.8.4 LAPORAN NERACA

**Judul:** *Neraca* — posisi keuangan per tanggal tertentu.

1. Tiga kartu atas: **Total Aset**, **Total Kewajiban**, **Total Ekuitas** dengan keterangan per tanggal filter.
2. Blok **Aset**, **Kewajiban**, **Ekuitas** — daftar akun (kode, nama, nominal) dan subtotal.
3. Bagian **Persamaan akuntansi** / keseimbangan mengikuti tampilan halaman.

---

### 3.8.5 LAPORAN ARUS KAS

**Judul:** *Laporan Arus Kas* — pergerakan kas dan bank dalam periode.

1. Filter periode sama seperti Laba Rugi.
2. Kartu ringkasan kas masuk, kas keluar, posisi bersih (sesuai label di layar).
3. Grafik dan distribusi sumber arus (invoice, pembayaran, pengeluaran, saldo awal, jurnal manual, dll.) mengikuti legenda di halaman.

---

### 3.8.6 HAK AKSES

| Aktivitas | Permission |
|-----------|------------|
| Melihat semua submenu Laporan | `view-finance-reports` |

### 3.8.7 RINGKASAN PERMISSION KEUANGAN (TEKNIS)

| Submenu | Permission utama |
|---------|------------------|
| Permintaan Penawaran | `view-finance-quotes`, `edit-finance-quotes`, `delete-finance-quotes` |
| Proposal | `view-finance-proposals`, `create-…`, `edit-…`, `delete-…` |
| Estimasi | `view-finance-estimates`, `create-…`, `edit-…`, `delete-…` |
| Invoice | `view-finance-invoices`, `create-…`, `edit-…`, `delete-…` |
| Pembayaran | `view-finance-payments`, `create-…`, `edit-…`, `delete-…` |
| Pengeluaran | `view-finance-expenses`, `create-…`, `edit-…`, `delete-…` |
| Vendor | `view-finance-vendors` (menu) |
| Akun | `view-finance-accounts`, `create-…`, `edit-…`, `delete-…` |
| Jurnal | `view-finance-journals`, `create-…`, `edit-…`, `delete-…` |
| Saldo Awal | `view-finance-opening-balances`, `create-…`, `edit-…` |

---

*Dokumen ini diselaraskan dengan `routes/finances.php`, `resources/js/pages/finances/*`, dan komponen filter laporan `resources/js/pages/finances/reports/_components/report-filter-sheet.tsx`.*
