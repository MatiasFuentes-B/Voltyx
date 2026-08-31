const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { q } = req.query;
  let rows;
  if (q) {
    rows = db.prepare('SELECT * FROM proveedores WHERE nombre LIKE ? ORDER BY nombre').all(`%${q}%`);
  } else {
    rows = db.prepare('SELECT * FROM proveedores ORDER BY nombre').all();
  }
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM proveedores WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Proveedor no encontrado' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { nombre, contacto, telefono, email, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
  const info = db.prepare(
    'INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)'
  ).run(nombre, contacto || null, telefono || null, email || null, direccion || null);
  res.status(201).json(db.prepare('SELECT * FROM proveedores WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const { nombre, contacto, telefono, email, direccion } = req.body;
  const info = db.prepare(
    'UPDATE proveedores SET nombre=?, contacto=?, telefono=?, email=?, direccion=? WHERE id=?'
  ).run(nombre, contacto || null, telefono || null, email || null, direccion || null, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
  res.json(db.prepare('SELECT * FROM proveedores WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM proveedores WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
  res.status(204).end();
});

module.exports = router;
