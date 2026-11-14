import { useEffect } from "react";

// Warns before the tab is closed while an editor has unsaved changes.
export function useUnsavedChanges(isDirty) {
  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}
