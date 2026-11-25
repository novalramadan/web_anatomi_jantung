/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_344910478");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = 'dosen'",
    "deleteRule": "@request.auth.role = 'dosen'",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number1799395424",
        "max": null,
        "min": null,
        "name": "id_lokal",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json988117908",
        "maxSize": 10000,
        "name": "pertemuan_terkait",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text2566981307",
        "max": 4000,
        "min": 0,
        "name": "pertanyaan",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text941749242",
        "max": 8000,
        "min": 0,
        "name": "jawaban_model",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json1550413103",
        "maxSize": 40000,
        "name": "checklist",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_344910478",
    "indexes": [
      "CREATE UNIQUE INDEX idx_esai_id_lokal ON esai (id_lokal)"
    ],
    "listRule": "@request.auth.id != ''",
    "name": "esai",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = 'dosen'",
    "viewRule": "@request.auth.id != ''"
  });

  return app.save(collection);
})
