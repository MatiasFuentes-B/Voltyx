import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { voltyxApi } from '../service/voltyxApi';
import { StateBanner } from '../components/StateBanner';

export function ProductosScreen({ navigation }: any) {
  const [productos, setProductos] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await voltyxApi.getProductos();
      setProductos(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar /productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const removeItem = (id: string | number, nombre: string) => {
    Alert.alert('Eliminar producto', `¿Eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await voltyxApi.deleteProducto(id);
            setConfirmation(`Producto "${nombre}" eliminado.`);
            load();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const filtered = productos.filter(
    (p) =>
      String(p.nombre ?? '').toLowerCase().includes(query.trim().toLowerCase()) ||
      String(p.sku ?? '').toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('NuevoProducto')}>
        <Text style={styles.btnText}>+ Nuevo Producto</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o SKU..."
        placeholderTextColor="#777"
        value={query}
        onChangeText={setQuery}
      />

      <StateBanner
        loading={loading}
        error={error}
        confirmation={confirmation}
        onRetry={load}
        emptyMessage={!loading && !error && filtered.length === 0 ? 'No hay productos registrados' : null}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => String(item.id ?? item._id ?? idx)}
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => {
          const id = item.id ?? item._id;
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nombre}</Text>
                <Text style={styles.meta}>
                  SKU: {item.sku || '—'} · Stock: {item.stockInicial ?? item.stock ?? 0}
                </Text>
                <Text style={styles.price}>Venta: ${item.precioVenta ?? 0}</Text>
              </View>
              <TouchableOpacity onPress={() => removeItem(id, item.nombre)}>
                <Text style={styles.del}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  btn: { backgroundColor: '#f39c12', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 12 },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  meta: { color: '#aaa', fontSize: 12, marginTop: 2 },
  price: { color: '#f39c12', fontSize: 13, marginTop: 4 },
  del: { color: '#e74c3c', fontWeight: 'bold', paddingLeft: 10 },
});