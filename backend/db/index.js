const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'inventario.sqlite');
const isNew = !fs.existsSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// Aplica el esquema siempre (CREATE TABLE IF NOT EXISTS es seguro de re-ejecutar)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

if (isNew) {
  console.log('Base de datos creada en', DB_PATH);
}

module.exports = db;
