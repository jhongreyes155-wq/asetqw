import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge, type LabStatus } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";

interface Lab {
  id: string;
  title: string;
  authorName: string;
  submittedAt: Date;
  status: LabStatus;
  tags: string[];
}

interface ReviewQueueTableProps {
  labs: Lab[];
  onReview: (labId: string) => void;
}

export function ReviewQueueTable({ labs, onReview }: ReviewQueueTableProps) {
  if (labs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No pending labs</h3>
        <p className="text-sm text-muted-foreground">
          All labs have been reviewed. Check back later for new submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labs.map((lab) => (
            <TableRow 
              key={lab.id} 
              className="hover-elevate"
              data-testid={`row-lab-${lab.id}`}
            >
              <TableCell className="font-medium" data-testid={`text-title-${lab.id}`}>
                {lab.title}
              </TableCell>
              <TableCell data-testid={`text-author-${lab.id}`}>{lab.authorName}</TableCell>
              <TableCell data-testid={`text-date-${lab.id}`}>
                {formatDistanceToNow(lab.submittedAt, { addSuffix: true })}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {lab.tags.slice(0, 2).map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 bg-muted rounded text-xs"
                      data-testid={`tag-${tag}-${lab.id}`}
                    >
                      {tag}
                    </span>
                  ))}
                  {lab.tags.length > 2 && (
                    <span className="px-2 py-0.5 text-xs text-muted-foreground">
                      +{lab.tags.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onReview(lab.id)}
                  data-testid={`button-review-${lab.id}`}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
