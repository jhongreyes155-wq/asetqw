import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor?: string;
  testId?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor = "text-primary", testId }: StatsCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-semibold" data-testid={`${testId}-value`}>{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
