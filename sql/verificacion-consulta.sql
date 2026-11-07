-- verificacion de consulta de mysql workbench

USE crud_dual;
SHOW TABLES;
DESCRIBE items;
SELECT id, nombre, cantidad, activo, createdAt, updatedAt FROM items ORDER BY createdAt DESC;
SELECT COUNT(*) AS total_items FROM items;