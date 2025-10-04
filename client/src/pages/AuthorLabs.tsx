import { useState } from "react";
import { LabCard } from "@/components/LabCard";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

//todo: remove mock functionality - replace with real API calls
const mockLabs = [
  {
    id: "1",
    title: "Introduction to React Hooks",
    description: "Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks with practical examples.",
    status: "draft" as const,
    authorName: "You",
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns",
    description: "Explore advanced TypeScript patterns including generics, conditional types, and mapped types.",
    status: "draft" as const,
    authorName: "You",
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Building RESTful APIs",
    description: "A comprehensive guide to building scalable RESTful APIs using Node.js and Express.",
    status: "pending" as const,
    authorName: "You",
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    title: "CSS Grid Layout Mastery",
    description: "Master CSS Grid Layout with practical examples and real-world projects.",
    status: "approved" as const,
    authorName: "You",
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

export default function AuthorLabs() {
  const [labs, setLabs] = useState(mockLabs);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const draftLabs = labs.filter(l => l.status === "draft");
  const pendingLabs = labs.filter(l => l.status === "pending");
  const approvedLabs = labs.filter(l => l.status === "approved");

  const handleEdit = (id: string) => {
    //todo: remove mock functionality - navigate to edit page
    console.log('Edit lab:', id);
    setLocation(`/author/labs/${id}/edit`);
  };

  const handleSubmit = (id: string) => {
    //todo: remove mock functionality - replace with API call
    console.log('Submit lab:', id);
    setLabs(labs.map(l => l.id === id ? { ...l, status: "pending" as const } : l));
    toast({
      title: "Lab Submitted",
      description: "Your lab has been submitted for review.",
    });
  };

  const handleView = (id: string) => {
    //todo: remove mock functionality - navigate to detail page
    console.log('View lab:', id);
    setLocation(`/author/labs/${id}`);
  };

  const handleCreateNew = () => {
    //todo: remove mock functionality - navigate to create page
    console.log('Create new lab');
    setLocation('/author/labs/new');
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2" data-testid="text-page-title">My Labs</h1>
          <p className="text-muted-foreground">
            Create and manage your lab submissions
          </p>
        </div>
        <Button onClick={handleCreateNew} data-testid="button-create-lab">
          <Plus className="h-4 w-4 mr-2" />
          Create Lab
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Draft Labs"
          value={draftLabs.length}
          icon={FileText}
          iconColor="text-status-draft"
          testId="card-stats-drafts"
        />
        <StatsCard
          title="Pending Review"
          value={pendingLabs.length}
          icon={Clock}
          iconColor="text-status-pending"
          testId="card-stats-pending"
        />
        <StatsCard
          title="Approved"
          value={approvedLabs.length}
          icon={CheckCircle}
          iconColor="text-status-approved"
          testId="card-stats-approved"
        />
      </div>

      <Tabs defaultValue="drafts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="drafts" data-testid="tab-drafts">
            My Drafts ({draftLabs.length})
          </TabsTrigger>
          <TabsTrigger value="submitted" data-testid="tab-submitted">
            Submitted ({pendingLabs.length + approvedLabs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="space-y-4">
          {draftLabs.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No draft labs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first lab to get started
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Lab
              </Button>
            </div>
          ) : (
            draftLabs.map(lab => (
              <LabCard
                key={lab.id}
                {...lab}
                onEdit={() => handleEdit(lab.id)}
                onSubmit={() => handleSubmit(lab.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {[...pendingLabs, ...approvedLabs].length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No submitted labs</h3>
              <p className="text-sm text-muted-foreground">
                Submit your drafts for review to see them here
              </p>
            </div>
          ) : (
            [...pendingLabs, ...approvedLabs].map(lab => (
              <LabCard
                key={lab.id}
                {...lab}
                onView={() => handleView(lab.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
