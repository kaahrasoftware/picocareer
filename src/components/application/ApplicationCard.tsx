
import { OpportunityApplication } from "@/types/opportunity/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OpportunityType, ApplicationStatus } from "@/types/database/enums";
import { format } from "date-fns";

interface ApplicationCardProps {
  application: OpportunityApplication;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const navigate = useNavigate();
  const opportunity = application.opportunities;

  if (!opportunity) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Applied:
        return "bg-blue-100 text-blue-800";
      case ApplicationStatus.InReview:
        return "bg-yellow-100 text-yellow-800";
      case ApplicationStatus.Accepted:
        return "bg-green-100 text-green-800";
      case ApplicationStatus.Rejected:
        return "bg-red-100 text-red-800";
      case ApplicationStatus.Withdrawn:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOpportunityTypeDisplay = (type: OpportunityType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{opportunity.title}</h3>
            <p className="text-muted-foreground mt-1">{opportunity.provider_name}</p>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{getOpportunityTypeDisplay(opportunity.opportunity_type)}</Badge>
          {opportunity.deadline && (
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="w-3.5 h-3.5 mr-1" />
              Deadline: {formatDate(opportunity.deadline)}
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Applied on: {format(new Date(application.applied_at), "MMM d, yyyy")}</p>
          {application.notes && (
            <div className="mt-2">
              <p className="font-medium text-foreground">Your Notes:</p>
              <p className="mt-1">{application.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/opportunities/${opportunity.id}`)}
        >
          View Opportunity
        </Button>
        
        {application.status === ApplicationStatus.Applied && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Withdraw
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
