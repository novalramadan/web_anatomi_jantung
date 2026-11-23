/// 1700000000_users_extend.js
/// Extend `users` auth collection with `nama` (text) + `role` (select: mahasiswa|dosen).
/// Role mutation is blocked at request level in pb_hooks/pb_hooks.pb.js.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  if (!users.fields.getByName("nama")) {
    users.fields.add(new TextField({ name: "nama", max: 200 }));
  }
  if (!users.fields.getByName("role")) {
    users.fields.add(new SelectField({
      name: "role",
      maxSelect: 1,
      values: ["mahasiswa", "dosen"],
    }));
    // default value set per-record on create via pb_hooks; schema default is mahasiswa
  }

  // users: read/update profile only. role field itself not modifiable via API
  // (enforced in pb_hooks). create is public (register), enforced as mahasiswa in pb_hooks.
  users.listRule   = "@request.auth.id = id";
  users.viewRule   = "@request.auth.id = id";
  users.createRule = "";     // open register; pb_hooks forces role = mahasiswa
  users.updateRule = "@request.auth.id = id";
  users.deleteRule = null;   // superuser-only via Dashboard

  app.save(users);

  // Seed demo accounts here (not in pb_hooks): bootstrap fires before migrations
  // run, so role/nama fields wouldn't exist yet if we seeded in onBootstrap.
  const seed = [
    { email: "dosen@medicalu.local", password: "dosen12345", nama: "Dosen Demo", role: "dosen" },
    { email: "mahasiswa@medicalu.local", password: "mahasiswa12345", nama: "Mahasiswa Demo", role: "mahasiswa" },
  ];
  for (const s of seed) {
    try {
      app.findAuthRecordByEmail("users", s.email);
      continue; // already exists
    } catch (err) { /* not found — create */ }
    const rec = new Record(users);
    rec.set("email", s.email);
    rec.set("password", s.password);
    rec.set("nama", s.nama);
    rec.set("role", s.role);
    app.save(rec);
    console.log("[seed] demo user created:", s.email, "as", s.role);
  }
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  const namaField = users.fields.getByName("nama");
  const roleField = users.fields.getByName("role");
  if (namaField) users.fields.remove(namaField);
  if (roleField) users.fields.remove(roleField);
  app.save(users);
});
