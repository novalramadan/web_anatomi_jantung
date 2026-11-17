/* js/storage.js — progres pengguna di localStorage (kunci cardioverse_progres). */
window.Storage = (function () {
  var KEY = (window.CONFIG && CONFIG.kunciStorage) || "cardioverse_progres";

  function defaults() {
    return {
      nama_pemain: "",
      materi_selesai: [],
      skor_kuis: {},
      soal_salah: [],
      esai_jawaban: {},
      kasus_selesai: {},
      marker_dipindai: [],
      refleksi: {},
      pengaturan: { ukuranFont: 100, mode: "terang", suara: true }
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      var data = JSON.parse(raw);
      return Object.assign(defaults(), data);
    } catch (e) {
      return defaults();
    }
  }

  function save(p) {
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
      return true;
    } catch (e) {
      return false;
    }
  }

  function update(fn) {
    var p = load();
    fn(p);
    save(p);
    return p;
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  return { load: load, save: save, update: update, reset: reset, defaults: defaults };
})();
