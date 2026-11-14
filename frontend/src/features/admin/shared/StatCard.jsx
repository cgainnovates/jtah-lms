import s from "./adminUi.module.css";

export default function StatCard({ icon: Icon, label, value, delay = 0 }) {
  return (
    <div className={`${s.card} ${s.stat}`} style={{ animationDelay: `${delay}ms` }}>
      <div className={s.statIcon}><Icon size={20} /></div>
      <div><div className={s.statValue}>{value}</div><div className={s.statLabel}>{label}</div></div>
    </div>
  );
}
