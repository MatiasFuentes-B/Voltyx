const database = db.getSiblingDB('voltyx');

print('Colecciones de Voltyx:');
printjson(database.getCollectionNames());
print('Eventos de inventario:');
printjson(
    database.eventoinventarios.find().sort({ createdAt: -1 }).limit(20).toArray()
);

print('Cantidad total de eventos:');
print(database.eventoinventarios.countDocuments({}));
