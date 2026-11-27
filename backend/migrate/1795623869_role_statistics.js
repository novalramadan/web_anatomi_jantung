// 1795623869_role_statistics.js
// Dosen perlu membaca data seluruh mahasiswa untuk dasbor statistik:
//   users   : daftar akun (nama + email) mahasiswa
//   progres : payload belajar tiap mahasiswa
// Mahasiswa tetap hanya bisa membaca rekam miliknya sendiri. Tulis/hapus
// progres tetap milik mahasiswa (dosen tidak boleh mengubah hasil belajar).
migrate((app) => {
  const progres = app.findCollectionByNameOrId("progres");
  progres.listRule = "@request.auth.id = user || @request.auth.role = 'dosen'";
  progres.viewRule = "@request.auth.id = user || @request.auth.role = 'dosen'";
  app.save(progres);

  const users = app.findCollectionByNameOrId("users");
  users.listRule = "@request.auth.id = id || @request.auth.role = 'dosen'";
  users.viewRule = "@request.auth.id = id || @request.auth.role = 'dosen'";
  app.save(users);

  console.log("1795623869_role_statistics: dosen can read users + progres");
}, (app) => {
  const progres = app.findCollectionByNameOrId("progres");
  progres.listRule = "@request.auth.id = user";
  progres.viewRule = "@request.auth.id = user";
  app.save(progres);

  const users = app.findCollectionByNameOrId("users");
  users.listRule = "@request.auth.id = id";
  users.viewRule = "@request.auth.id = id";
  app.save(users);
});
