-- Base de datos de Voltyx
USE voltyx;

-- 1. Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT
) ENGINE=InnoDB;

-- 2. Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contacto VARCHAR(255),
    telefono VARCHAR(255),
    email VARCHAR(255),
    direccion TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    codigo VARCHAR(255) UNIQUE,
    categoria_id INT,
    precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Compras
CREATE TABLE IF NOT EXISTS compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL DEFAULT 'recibida',
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    nota TEXT,

    CONSTRAINT fk_compras_proveedor
        FOREIGN KEY (proveedor_id)
        REFERENCES proveedores(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Detalle de compras
CREATE TABLE IF NOT EXISTS detalle_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_detalle_compra
        FOREIGN KEY (compra_id)
        REFERENCES compras(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id)
) ENGINE=InnoDB;

-- 6. Movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL,
    motivo TEXT,
    referencia_id INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimientos_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id)
) ENGINE=InnoDB;

-- Indices para consultas frecuentes
CREATE INDEX idx_productos_categoria
    ON productos(categoria_id);

CREATE INDEX idx_detalle_compra_compra
    ON detalle_compra(compra_id);

CREATE INDEX idx_movimientos_producto
    ON movimientos(producto_id);
