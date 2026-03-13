import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { stubOpportunities } from "@/lib/stub-data";
import { Opportunity } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<Opportunity>(`/opportunities/${id}`)
      .then(setOpp)
      .catch(() => {
        const stub = stubOpportunities.find((o) => o.id === id) || stubOpportunities[0];
        setOpp(stub);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const { url } = await apiClient.get<{ url: string }>(
        `/documents/${docId}/signed-download-url`
      );
      window.open(url, "_blank");
    } catch {
      console.warn("Download stub — Django endpoint unavailable");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!opp) return <p className="text-sm text-muted-foreground">Opportunity not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{opp.project_name}</h1>
        <Badge variant="outline">{opp.status}</Badge>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Contractor</dt>
              <dd className="font-medium">{opp.contractor || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="font-medium">{opp.owner || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Consultant</dt>
              <dd className="font-medium">{opp.consultant || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {opp.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded.</p>
          ) : (
            <ul className="space-y-2">
              {opp.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {doc.filename}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc.id, doc.filename)}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Stubs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline / Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Timeline will be populated from the Django API.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Extracted Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Extracted data will appear here after document processing.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shortlist Models</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Shortlisted models will be displayed here.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Offer document will be available for download here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
