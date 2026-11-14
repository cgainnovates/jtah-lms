import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import Modal from "./Modal.jsx";
import s from "./adminUi.module.css";

// Confirmation before any destructive or sensitive operation.
// `onConfirm` may be async; the dialog shows a busy state and stays open if it throws.
export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger = true, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => {} : onCancel}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="button" className={`btn ${danger ? "btn-danger" : ""}`} onClick={handleConfirm} disabled={busy}>
          {busy ? "Working…" : confirmLabel}
        </button>
      </>}
    >
      <div className={s.confirmIcon}><TriangleAlert size={22} /></div>
      <p>{message}</p>
    </Modal>
  );
}
