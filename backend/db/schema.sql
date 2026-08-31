-- Esquema de base de datos: Inventario + Compras para pequenos negocios
-- Motor: SQLite (facil de correr sin instalar un servidor de BD aparte)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categorias (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL UNIQUE,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS proveedores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL,
  contacto    TEXT,
  telefono    TEXT,
  email       TEXT,
  direccion   TEXT,
  creado_en   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS productos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  codigo          TEXT UNIQUE,              -- codigo interno / para lectura QR o barras
  categoria_id    INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  precio_compra   REAL NOT NULL DEFAULT 0,
  precio_venta    REAL NOT NULL DEFAULT 0,
  stock_actual    INTEGER NOT NULL DEFAULT 0,
  stock_minimo    INTEGER NOT NULL DEFAULT 0,
  activo          INTEGER NOT NULL DEFAULT 1,
  creado_en       TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS compras (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  proveedor_id  INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
  fecha         TEXT DEFAULT (datetime('now')),
  estado        TEXT NOT NULL DEFAULT 'recibida', -- pendiente | recibida | anulada
  total         REAL NOT NULL DEFAULT 0,
  nota          TEXT
);

CREATE TABLE IF NOT EXISTS detalle_compra (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  compra_id       INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  producto_id     INTEGER NOT NULL REFERENCES productos(id),
  cantidad        INTEGER NOT NULL,
  precio_unitario REAL NOT NULL,
  subtotal        REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS movimientos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id   INTEGER NOT NULL REFERENCES productos(id),
  tipo          TEXT NOT NULL,          -- entrada | salida | ajuste
  cantidad      INTEGER NOT NULL,
  motivo        TEXT,                   -- ej: "Compra #12", "Venta", "Merma", "Ajuste manual"
  referencia_id INTEGER,                -- id de la compra u otra operacion relacionada
  fecha         TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_detalle_compra_compra ON detalle_compra(compra_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos(producto_id);
