# Medical-U — Backend (PocketBase)

Backend untuk aplikasi belajar **Medical-U** (materi Fisiologi Jantung).
Satu binary Go (`pocketbase.exe`) tanpa framework tambahan. Frontend SPA berada di `../pb_public/`.

## Kebutuhan

- Windows 10/11 (64-bit) atau OS lain yang didukung PocketBase.
- Tidak butuh Node/Go untuk menjalankan; Node hanya dipakai untuk membangkitkan ulang file seed migration (`backend/tools/build_seed_migrations.js`).

## Setup dari nol

```powershell
cd backend
.\pocketbase.exe serve --http=127.0.0.1:8090 --dir=pb_data --migrationsDir=migrate --hooksDir=pb_hooks --publicDir=../pb_public
```

Urutan saat pertama kali:

1. **Binary** sudah ada di `backend/pocketbase.exe` (v0.40.6). Bila belum ada:
   unduh dari https://github.com/pocketbase/pocketbase/releases/latest lalu simpan sebagai `backend/pocketbase.exe`.
2. `pb_data/` dan `pb_data/storage/` terbentuk otomatis saat server pertama kali jalan.
3. Migration dijalankan otomatis oleh `serve` (flag `--automigrate` default `true`).
   Untuk menjalankannya manual dulu:
   ```powershell
   .\pocketbase.exe migrate up --dir=pb_data --migrationsDir=migrate
   ```
4. Server berhenti? Nyalakan lagi dengan perintah `serve` di atas.
5. Buka Dashboard: **http://127.0.0.1:8090/_/**

## Superuser & akun demo

Superuser dan dua akun demo dibuat otomatis oleh hook saat server pertama kali jalan.
Semua nilai ini bisa diubah di **satu tempat**: blok `CONFIG` di
`backend/pb_hooks/pb_hooks.pb.js`.

| Akun | Email | Password | Role |
|---|---|---|---|
| Superuser | `admin@medicalu.local` | `Admin123456!` | `_superusers` |
| Dosen demo | `dosen@medicalu.local` | `dosen12345` | `dosen` |
| Mahasiswa demo | `mahasiswa@medicalu.local` | `mahasiswa12345` | `mahasiswa` |

Ubah kredensial itu sebelum dipakai bersama mahasiswa sungguhan.

## Koleksi

| Koleksi | Isi |
|---|---|
| `users` | auth bawaan + `nama`, `role` (`mahasiswa` \| `dosen`) |
| `pertemuan` | 16 pertemuan; field `id_lokal`, `isi` json (tujuan, konsep_inti, dst.) |
| `soal` | 41 soal PG |
| `kasus` | 4 kasus bercabang |
| `marker` | marker barcode → relasi `aset_3d` |
| `aset_3d` | model GLB |
| `glosarium` / `rumus` / `normal` / `pustaka` | lampiran |
| `progres` | 1 record per user, `payload` = mirror localStorage frontend |

## Aturan API (ringkas)

- Konten (`pertemuan`, `soal`, `kasus`, `marker`, `aset_3d`, `glosarium`, `rumus`, `normal`, `pustaka`):
  baca = siapa pun yang login; tulis/hapus = `dosen`.
- `progres`: semua operasi = pemilik rekam (`@request.auth.id = user`).
- `users`: baca/ubah profil sendiri; `role` tidak bisa diubah lewat API oleh pemilik akun.
- Register publik **selalu** menghasilkan `role = "mahasiswa"` apa pun isi body (dipaksa di hook).

## URL berkas

```
{pbUrl}/api/files/{collection}/{recordId}/{filename}
```
Berkas `.glb` / `gambar` hanya bisa diakses oleh user yang login.

## Reset total

Hentikan server, hapus folder `backend/pb_data/`, nyalakan lagi.
Migration + seed + superuser akan dibuat ulang otomatis.

```powershell
# dari root repo
Stop-Process -Name pocketbase -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backend\pb_data
.\backend\pocketbase.exe serve --dir=backend\pb_data --migrationsDir=backend\migrate --hooksDir=backend\pb_hooks --publicDir=pb_public --http=127.0.0.1:8090
```

## Struktur

```
backend/
├── pocketbase.exe          # binary v0.40.6
├── pb_data/                # DB runtime + storage (gitignore)
├── migrate/                # migration JS (dijalankan `migrate up`)
├── pb_hooks/
│   └── pb_hooks.pb.js      # CONFIG + seed + hooks (register/delete/proteksi role)
├── tools/                  # generator seed migration (opsional dipakai)
├── .env.example            # (opsional) salinan CONFIG
└── README.md               # file ini
```
