import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import s from "./adminUi.module.css";

export default function PageHeader({ eyebrow = "Administration", title, description, actions, backTo, backLabel = "Back" }) {
  return (
    <>
      {backTo && <Link to={backTo} className={s.back}><ArrowLeft size={16} />{backLabel}</Link>}
      <header className={s.header}>
        <div className={s.headerText}>
          <div className={s.eyebrow}>{eyebrow}</div>
          <h1 className={s.title}>{title}</h1>
          {description && <p className={s.lead}>{description}</p>}
        </div>
        {actions && <div className={s.actions}>{actions}</div>}
      </header>
    </>
  );
}
