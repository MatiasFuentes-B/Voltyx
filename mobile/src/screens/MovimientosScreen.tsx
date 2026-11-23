import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { voltyxApi } from '../service/voltyxApi';
import { StateBanner } from '../components/StateBanner';

export function MovimientosScreen() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [tipo, setTipo] = useState('ENTRADA');
  const [cantidad, setCantidad] = useState('1');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [productoId, setProductoId] = useState<number | undefined>(undefined);

useEffect(() => {
  voltyxApi.getProductos().then(setProductos).catch(() => setProductos([]));
}, []);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await voltyxApi.getMovimientos();
      setMovimientos(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar /movimientos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    setError(null);
    setConfirmation(null);
    const cant = Number(cantidad);
    if (!tipo.trim() || Number.isNaN(cant) || cant <= 0) {
      setError('Ingresa un tipo y una cantidad mayor a 0.');
      return;
    }

    try {
      await voltyxApi.createMovimiento({
      tipo: tipo.trim().toLowerCase(),
      cantidad: Number(cantidad),
     producto_id: Number(productoId),
     motivo: motivo.trim() || undefined,
  });
      setMotivo('');
      setConfirmation('Movimiento registrado.');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar movimiento');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movimientos de Inventario</Text>
      <StateBanner
        loading={loading}
        error={error}
        confirmation={confirmation}
        onRetry={load}
        emptyMessage={!loading && !error && movimientos.length === 0 ? 'Sin movimientos registrados' : null}
      />

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={tipo}
          onChangeText={setTipo}
          placeholder="ENTRADA / SALIDA"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
          placeholder="Cantidad"
          placeholderTextColor="#666"
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
  {productos.map((p) => {
    const activo = productoId === p.id;
    return (
      <TouchableOpacity
        key={p.id}
        onPress={() => setProductoId(p.id)}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: activo ? '#f39c12' : '#1e1e1e',
        }}
      >
        <Text style={{ color: activo ? '#000' : '#fff' }}>{p.nombre}</Text>
      </TouchableOpacity>
    );
  })}
</View>
        <TextInput
          style={styles.input}
          value={motivo}
          onChangeText={setMotivo}
          placeholder="Motivo"
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.btn} onPress={submit}>
          <Text style={styles.btnText}>Registrar Movimiento</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={movimientos}
        keyExtractor={(item, idx) => String(item.id ?? item._id ?? idx)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.tipo ?? 'MOVIMIENTO'} · Cant: {item.cantidad ?? 0}
            </Text>
            {item.motivo ? <Text style={styles.cardSub}>{item.motivo}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  form: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, marginBottom: 12 },
  input: { backgroundColor: '#252525', color: '#fff', borderRadius: 6, padding: 10, marginBottom: 8 },
  btn: { backgroundColor: '#f39c12', padding: 12, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold' },
  card: { backgroundColor: '#1e1e1e', padding: 12, borderRadius: 8, marginBottom: 8 },
  cardTitle: { color: '#fff', fontWeight: 'bold' },
  cardSub: { color: '#aaa', fontSize: 12, marginTop: 2 },
});