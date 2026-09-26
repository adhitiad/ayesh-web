# DESIGN.md (ayesh-web)

## Status

Arahan terkonfirmasi pemilik lewat Design Read (2026-09-23): tema gelap-only, font 'Segoe UI'.
Pertanyaan motion tidak dijawab, sehingga MOTION: mati tetap berlaku sebagai arahan sementara
dan boleh diganti kapan saja. Dokumen ini menyatakan arahan resmi desain (R-37).

## Dials

- ENERGY: rendah. Utilitarian, tanpa ornamen; tool harian untuk chat ke ayesh-core.
- RHYTHM: padat. Jarak 8 sampai 16px, satu kolom, tanpa section marketing.
- MOTION: mati. Tidak ada transisi maupun animasi CSS. Alasan: tool yang dipakai terus-menerus,
  gerak hanya menambah latensi persepsi. Satu-satunya gerak: scroll halus saat pesan baru muncul.

## Keputusan yang sudah berjalan (alasan)

| Keputusan | Nilai | Alasan |

|---|---|---|

| Tema | gelap-only (`--bg #0f1115` dst.) | dikonfirmasi pemilik (Design Read 2026-09-23); tool berdurasi lama, carve-out R-21 |
| Font | 'Segoe UI' | dikonfirmasi pemilik (Design Read 2026-09-23); alasan: font bawaan OS, nol unduhan |
| Palet utama | `--bg #0f1115`, `--panel #171a21`, `--line #2a2f3a`, `--text #e6e8ee`, `--dim #9aa1af` | teks utama kontras >= 15:1 terhadap bg, `--dim` 7,1:1 (lulus AA) |
| Brand | `--brand #2f6fe4` | digelapkan dari `#4f8cff` agar teks putih di atasnya lulus AA 4,5:1 (audit-001 temuan 2: 3,2:1 menjadi 4,65:1) |
| Layout | satu kolom, max 860px, center | chat punya satu alur baca; lebar besar mempersulit jejak mata |
| Radius | 6 sampai 10px | tampilan tegas-ringan, bukan card marketing |
| Warna status | OK `#5dd39e`, gagal `#ff7b8a` | konvensi hijau-merah; kontras terhadap `--bg` 10:1 dan 7,5:1 |
| Banner error | bg `#3a1d22`, border `#7a2e3a`, teks `#ffb4be` | merah gelap tidak menyaingi isi chat; teks 9:1 terhadap bg banner |
| Tap target | semua tombol/input/nav >= 44px, jarak antar target >= 8px | aturan R-03 (audit-001 temuan 3) |
| Token | kustom (`bg/panel/line/text/dim/brand`) dipisah dari shadcn (`background/border/muted/...`) | cegah tabrakan nilai token pasca-instalasi shadcn |
| Persistensi | localStorage per sesi, kuota 200 pesan | fitur Persistensi chat; alasan teknis di riwayat sesi |

## Terbuka (belum diputuskan)

1. Nomor brand `#2f6fe4` boleh diganti asal kontras teks putih di atasnya tetap >= 4,5:1.

Selesai dikerjakan: font ('Segoe UI', Geist dibuang, temuan 6), CSS settings disamakan ke
markup (temuan 5), `<html>` ber-`class="dark"` untuk token shadcn (temuan 7), nav aktif +
warna link (temuan 8), alasan warna status/banner ditulis di tabel ini (temuan 9),
form + `autoComplete` password (temuan 10).

## Hasil Design Read (2026-09-23)

1. Tema gelap-only: ya, dipertahankan.
2. Motion mati: tidak dijawab, tetap berlaku (sesuai aturan tanpa jawaban = arahan sementara).
3. Font: 'Segoe UI'.
