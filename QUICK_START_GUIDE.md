# 🚀 QUICK START GUIDE - Edit Mode

## ⚡ 5 Menit Setup

### Step 1: Buka Admin Dashboard
```
Navigasi ke: pages/admin-dashboard.html
atau
Navigasi ke: pages/editor-dashboard.html
```

### Step 2: Klik Menu "Edit Halaman"
Di sidebar kiri, klik menu dengan ikon pensil "Edit Halaman"

### Step 3: Pilih Halaman
Klik salah satu kartu halaman yang ingin diedit:
- 🏠 **Beranda** - Edit hero section, tentang lab, berita
- 📋 **Profil Lab** - Edit informasi profil
- 📰 **Berita** - Edit halaman berita
- 📸 **Galeri** - Edit halaman galeri
- 📚 **Publikasi** - Edit halaman publikasi
- 🏢 **Fasilitas** - Edit halaman fasilitas
- 👥 **Anggota** - Edit halaman anggota
- 📞 **Kontak** - Edit halaman kontak

### Step 4: Mode Edit Aktif
Halaman terbuka dengan:
- ✅ Toolbar di kanan atas (Mode Edit Aktif)
- ✅ Border biru dashed pada elemen editable
- ✅ Tombol panah (←) di kiri bawah

### Step 5: Edit Konten
1. **Hover** pada elemen yang ingin diedit
2. **Klik** ikon ✎ (edit icon)
3. **Isi** form yang muncul
4. **Klik** tombol "Simpan"
5. **Lihat** perubahan di halaman

### Step 6: Kembali
- Klik tombol "Batalkan" di toolbar, atau
- Klik tombol panah (←) di kiri bawah

---

## 🎯 Contoh Penggunaan

### Edit Judul Hero (Beranda)

```
1. Admin Dashboard → Edit Halaman
2. Klik kartu "Beranda"
3. Halaman terbuka dalam mode edit
4. Hover pada judul "Laboratorium Data Technologies"
5. Klik ikon ✎
6. Popup form muncul dengan textarea
7. Ubah teks judul
8. Klik "Simpan"
9. ✅ Judul berubah di halaman
10. Klik "Batalkan" untuk kembali
```

### Edit Gambar Hero

```
1. Sama seperti di atas, tapi pilih gambar
2. Di popup form, ada input file
3. Pilih gambar baru dari komputer
4. Klik "Simpan"
5. ✅ Gambar berubah di halaman
```

### Edit Teks Deskripsi

```
1. Hover pada paragraf deskripsi
2. Klik ikon ✎
3. Popup form muncul
4. Edit teks di textarea
5. Klik "Simpan"
6. ✅ Teks berubah
```

---

## 🎨 Elemen yang Dapat Diedit

### Di Halaman Beranda (index.html):

| Elemen | Tipe | Cara Edit |
|--------|------|----------|
| Judul Hero | Heading | Hover → Klik ✎ → Edit teks |
| Deskripsi Hero | Text | Hover → Klik ✎ → Edit teks |
| Gambar Hero | Image | Hover → Klik ✎ → Upload gambar |
| Judul About | Heading | Hover → Klik ✎ → Edit teks |
| Deskripsi About | Text | Hover → Klik ✎ → Edit teks |
| Gambar About | Image | Hover → Klik ✎ → Upload gambar |
| Judul "Mengapa Memilih" | Heading | Hover → Klik ✎ → Edit teks |
| Deskripsi "Mengapa Memilih" | Text | Hover → Klik ✎ → Edit teks |
| Judul "Jelajahi Lebih Lanjut" | Heading | Hover → Klik ✎ → Edit teks |
| Deskripsi "Jelajahi Lebih Lanjut" | Text | Hover → Klik ✎ → Edit teks |
| Judul "Berita Terbaru" | Heading | Hover → Klik ✎ → Edit teks |
| Deskripsi "Berita Terbaru" | Text | Hover → Klik ✎ → Edit teks |

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- **Ctrl + Enter** di textarea → Simpan perubahan
- **Esc** → Batalkan popup (jika diimplementasikan)

### Toolbar Buttons
```
🟡 Mode Edit Aktif  ← Indikator mode
💾 Simpan Perubahan ← Simpan semua perubahan
✕ Batalkan          ← Batalkan dan kembali
```

### Visual Indicators
- **Border Biru Dashed** = Elemen dapat diedit
- **Ikon ✎ Biru** = Klik untuk edit
- **Popup Form** = Tempat edit konten
- **Success Message Hijau** = Perubahan berhasil

