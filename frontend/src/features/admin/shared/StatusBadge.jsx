import s from "./adminUi.module.css";

// One place that decides the colour of every status word used across the admin area.
const tones = {
  published: "toneGreen", active: "toneGreen", completed: "toneGreen",
  draft: "toneGold", pending: "toneGold",
  archived: "toneGrey", inactive: "toneGrey", hidden: "toneGrey",
};

export default function StatusBadge({ status = "published", label }) {
  const key = String(status).toLowerCase();
  return <span className={`${s.badge} ${s[tones[key]] || ""}`}>{label || key.charAt(0).toUpperCase() + key.slice(1)}</span>;
}
