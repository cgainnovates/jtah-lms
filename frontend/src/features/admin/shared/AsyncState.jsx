import { TriangleAlert } from "lucide-react";
import s from "./adminUi.module.css";

export function SkeletonRows({ rows = 5 }) {
  return <div aria-busy="true" aria-label="Loading">{Array.from({ length: rows }, (_, i) => <div key={i} className={`skeleton ${s.skelRow}`} style={{ width: `${95 - (i % 3) * 12}%` }} />)}</div>;
}

export function SkeletonCards({ count = 4 }) {
  return <div className={s.statGrid} aria-busy="true" aria-label="Loading">{Array.from({ length: count }, (_, i) => <div key={i} className="skeleton skeleton-stat" />)}</div>;
}

// Shown when a request fails. The retry button re-runs the page's loader.
export function ErrorState({ error, onRetry }) {
  return (
    <div className={s.errorBox} role="alert">
      <TriangleAlert size={20} />
      <span>{error?.message || "Something went wrong while loading this page."}</span>
      {onRetry && <button type="button" className="btn btn-ghost" onClick={onRetry}>Try again</button>}
    </div>
  );
}
