import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type LabStatus } from "./StatusBadge";
import { Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LabCardProps {
  id: string;
  title: string;
  description: string;
  status: LabStatus;
  authorName: string;
  updatedAt: Date;
  onEdit?: () => void;
  onSubmit?: () => void;
  onView?: () => void;
}

export function LabCard({ 
  id, 
  title, 
  description, 
  status, 
  authorName, 
  updatedAt,
  onEdit,
  onSubmit,
  onView 
}: LabCardProps) {
  return (
    <Card 
      className={`border-l-4 ${
        status === 'draft' ? 'border-l-status-draft' : 
        status === 'pending' ? 'border-l-status-pending' : 
        status === 'approved' ? 'border-l-status-approved' : 
        'border-l-status-rejected'
      }`}
      data-testid={`card-lab-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-lg leading-tight" data-testid={`text-lab-title-${id}`}>{title}</h3>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-lab-description-${id}`}>
          {description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1" data-testid={`text-lab-author-${id}`}>
            <User className="h-3 w-3" />
            {authorName}
          </span>
          <span className="flex items-center gap-1" data-testid={`text-lab-date-${id}`}>
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(updatedAt, { addSuffix: true })}
          </span>
        </div>
        <div className="flex gap-2">
          {status === 'draft' && onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onEdit}
              data-testid={`button-edit-${id}`}
            >
              Edit
            </Button>
          )}
          {status === 'draft' && onSubmit && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onSubmit}
              data-testid={`button-submit-${id}`}
            >
              Submit for Review
            </Button>
          )}
          {onView && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onView}
              data-testid={`button-view-${id}`}
            >
              View
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
