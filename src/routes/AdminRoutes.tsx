
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the upload pages
const SchoolUploadPage = lazy(() => import("@/pages/SchoolUploadPage"));
const CompanyUploadPage = lazy(() => import("@/pages/CompanyUploadPage"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export function AdminRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/schools/upload" element={<SchoolUploadPage />} />
        <Route path="/companies/upload" element={<CompanyUploadPage />} />
      </Routes>
    </Suspense>
  );
}
