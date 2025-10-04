
import { LabForm } from "@/components/LabForm";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function CreateLab() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (values: any) => {
    try {
      await api.createLab({
        title: values.title,
        description: values.description,
        difficulty: values.difficulty || "beginner",
        tags: values.tags ? values.tags.split(",").map((t: string) => t.trim()) : [],
        price: values.price || "0",
      });
      
      toast({
        title: "Lab Created",
        description: "Your lab has been saved as a draft.",
      });
      setLocation('/author/labs');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lab",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocation('/author/labs');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Create New Lab</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create your lab
          </p>
        </div>
      </div>

      <LabForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Save Draft"
      />
    </div>
  );
}
