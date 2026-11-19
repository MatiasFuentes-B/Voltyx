// Medidor visual de la Barraaa
export default function StockGauge({ actual, minimo }) {
  const pct = minimo > 0 ? Math.min(100, Math.round((actual / (minimo * 2 || 1)) * 100)) : 100;

  let cls = 'ok';
  if (actual <= minimo) cls = 'crit';
  else if (actual <= minimo * 1.5) cls = 'low';

  return (
    <div className="stock-gauge">
      <span className="mono">{actual}</span>
      <div className="bar">
        <div className={`fill ${cls}`} style={{ width: `${pct}%` }}></div>
      </div>
      <span className="dim mono" style={{ fontSize: '11px' }}>
        min {minimo}
      </span>
    </div>
  );
}