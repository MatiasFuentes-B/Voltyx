// Carga datos de ejemplo para poder probar la app de inmediato.
// Uso: npm run seed
const db = require('./index');

const insertCategoria = db.prepare('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)');
const insertProveedor = db.prepare('INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES (?, ?, ?, ?)');
const insertProducto = db.prepare(`INSERT INTO productos
  (nombre, descripcion, codigo, categoria_id, precio_compra, precio_venta, stock_actual, stock_minimo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
const insertMovimiento = db.prepare(`INSERT INTO movimientos (producto_id, tipo, cantidad, motivo) VALUES (?, ?, ?, ?)`);

const seed = db.transaction(() => {
  db.exec('DELETE FROM detalle_compra; DELETE FROM compras; DELETE FROM movimientos; DELETE FROM productos; DELETE FROM proveedores; DELETE FROM categorias;');

  const catFerreteria = insertCategoria.run('Ferreteria', 'Herramientas y materiales').lastInsertRowid;
  const catAseo = insertCategoria.run('Aseo', 'Productos de limpieza').lastInsertRowid;
  const catElectrico = insertCategoria.run('Electrico', 'Material electrico').lastInsertRowid;

  const provA = insertProveedor.run('Distribuidora Andes Ltda.', 'Juan Perez', '+56 9 1234 5678', 'ventas@andes.cl').lastInsertRowid;
  const provB = insertProveedor.run('Comercial Sur SpA', 'Maria Soto', '+56 9 8765 4321', 'contacto@comercialsur.cl').lastInsertRowid;

  const productos = [
    ['Martillo carpintero 16oz', 'Mango de fibra de vidrio', 'FER-001', catFerreteria, 4500, 7990, 12, 5],
    ['Set de destornilladores (6 pzs)', 'Planos y cruz', 'FER-002', catFerreteria, 3200, 5990, 4, 6],
    ['Cinta metrica 5m', 'Con freno y clip', 'FER-003', catFerreteria, 1500, 2990, 20, 8],
    ['Detergente multiuso 1L', 'Aroma limon', 'ASE-001', catAseo, 900, 1790, 30, 10],
    ['Guantes de latex (100u)', 'Talla M', 'ASE-002', catAseo, 3500, 5990, 3, 5],
    ['Cable electrico 2.5mm (rollo 20m)', 'Uso residencial', 'ELE-001', catElectrico, 8000, 13990, 2, 4],
    ['Enchufe doble', 'Blanco, empotrable', 'ELE-002', catElectrico, 900, 1990, 15, 6],
  ];

  for (const p of productos) {
    const id = insertProducto.run(...p).lastInsertRowid;
    insertMovimiento.run(id, 'entrada', p[6], 'Stock inicial');
  }

  console.log('Datos de ejemplo cargados: 3 categorias, 2 proveedores, 7 productos.');
});

seed();
