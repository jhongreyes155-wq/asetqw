import { useState } from "react";
import { ReviewQueueTable } from "@/components/ReviewQueueTable";
import { ReviewModal } from "@/components/ReviewModal";
import { useToast } from "@/hooks/use-toast";

//todo: remove mock functionality - replace with real API calls
const mockLabs = [
  {
    id: "1",
    title: "Introduction to React Hooks",
    description: "Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks with practical examples.",
    authorName: "John Doe",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "pending" as const,
    tags: ["React", "JavaScript", "Frontend"],
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns",
    description: "Explore advanced TypeScript patterns including generics, conditional types, and mapped types.",
    authorName: "Jane Smith",
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: "pending" as const,
    tags: ["TypeScript", "Patterns", "Advanced"],
  },
  {
    id: "3",
    title: "Building RESTful APIs with Node.js",
    description: "A comprehensive guide to building scalable RESTful APIs using Node.js and Express.",
    authorName: "Mike Johnson",
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "pending" as const,
    tags: ["Node.js", "API", "Backend"],
  },
];

export default function AdminReviewQueue() {
  const [labs, setLabs] = useState(mockLabs);
  const [selectedLab, setSelectedLab] = useState<typeof mockLabs[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const handleReview = (labId: string) => {
    const lab = labs.find(l => l.id === labId);
    if (lab) {
      setSelectedLab(lab);
      setModalOpen(true);
    }
  };

  const handleApprove = async (labId: string, comment: string) => {
    //todo: remove mock functionality - replace with API call
    console.log('Approve lab:', labId, comment);
    setLabs(labs.filter(l => l.id !== labId));
    toast({
      title: "Lab Approved",
      description: "The author has been notified via email.",
    });
  };

  const handleReject = async (labId: string, comment: string) => {
    //todo: remove mock functionality - replace with API call
    console.log('Reject lab:', labId, comment);
    setLabs(labs.filter(l => l.id !== labId));
    toast({
      title: "Lab Rejected",
      description: "The author has been notified with your feedback.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2" data-testid="text-page-title">Pending Labs</h1>
        <p className="text-muted-foreground">
          Review and approve labs submitted by authors
        </p>
      </div>

      <ReviewQueueTable labs={labs} onReview={handleReview} />

      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        lab={selectedLab}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
