import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CircleCheck, TriangleAlert, X } from "lucide-react";
import s from "./adminUi.module.css";

const ToastContext = createContext(null);

// Success / failure feedback shown after every administrative operation.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const push = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((list) => [...list, { id, type, message }]);
    setTimeout(() => dismiss(id), type === "error" ? 6000 : 3800);
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (message) => push("success", message),
    error: (message) => push("error", message),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={s.toastStack} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${s.toast} ${t.type === "error" ? s.toastError : ""}`}>
            {t.type === "error" ? <TriangleAlert size={18} /> : <CircleCheck size={18} />}
            <span>{t.message}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => dismiss(t.id)}><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
