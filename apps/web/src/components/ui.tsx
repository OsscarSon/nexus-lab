import { useId, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./icon";
export function PageIntro({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
      {action}
    </div>
  );
}
export function SectionTitle({
  title,
  to,
  label = "查看全部",
}: {
  title: string;
  to?: string;
  label?: string;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {to && (
        <Link className="text-link" to={to}>
          {label}
          <Icon name="arrow" size={16} />
        </Link>
      )}
    </div>
  );
}
export function Badge({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <span className={"badge" + (muted ? " muted" : "")}>
      {!muted && <span className="badge-dot" />}
      {children}
    </span>
  );
}
export function ProgressBar({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label: string;
}) {
  return (
    <div className="progress-block">
      <div className="progress-caption">
        <span>{label}</span>
        <span>
          {value} / {total}
        </span>
      </div>
      <progress aria-label={label} max={Math.max(1, total)} value={value} />
    </div>
  );
}
export function EmptyState({
  title,
  children,
  to,
  label = "探索学习方向",
}: {
  title: string;
  children: ReactNode;
  to: string;
  label?: string;
}) {
  return (
    <div className="empty-state card">
      <span className="empty-icon">
        <Icon name="compass" size={32} />
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      <Link className="button" to={to}>
        {label}
        <Icon name="arrow" size={18} />
      </Link>
    </div>
  );
}
export type Panel = { id: string; label: string; children: ReactNode };
export function WorkspacePanels({
  panels,
  active,
  onSelect,
  variant = "",
}: {
  panels: Panel[];
  active: string;
  onSelect: (id: string) => void;
  variant?: string;
}) {
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className={"workspace-panels " + variant}>
      <div className="panel-tabs" role="tablist" aria-label="工作区面板">
        {panels.map((p, i) => (
          <button
            key={p.id}
            type="button"
            ref={(node) => {
              refs.current[i] = node;
            }}
            role="tab"
            id={uid + "-tab-" + p.id}
            aria-selected={active === p.id}
            aria-controls={uid + "-panel-" + p.id}
            tabIndex={active === p.id ? 0 : -1}
            onClick={() => onSelect(p.id)}
            onKeyDown={(e) => {
              let next = i;
              if (e.key === "ArrowRight") next = (i + 1) % panels.length;
              else if (e.key === "ArrowLeft")
                next = (i + panels.length - 1) % panels.length;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = panels.length - 1;
              else return;
              e.preventDefault();
              onSelect(panels[next].id);
              refs.current[next]?.focus();
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="panel-grid">
        {panels.map((p) => (
          <section
            key={p.id}
            className={
              "workspace-panel panel-" +
              p.id +
              (active === p.id ? " is-active" : "")
            }
            role="tabpanel"
            id={uid + "-panel-" + p.id}
            aria-labelledby={uid + "-tab-" + p.id}
            tabIndex={0}
          >
            {p.children}
          </section>
        ))}
      </div>
    </div>
  );
}
