import { cn } from "@/lib/utils";

export type MetricStatus = "normal" | "warning" | "critical";

interface MetricBadgeProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: MetricStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusColors: Record<MetricStatus, string> = {
  normal: "border-l-status-normal",
  warning: "border-l-status-warning",
  critical: "border-l-status-critical",
};

export function MetricBadge({
  label,
  value,
  unit = "",
  status = "normal",
  className,
  size = "md",
}: MetricBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1.5",
    md: "px-3 py-2",
    lg: "px-4 py-3",
  };

  const valueSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  const labelSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-metric-border shadow-metric",
        "border-l-4 backdrop-blur-sm",
        "transition-all duration-200 hover:shadow-lg hover:scale-105",
        sizeClasses[size],
        statusColors[status],
        className
      )}
    >
      <p className={cn("font-medium text-metric-label uppercase tracking-wide mb-0.5", labelSizeClasses[size])}>
        {label}
      </p>
      <p className={cn("font-bold text-metric-value", valueSizeClasses[size])}>
        {value}
        {unit && <span className="text-metric-label font-medium ml-1">{unit}</span>}
      </p>
    </div>
  );
}
