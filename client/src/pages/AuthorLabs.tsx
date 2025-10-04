
import { useState, useEffect } from "react";
import { LabCard } from "@/components/LabCard";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import type { Lab } from "@shared/schema";

export default function AuthorLabs() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadLabs();
  }, []);

  const loadLabs = async () => {
    try {
      setLoading(true);
      const data = await api.getLabs();
      setLabs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load labs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const draftLabs = labs.filter(l => l.status === "draft");
  const pendingLabs = labs.filter(l => l.status === "pending");
  const approvedLabs = labs.filter(l => l.status === "approved");

  const handleEdit = (id: string) => {
    setLocation(`/author/labs/${id}/edit`);
  };

  const handleSubmit = async (id: string) => {
    try {
      await api.submitLab(parseInt(id));
      toast({
        title: "Lab Submitted",
        description: "Your lab has been submitted for review.",
      });
      await loadLabs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit lab",
        variant: "destructive",
      });
    }
  };

  const handleView = (id: string) => {
    setLocation(`/author/labs/${id}`);
  };

  const handleCreateNew = () => {
    setLocation('/author/labs/new');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading labs...</p>
        </div>
      </div>
    );
  }

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
                id={lab.id.toString()}
                title={lab.title}
                description={lab.description}
                status={lab.status as any}
                authorName="You"
                updatedAt={new Date(lab.updatedAt)}
                onEdit={() => handleEdit(lab.id.toString())}
                onSubmit={() => handleSubmit(lab.id.toString())}
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
                id={lab.id.toString()}
                title={lab.title}
                description={lab.description}
                status={lab.status as any}
                authorName="You"
                updatedAt={new Date(lab.updatedAt)}
                onView={() => handleView(lab.id.toString())}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
