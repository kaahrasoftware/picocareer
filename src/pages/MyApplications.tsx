
import { useState } from "react";
import { useUserApplications } from "@/hooks/useUserApplications";
import { ApplicationCard } from "@/components/application/ApplicationCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApplicationStatus } from "@/types/database/enums";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function MyApplications() {
  const navigate = useNavigate();
  const { session, loading } = useAuthSession('required');
  const { data: applications, isLoading, error } = useUserApplications();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // If authentication is loading, show loading state
  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Filter applications based on active tab
  const filteredApplications = applications?.filter(app => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
  });

  return (
    <div className="container px-4 py-8 mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-1"
        onClick={() => navigate("/opportunities")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Opportunities
      </Button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">My Applications</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value={ApplicationStatus.Applied}>Applied</TabsTrigger>
            <TabsTrigger value={ApplicationStatus.InReview}>In Review</TabsTrigger>
            <TabsTrigger value={ApplicationStatus.Accepted}>Accepted</TabsTrigger>
            <TabsTrigger value={ApplicationStatus.Rejected}>Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                Error loading applications: {error.message}
              </div>
            ) : filteredApplications?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You don't have any {activeTab !== "all" ? activeTab.toLowerCase() : ""} applications yet.</p>
                <Button onClick={() => navigate("/opportunities")}>
                  Browse Opportunities
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications?.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
