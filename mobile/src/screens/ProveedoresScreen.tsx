import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { voltyxApi } from '../service/voltyxApi';
import { StateBanner } from '../components/StateBanner';

export function ProveedoresScreen({ navigation }: any) {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await voltyxApi.getProveedores();
      setProveedores(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar /proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('NuevoProveedor')}>
        <Text style={styles.btnText}>+ Nuevo Proveedor</Text>
      </TouchableOpacity>

      <StateBanner
        loading={loading}
        error={error}
        onRetry={load}
        emptyMessage={!loading && !error && proveedores.length === 0 ? 'No hay proveedores registrados' : null}
      />

      <FlatList
        data={proveedores}
        keyExtractor={(item, idx) => String(item.id ?? item._id ?? idx)}
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.nombreEmpresa ?? item.nombre}</Text>
            {item.contacto ? <Text style={styles.sub}>Contacto: {item.contacto}</Text> : null}
            {item.telefono ? <Text style={styles.sub}>Tel: {item.telefono}</Text> : null}
            {item.email ? <Text style={styles.sub}>Email: {item.email}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  btn: { backgroundColor: '#f39c12', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  card: { backgroundColor: '#1e1e1e', padding: 14, borderRadius: 8, marginBottom: 10 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sub: { color: '#bbb', fontSize: 12, marginTop: 3 },
});