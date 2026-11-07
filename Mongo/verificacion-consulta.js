// Script de inspección para MongoDB Compass o mongosh
const database = db.getSiblingDB('crud_dual');
print('Colecciones de crud_dual:');
printjson(database.getCollectionNames());
print('Documentos de items:');
printjson(database.items.find({}, { nombre: 1, cantidad: 1, activo: 1 }).toArray());
print('Cantidad de documentos:');
print(database.items.countDocuments({})); 