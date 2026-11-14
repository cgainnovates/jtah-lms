import { Search } from "lucide-react";
import s from "./adminUi.module.css";

export default function SearchBox({ value, onChange, placeholder = "Search" }) {
  return (
    <div className={s.searchBox}>
      <Search size={17} />
      <input className="field" type="search" value={value} placeholder={placeholder} aria-label={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
