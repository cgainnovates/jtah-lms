import s from "../shared/adminUi.module.css";

// Lightweight SVG/CSS charts. No chart library is needed, which keeps the bundle small.
// Each chart carries an aria-label summary so the information is not only visual.

const PALETTE = ["#5B3FA8", "#E8A93B", "#2E9E6B", "#D6578A", "#2E1F5E"];

// Horizontal bars: best for comparing named items (course popularity, pass rates).
export function BarList({ items, format = (v) => v, max }) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className={s.barList} role="list">
      {items.map((item, i) => (
        <div key={item.label} role="listitem">
          <div className={s.barLabel}><span title={item.label}>{item.label}</span><strong>{format(item.value)}</strong></div>
          <div className={s.barTrack}><div className={s.barFill} style={{ width: `${(item.value / top) * 100}%`, background: item.color || PALETTE[i % PALETTE.length], animationDelay: `${i * 70}ms` }} /></div>
        </div>
      ))}
    </div>
  );
}

// Vertical columns: best for values over time (enrolments per month).
export function ColumnChart({ data, valueKey, labelKey = "label", ariaLabel }) {
  const w = 480, h = 200, pad = 28;
  const top = Math.max(1, ...data.map((d) => d[valueKey]));
  const slot = (w - pad) / Math.max(1, data.length);
  return (
    <svg className={s.chartSvg} viewBox={`0 0 ${w} ${h + 24}`} role="img" aria-label={ariaLabel}>
      <line className={s.axis} x1={pad} x2={w} y1={h} y2={h} />
      {data.map((d, i) => {
        const barH = (d[valueKey] / top) * (h - 24);
        const x = pad + i * slot + slot * 0.2;
        return (
          <g key={d[labelKey]}>
            <rect className={s.colRect} x={x} y={h - barH} width={slot * 0.6} height={barH} rx="5" fill="#5B3FA8" style={{ animationDelay: `${i * 60}ms` }} />
            <text className={s.axisText} x={x + slot * 0.3} y={h - barH - 6} textAnchor="middle">{d[valueKey]}</text>
            <text className={s.axisText} x={x + slot * 0.3} y={h + 16} textAnchor="middle">{d[labelKey]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Multi-series line chart for trends (weekly engagement).
export function LineChart({ data, series, labelKey = "label", ariaLabel }) {
  const w = 480, h = 200, pad = 30;
  const top = Math.max(1, ...series.flatMap((x) => data.map((d) => d[x.key])));
  const step = (w - pad) / Math.max(1, data.length - 1);
  const point = (d, key, i) => `${pad + i * step},${h - (d[key] / top) * (h - 20)}`;
  return (
    <>
      <svg className={s.chartSvg} viewBox={`0 0 ${w} ${h + 24}`} role="img" aria-label={ariaLabel}>
        {[0, 0.5, 1].map((f) => <line key={f} className={s.axis} x1={pad} x2={w} y1={h - f * (h - 20)} y2={h - f * (h - 20)} />)}
        {[0, 0.5, 1].map((f) => <text key={f} className={s.axisText} x={0} y={h - f * (h - 20) + 4}>{Math.round(top * f)}</text>)}
        {series.map((x) => <polyline key={x.key} className={s.line} stroke={x.color} points={data.map((d, i) => point(d, x.key, i)).join(" ")} />)}
        {data.map((d, i) => <text key={d[labelKey]} className={s.axisText} x={pad + i * step} y={h + 18} textAnchor="middle">{d[labelKey]}</text>)}
      </svg>
      <div className={s.legend}>{series.map((x) => <span key={x.key}><i style={{ background: x.color }} />{x.label}</span>)}</div>
    </>
  );
}

// Donut for parts of a whole (course status split).
export function DonutChart({ segments, centreLabel, ariaLabel }) {
  const total = segments.reduce((n, seg) => n + seg.value, 0);
  const r = 54, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className={s.donutWrap}>
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label={ariaLabel}>
        <circle cx="75" cy="75" r={r} fill="none" stroke="#F3EEFB" strokeWidth="20" />
        {total > 0 && segments.map((seg) => {
          const len = (seg.value / total) * c;
          const el = <circle key={seg.label} cx="75" cy="75" r={r} fill="none" stroke={seg.color} strokeWidth="20" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 75 75)" />;
          offset += len;
          return el;
        })}
        <text className={s.donutCentre} x="75" y="82" textAnchor="middle">{centreLabel ?? total}</text>
      </svg>
      <div className={s.legend} style={{ flexDirection: "column", marginTop: 0 }}>
        {segments.map((seg) => <span key={seg.label}><i style={{ background: seg.color }} />{seg.label}: <strong>{seg.value}</strong></span>)}
      </div>
    </div>
  );
}

export { PALETTE };
