import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Inbox from "@/pages/Inbox";
import CreateOpportunity from "@/pages/CreateOpportunity";
import OpportunityDetail from "@/pages/OpportunityDetail";
import OpportunitiesList from "@/pages/OpportunitiesList";
import Engineering from "@/pages/Engineering";
import Manager from "@/pages/Manager";
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
            <Route path="/" element={<Navigate to="/app/inbox" replace />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="inbox" replace />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="opportunities" element={<OpportunitiesList />} />
              <Route path="opportunities/new" element={<CreateOpportunity />} />
              <Route path="opportunities/:id" element={<OpportunityDetail />} />
              <Route
                path="engineering"
                element={
                  <ProtectedRoute roles={["engineer", "manager"]}>
                    <Engineering />
                  </ProtectedRoute>
                }
              />
              <Route
                path="manager"
                element={
                  <ProtectedRoute roles={["manager"]}>
                    <Manager />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
