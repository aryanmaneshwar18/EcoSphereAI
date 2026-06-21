import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColor = "var(--eco-emerald)"
}: EmptyStateProps) {
  return (
    <div className="empty-state-dashed p-10 flex flex-col items-center justify-center text-center w-full min-h-[300px]">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4" 
        style={{ background: "rgba(255, 255, 255, 0.05)" }}
      >
        <Icon className="w-8 h-8" style={{ color: iconColor }} />
      </div>
      <h4 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
        {title}
      </h4>
      <p className="text-sm max-w-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary flex items-center gap-2">
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
