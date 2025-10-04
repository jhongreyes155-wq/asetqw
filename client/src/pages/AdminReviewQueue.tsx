
import { useState, useEffect } from "react";
import { ReviewQueueTable } from "@/components/ReviewQueueTable";
import { ReviewModal } from "@/components/ReviewModal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Lab } from "@shared/schema";

export default function AdminReviewQueue() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingLabs();
  }, []);

  const loadPendingLabs = async () => {
    try {
      setLoading(true);
      const data = await api.getLabsByStatus("pending");
      setLabs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending labs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (labId: string) => {
    const lab = labs.find(l => l.id.toString() === labId);
    if (lab) {
      setSelectedLab(lab);
      setModalOpen(true);
    }
  };

  const handleApprove = async (labId: string, comment: string) => {
    try {
      await api.approveLab(parseInt(labId), comment);
      setLabs(labs.filter(l => l.id.toString() !== labId));
      setModalOpen(false);
      toast({
        title: "Lab Approved",
        description: "The author has been notified via email.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve lab",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (labId: string, comment: string) => {
    try {
      await api.rejectLab(parseInt(labId), comment);
      setLabs(labs.filter(l => l.id.toString() !== labId));
      setModalOpen(false);
      toast({
        title: "Lab Rejected",
        description: "The author has been notified with your feedback.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject lab",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading pending labs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2" data-testid="text-page-title">Pending Labs</h1>
        <p className="text-muted-foreground">
          Review and approve labs submitted by authors
        </p>
      </div>

      <ReviewQueueTable 
        labs={labs.map(lab => ({
          id: lab.id.toString(),
          title: lab.title,
          authorName: "Author",
          submittedAt: new Date(lab.updatedAt),
          status: lab.status as any,
          tags: lab.tags || [],
        }))} 
        onReview={handleReview} 
      />

      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        lab={selectedLab ? {
          id: selectedLab.id.toString(),
          title: selectedLab.title,
          description: selectedLab.description,
          authorName: "Author",
          status: selectedLab.status as any,
        } : null}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
