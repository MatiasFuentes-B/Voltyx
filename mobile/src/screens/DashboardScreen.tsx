import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { voltyxApi } from '../service/voltyxApi';
import { StateBanner } from '../components/StateBanner';

type Alerta = { id: number; nombre: string; codigo: string; stock_actual: number; stock_minimo: number };
type Movimiento = { id: number; producto_nombre: string; tipo: string; cantidad: number; fecha: string };
type DashboardData = {
  total_productos: number;
  productos_bajo_stock: number;
  valor_inventario: number;
  compras_mes_total: number;
  alertas_reposicion: Alerta[];
  ultimos_movimientos: Movimiento[];
};

const clp = (n: number) => `$${Number(n ?? 0).toLocaleString('es-CL')}`;

const Card = ({ label, value, danger, money }: { label: string; value: number; danger?: boolean; money?: boolean }) => (
  <View style={[styles.card, danger && styles.cardDanger]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, danger && { color: '#ef4444' }, money && { color: '#facc15' }]}>
      {money ? clp(value) : value}
    </Text>
  </View>
);

export function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await voltyxApi.getDashboard();
      setData(res as unknown as DashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={styles.title}>DASHBOARD</Text>
      <StateBanner loading={loading} error={error} onRetry={load} emptyMessage={!loading && !error && !data ? 'Sin datos' : undefined} />

      {data && (
        <>
          <View style={styles.grid}>
            <Card label="PRODUCTOS ACTIVOS" value={data.total_productos} />
            <Card label="BAJO STOCK MÍNIMO" value={data.productos_bajo_stock} danger />
            <Card label="VALOR DE INVENTARIO" value={data.valor_inventario} money />
            <Card label="COMPRAS ESTE MES" value={data.compras_mes_total} money />
          </View>

          <Text style={styles.section}>Alertas de reposición</Text>
          {data.alertas_reposicion?.map((p) => {
            const pct = Math.min(100, (p.stock_actual / p.stock_minimo) * 100);
            return (
              <View key={p.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{p.nombre}</Text>
                  <Text style={styles.sub}>Código {p.codigo}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.stock}>{p.stock_actual}</Text>
                  <Text style={styles.sub}>min {p.stock_minimo}</Text>
                </View>
              </View>
            );
          })}

          <Text style={styles.section}>Últimos movimientos</Text>
          {data.ultimos_movimientos?.map((m) => (
            <View key={m.id} style={styles.row}>
              <Text style={[styles.name, { flex: 1 }]}>{m.producto_nombre}</Text>
              <Text style={[styles.badge, m.tipo !== 'entrada' && { backgroundColor: '#ef4444' }]}>{m.tipo}</Text>
              <Text style={styles.qty}>{m.cantidad}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  card: { width: '48%', backgroundColor: '#1e1e1e', padding: 14, borderRadius: 12 },
  cardDanger: { borderWidth: 1, borderColor: '#ef4444' },
  label: { fontSize: 11, color: '#bbb', letterSpacing: 1 },
  value: { fontSize: 24, fontWeight: 'bold', color: '#f39c12', marginTop: 6 },
  section: { color: '#facc15', fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', padding: 12, borderRadius: 10, marginBottom: 6, gap: 8 },
  name: { color: '#fff', fontSize: 14 },
  sub: { color: '#888', fontSize: 12 },
  stock: { color: '#f97316', fontWeight: '700', fontSize: 18 },
  barBg: { height: 6, backgroundColor: '#333', borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: '#f97316', borderRadius: 3 },
  badge: { color: '#fff', backgroundColor: '#3b82f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, fontSize: 12, overflow: 'hidden' },
  qty: { color: '#fff', fontWeight: '700', width: 36, textAlign: 'right' },
});