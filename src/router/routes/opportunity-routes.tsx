
import Opportunities from "@/pages/Opportunities";
import OpportunityDetails from "@/pages/OpportunityDetails";
import CreateOpportunity from "@/pages/CreateOpportunity";
import Scholarships from "@/pages/Scholarships";
import ScholarshipAdd from "@/pages/ScholarshipAdd";

export const opportunityRoutes = [
  {
    path: "opportunities",
    element: <Opportunities />,
  },
  {
    path: "opportunities/:id",
    element: <OpportunityDetails />,
  },
  {
    path: "opportunities/create",
    element: <CreateOpportunity />,
  },
  {
    path: "scholarships",
    element: <Scholarships />,
  },
  {
    path: "scholarships/add",
    element: <ScholarshipAdd />,
  },
];
