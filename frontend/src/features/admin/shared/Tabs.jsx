import s from "./adminUi.module.css";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className={s.tabs} role="tablist">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" role="tab" aria-selected={active === tab.id}
          className={`${s.tab} ${active === tab.id ? s.tabActive : ""}`} onClick={() => onChange(tab.id)}>
          {tab.icon && <tab.icon size={16} />}{tab.label}
        </button>
      ))}
    </div>
  );
}
