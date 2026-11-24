import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { voltyxApi } from '../service/voltyxApi';
import { StateBanner } from '../components/StateBanner';


export function ProveedoresScreen({ navigation }: any) {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

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

const removeProveedor = (id: string | number, nombre: string) => {
  Alert.alert(
    'Eliminar proveedor',
    `¿Estás seguro de que deseas eliminar a "${nombre}"?`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setError(null);

            await voltyxApi.deleteProveedor(id);

            setConfirmation(`Proveedor "${nombre}" eliminado correctamente.`);

            await load();
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : 'No se pudo eliminar el proveedor'
            );
          }
        },
      },
    ]
  );
};

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('NuevoProveedor')}>
        <Text style={styles.btnText}>+ Nuevo Proveedor</Text>
      </TouchableOpacity>

      <StateBanner
        loading={loading}
        error={error}
         confirmation={confirmation}
        onRetry={load}
        emptyMessage={!loading && !error && proveedores.length === 0 ? 'No hay proveedores registrados' : null}
      />

      <FlatList
        data={proveedores}
        keyExtractor={(item, idx) => String(item.id ?? item._id ?? idx)}
        refreshing={loading}
        onRefresh={load}
        
renderItem={({ item }) => {
  const id = item.id ?? item._id ?? item.proveedor_id;
  const nombre = item.nombreEmpresa ?? item.nombre ?? 'Proveedor';

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{nombre}</Text>

        <Text style={styles.sub}>Contacto: {item.contacto || '—'}</Text>
        <Text style={styles.sub}>Tel: {item.telefono || '—'}</Text>
        <Text style={styles.sub}>Email: {item.email || '—'}</Text>
        <Text style={styles.sub}>Dirección: {item.direccion || '—'}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        disabled={!id}
        onPress={() => removeProveedor(id, nombre)}
      >
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
  card: { backgroundColor: '#1e1e1e', padding: 14, borderRadius: 8, marginBottom: 10 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sub: { color: '#bbb', fontSize: 12, marginTop: 3 },
  info: {flex: 1,},
  deleteBtn: {paddingLeft: 10,paddingVertical: 8,},
  del: { color: '#e74c3c',fontWeight: 'bold', fontSize: 13 },
});