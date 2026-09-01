import { useParams } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { stubOpportunities } from "@/lib/stub-data";
import { useAuth } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/opportunity/Timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download, FileText, CheckSquare, Send, Trophy, XCircle,
  Microscope, Layers, DollarSign, ClipboardCheck,
} from "lucide-react";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { hasDepartment } = useAuth();
  // Runs on stub data for now, deliberately -- no /opportunities/:id call here yet, same reason
  // as OpportunitiesList.tsx. Swap for a real fetch when the Opportunity section work happens.
  const opp = stubOpportunities.find((o) => o.id === id) || stubOpportunities[0];

  const handleDownload = async (docId: string) => {
    try {
      const { url } = await apiClient.get<{ url: string }>(`/documents/${docId}/signed-download-url`);
      window.open(url, "_blank");
    } catch {
      console.warn("Download stub — Django endpoint unavailable");
    }
  };

  if (!opp) return <p className="text-sm text-muted-foreground">Opportunity not found.</p>;

  const isSales = hasDepartment("sales");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{opp.project_name}</h1>
          <p className="text-sm text-muted-foreground">Created {new Date(opp.created_at).toLocaleDateString()}</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">{opp.status}</Badge>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contractor</dt>
              <dd className="mt-0.5 font-medium">{opp.contractor || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Owner</dt>
              <dd className="mt-0.5 font-medium">{opp.owner || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Consultant</dt>
              <dd className="mt-0.5 font-medium">{opp.consultant || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Department-aware tabs */}
      <Tabs defaultValue={isSales ? "sales" : "tech"}>
        <TabsList>
          {isSales && <TabsTrigger value="sales">Sales View</TabsTrigger>}
          {!isSales && <TabsTrigger value="tech">Tech View</TabsTrigger>}
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Send className="h-4 w-4 text-primary" />
                Send-to-Client Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Technical specs reviewed", "Pricing approved", "Offer document generated", "Client contacted"].map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    {item}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-success" />
                Outcome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-1">
                  <Trophy className="h-3.5 w-3.5 text-success" /> Awarded
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <XCircle className="h-3.5 w-3.5 text-destructive" /> Lost
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Outcome fields will be populated from the Django API.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Download className="h-4 w-4 text-primary" />
                Offer Download
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Offer document will be available for download here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tech Tab */}
        <TabsContent value="tech" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Microscope className="h-4 w-4 text-primary" />
                Extracted Fields Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Extracted data will appear here after document processing. Engineers can verify and correct extracted values.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Layers className="h-4 w-4 text-primary" />
                Portal Shortlist & Model Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Shortlisted models will be displayed here for selection and comparison.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <DollarSign className="h-4 w-4 text-primary" />
                Pricing Trigger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-1">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Submit for Pricing
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">Triggers pricing workflow after model selection is confirmed.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Documents ({opp.documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {opp.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="space-y-2">
                  {opp.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.filename}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.id)}>
                        <Download className="mr-1 h-3 w-3" /> Download
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
