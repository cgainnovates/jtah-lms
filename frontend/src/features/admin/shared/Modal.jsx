import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import s from "./adminUi.module.css";

// Accessible dialog: closes on Escape / backdrop click, locks page scroll,
// moves focus inside on open and returns it to the trigger on close.
export default function Modal({ open, title, onClose, children, footer, wide = false }) {
  const panel = useRef(null);
  // Keep the latest onClose in a ref so inline callbacks do not re-run the effect (which would steal focus while typing).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (event) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "Tab" && panel.current) {
        // Simple focus trap: keep Tab inside the dialog.
        const items = panel.current.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const firstField = panel.current?.querySelector("input, select, textarea");
    (firstField || panel.current)?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className={s.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panel} className={`${s.modal} ${wide ? s.modalWide : ""}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <div className={s.modalHead}>
          <h2>{title}</h2>
          <button type="button" className={s.iconBtn} aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        </div>
        <div className={s.modalBody}>{children}</div>
        {footer && <div className={s.modalFoot}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
