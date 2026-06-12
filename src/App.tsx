import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DepartmentRedirect } from "@/components/DepartmentRedirect";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import PendingActivation from "@/pages/PendingActivation";
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
            <Route path="/signup" element={<Signup />} />
            <Route path="/pending" element={<PendingActivation />} />
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
              <Route path="sales" element={<SalesDashboard />} />
              <Route path="offers" element={<PlaceholderPage title="Offers" description="Manage and track offer documents sent to clients." />} />
              <Route path="outcomes" element={<PlaceholderPage title="Outcomes" description="Track awarded and lost opportunities." />} />

              {/* Tech Office */}
              <Route path="tech" element={<TechDashboard />} />
              <Route
                path="engineering"
                element={
                  <ProtectedRoute roles={["tech_engineer", "manager"]}>
                    <Engineering />
                  </ProtectedRoute>
                }
              />
              <Route path="shortlists" element={<PlaceholderPage title="Model Shortlists" description="View and manage shortlisted models for opportunities." />} />
              <Route path="pricing" element={<PlaceholderPage title="Pricing Queue" description="Opportunities awaiting pricing calculations." />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
