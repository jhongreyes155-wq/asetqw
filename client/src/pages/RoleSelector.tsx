import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";
import { useLocation } from "wouter";

export default function RoleSelector() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3" data-testid="text-welcome-title">
            Welcome to Lab Manager
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="hover-elevate cursor-pointer transition-all"
            onClick={() => setLocation('/admin/review')}
            data-testid="card-role-admin"
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Admin</CardTitle>
              <CardDescription>
                Review and approve lab submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Review pending lab submissions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Approve or reject with feedback
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Manage all labs in the system
                </li>
              </ul>
              <Button className="w-full" data-testid="button-enter-admin">
                Enter as Admin
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer transition-all"
            onClick={() => setLocation('/author/labs')}
            data-testid="card-role-author"
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-16 w-16 rounded-lg bg-status-approved/10 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-status-approved" />
              </div>
              <CardTitle>Author</CardTitle>
              <CardDescription>
                Create and submit your labs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-approved" />
                  Create and edit lab content
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-approved" />
                  Submit labs for review
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-approved" />
                  Track submission status
                </li>
              </ul>
              <Button className="w-full bg-status-approved hover:bg-status-approved/90" data-testid="button-enter-author">
                Enter as Author
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
