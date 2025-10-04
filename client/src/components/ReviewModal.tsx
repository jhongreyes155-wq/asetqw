import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { StatusBadge, type LabStatus } from "./StatusBadge";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  lab: {
    id: string;
    title: string;
    description: string;
    authorName: string;
    status: LabStatus;
  } | null;
  onApprove: (labId: string, comment: string) => void;
  onReject: (labId: string, comment: string) => void;
}

export function ReviewModal({ 
  open, 
  onClose, 
  lab,
  onApprove,
  onReject 
}: ReviewModalProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!lab) return;
    setIsSubmitting(true);
    await onApprove(lab.id, comment);
    setIsSubmitting(false);
    setComment("");
    onClose();
  };

  const handleReject = async () => {
    if (!lab) return;
    setIsSubmitting(true);
    await onReject(lab.id, comment);
    setIsSubmitting(false);
    setComment("");
    onClose();
  };

  if (!lab) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-review">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3" data-testid="text-modal-title">
            {lab.title}
            <StatusBadge status={lab.status} />
          </DialogTitle>
          <DialogDescription data-testid="text-modal-author">
            Submitted by {lab.authorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground" data-testid="text-modal-description">
              {lab.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Review Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add feedback or notes for the author..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-24"
              data-testid="input-review-comment"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            data-testid="button-cancel-review"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting}
            data-testid="button-reject"
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-status-approved hover:bg-status-approved/90"
            data-testid="button-approve"
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
