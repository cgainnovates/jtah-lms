import { useId } from "react";
import s from "./adminUi.module.css";

// Label + control + hint/error wrapper. The render prop hands the generated id and
// accessibility attributes to whichever control is used (input, select, textarea).
export default function Field({ label, hint, error, required, className = "", children }) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`${s.fieldWrap} ${className}`}>
      <label className={s.label} htmlFor={id}>{label}{required && <span className={s.req} aria-hidden="true">*</span>}</label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, className: `field ${error ? s.invalid : ""}` })}
      {hint && !error && <span id={`${id}-hint`} className={s.hint}>{hint}</span>}
      {error && <span id={`${id}-err`} className={s.error} role="alert">{error}</span>}
    </div>
  );
}