### Mobile Tips
- Toolbar menjadi vertikal di mobile
- Buttons lebih besar untuk touch
- Popup form full-width
- Back button lebih prominent

---

## ⚠️ Penting Diketahui

### ✅ Yang Bisa Dilakukan
- Edit teks heading dan paragraf
- Upload gambar baru
- Lihat preview perubahan langsung
- Kembali ke dashboard kapan saja

### ❌ Yang TIDAK Bisa Dilakukan
- Perubahan **TIDAK** disimpan ke database
- Refresh halaman = konten kembali normal
- Tidak bisa menambah/menghapus elemen
- Tidak bisa mengubah struktur halaman

### 💾 Penyimpanan
- Semua perubahan hanya **simulasi visual**
- Untuk menyimpan permanent, perlu backend integration
- Ini adalah **UI-only preview** dari fitur edit

---

## 🔧 Troubleshooting

### Masalah: Ikon Edit Tidak Muncul
**Solusi:**
1. Pastikan URL memiliki `?edit=true`
2. Refresh halaman (F5)
3. Buka console (F12) cek error
4. Pastikan script edit-mode.js ter-load

### Masalah: Popup Form Tidak Muncul
**Solusi:**
1. Pastikan klik ikon ✎ dengan benar
2. Cek console untuk error messages
3. Pastikan browser support JavaScript
4. Coba di browser lain

### Masalah: Perubahan Tidak Terlihat
**Solusi:**
1. Pastikan klik tombol "Simpan" di popup
2. Lihat success message (hijau)
3. Tunggu animasi selesai
4. Scroll halaman jika perlu

### Masalah: Tidak Bisa Kembali ke Dashboard
**Solusi:**
1. Klik tombol panah (←) di kiri bawah
2. Atau klik "Batalkan" di toolbar
3. Konfirmasi dialog akan muncul
4. Klik "OK" untuk confirm

---

## 📱 Device Support

| Device | Support | Notes |
|--------|---------|-------|
| Desktop (1024px+) | ✅ Full | Optimal experience |
| Tablet (768px) | ✅ Good | Responsive layout |
| Mobile (< 768px) | ✅ Good | Touch-friendly |
| Chrome/Edge | ✅ Full | Latest version |
| Firefox | ✅ Full | Latest version |
| Safari | ✅ Full | Latest version |

---

## 🎓 Workflow Lengkap

```
┌─────────────────────────────────────────────────┐
│ 1. Login ke Dashboard Admin/Editor              │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 2. Klik Menu "Edit Halaman"                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 3. Pilih Halaman dari Grid 9 Pilihan           │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 4. Halaman Terbuka dalam Mode Edit              │
│    - Toolbar di kanan atas                      │
│    - Border biru pada elemen editable           │
│    - Back button di kiri bawah                  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 5. Hover pada Elemen → Klik Ikon ✎             │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 6. Popup Form Muncul                            │
│    - Edit teks/upload gambar                    │
│    - Klik "Simpan" atau "Batalkan"             │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 7. Perubahan Terlihat di Halaman                │
│    - Success message muncul                     │
│    - Konten terupdate                           │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 8. Kembali ke Dashboard                         │
│    - Klik tombol panah (←) atau "Batalkan"    │
│    - Confirm dialog muncul                      │
│    - Kembali ke dashboard                       │
└─────────────────────────────────────────────────┘
```

---

## 📞 Bantuan Cepat

### Pertanyaan Umum

**Q: Apakah perubahan disimpan?**  
A: Tidak, ini hanya simulasi visual. Perubahan hilang saat refresh.

**Q: Bagaimana cara menyimpan permanent?**  
A: Perlu backend integration (akan dikembangkan di masa depan).

**Q: Bisa edit halaman lain?**  
A: Ya, semua halaman support edit mode (Profil, Berita, Galeri, dll).

**Q: Bisa menambah elemen baru?**  
A: Tidak, hanya bisa edit elemen yang sudah ada.

**Q: Apa yang terjadi saat refresh?**  
A: Konten kembali ke original, perubahan hilang.

---

## 🎉 Selesai!

Anda sudah siap menggunakan fitur Edit Mode!

**Langkah Selanjutnya:**
1. ✅ Buka Dashboard Admin/Editor
2. ✅ Klik "Edit Halaman"
3. ✅ Pilih halaman
4. ✅ Edit konten
5. ✅ Lihat preview
6. ✅ Kembali ke dashboard

---

**Versi**: 1.0  
**Status**: Ready to Use  
**Support**: Lihat EDIT_MODE_DOCUMENTATION.md untuk detail lebih lanjut
