import { useState } from "react";
import { X } from "lucide-react";
import s from "./adminUi.module.css";

// Type a value and press Enter or comma to add it. Used for professional roles and skills.
export default function TagInput({ value = [], onChange, placeholder = "Type and press Enter", label }) {
  const [draft, setDraft] = useState("");

  function commit() {
    const text = draft.trim();
    if (text && !value.some((v) => v.toLowerCase() === text.toLowerCase())) onChange([...value, text]);
    setDraft("");
  }

  return (
    <div className={s.tagBox}>
      {value.map((tag) => (
        <span className={s.tag} key={tag}>{tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((v) => v !== tag))}><X size={13} /></button>
        </span>
      ))}
      <input
        className={s.tagInput} value={draft} placeholder={value.length ? "" : placeholder} aria-label={label}
        onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
          if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
      />
    </div>
  );
}
