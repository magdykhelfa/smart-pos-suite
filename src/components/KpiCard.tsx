import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

const KpiCard = ({ title, value, change, changeType = "neutral", icon: Icon, iconColor, delay = 0 }: KpiCardProps) => {
  return (
    <div
      className="glass-card kpi-glow rounded-xl p-5 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-card-foreground animate-count-up">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            iconColor || "bg-primary/10 text-primary"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
