import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DepartmentRedirect } from "@/components/DepartmentRedirect";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Onboarding from "@/pages/Onboarding";
import AccessDenied from "@/pages/AccessDenied";
import Inbox from "@/pages/Inbox";
import CreateOpportunity from "@/pages/CreateOpportunity";
import OpportunityDetail from "@/pages/OpportunityDetail";
import OpportunitiesList from "@/pages/OpportunitiesList";
import Engineering from "@/pages/Engineering";
import SalesDashboard from "@/pages/SalesDashboard";
import TechDashboard from "@/pages/TechDashboard";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/app/onboarding" element={<Onboarding />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/" element={<Navigate to="/app" replace />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DepartmentRedirect />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="opportunities" element={<OpportunitiesList />} />
              <Route path="opportunities/new" element={<CreateOpportunity />} />
              <Route path="opportunities/:id" element={<OpportunityDetail />} />

              {/* Sales */}
              <Route path="sales" element={<ProtectedRoute department="sales"><SalesDashboard /></ProtectedRoute>} />
              <Route path="offers" element={<ProtectedRoute department="sales"><PlaceholderPage title="Offers" description="Manage and track offer documents sent to clients." /></ProtectedRoute>} />
              <Route path="outcomes" element={<ProtectedRoute department="sales"><PlaceholderPage title="Outcomes" description="Track awarded and lost opportunities." /></ProtectedRoute>} />

              {/* Tech Office */}
              <Route path="tech" element={<ProtectedRoute department="tech_office"><TechDashboard /></ProtectedRoute>} />
              <Route path="engineering" element={<ProtectedRoute department="tech_office" roles={["engineer", "manager"]}><Engineering /></ProtectedRoute>} />
              <Route path="shortlists" element={<ProtectedRoute department="tech_office"><PlaceholderPage title="Model Shortlists" description="View and manage shortlisted models for opportunities." /></ProtectedRoute>} />
              <Route path="pricing" element={<ProtectedRoute department="tech_office"><PlaceholderPage title="Pricing Queue" description="Opportunities awaiting pricing calculations." /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
