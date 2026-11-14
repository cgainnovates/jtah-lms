import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { formatBytes } from "../../../utils/format.js";
import s from "./adminUi.module.css";

// Straightforward file selection: click to browse, or drag a file onto the area.
export default function FileDrop({ accept, file, onFile, onClear, hint, label = "Choose a file" }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);

  return (
    <div
      className={`${s.drop} ${over ? s.dropActive : ""}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const dropped = e.dataTransfer.files?.[0]; if (dropped) onFile(dropped); }}
    >
      <input ref={input} type="file" accept={accept} hidden onChange={(e) => { const picked = e.target.files?.[0]; if (picked) onFile(picked); e.target.value = ""; }} />
      {file ? (
        <div className={s.dropFile}>
          <strong>{file.fileName || file.name}</strong>
          {file.size ? <span className={s.sub}>{formatBytes(file.size)}</span> : null}
          <button type="button" className="btn btn-ghost" onClick={() => input.current.click()}>Replace</button>
          {onClear && <button type="button" className={s.iconBtn} aria-label="Remove file" onClick={onClear}><X size={16} /></button>}
        </div>
      ) : (
        <>
          <button type="button" className={`btn btn-secondary ${s.btnInline}`} onClick={() => input.current.click()}><Upload size={17} />{label}</button>
          <p className={s.hint} style={{ marginTop: 8 }}>{hint || "or drag and drop it here"}</p>
        </>
      )}
    </div>
  );
}
