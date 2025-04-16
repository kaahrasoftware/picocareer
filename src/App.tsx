
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

// Layout components
import { MainLayout } from "@/router/layouts";

// Pages
import Home from "@/pages/Home";
import Opportunities from "@/pages/Opportunities";
import OpportunityDetail from "@/pages/OpportunityDetail";
import CreateOpportunity from "@/pages/CreateOpportunity";
import MyApplications from "@/pages/MyApplications";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="opportunities/:id" element={<OpportunityDetail />} />
          <Route path="opportunities/create" element={<CreateOpportunity />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
