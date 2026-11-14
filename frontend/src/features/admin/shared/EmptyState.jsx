import s from "./adminUi.module.css";

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className={s.empty}>
      {Icon && <div className={s.emptyIcon}><Icon size={24} /></div>}
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
