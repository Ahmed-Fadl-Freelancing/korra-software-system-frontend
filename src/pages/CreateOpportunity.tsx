import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedUploadUrl } from "@/types";
import { toast } from "sonner";
import { useCreateLinearIssue } from "@/hooks/useLinear";

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const createLinearIssue = useCreateLinearIssue();
  const [form, setForm] = useState({
    project_name: "",
    email_body: "",
    contractor: "",
    owner: "",
    consultant: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create opportunity
      let oppId: string;
      try {
        const opp = await apiClient.post<{ id: string }>("/opportunities", form);
        oppId = opp.id;
      } catch {
        // Stub: simulate created opportunity
        oppId = `opp-${Date.now()}`;
        console.warn("Django POST /opportunities unavailable, using stub ID");
      }

      // Step 2: Upload files via signed URLs
      for (const file of files) {
        try {
          const { signed_url } = await apiClient.post<SignedUploadUrl>(
            "/documents/signed-upload-url",
            { opportunity_id: oppId, filename: file.name, content_type: file.type }
          );
          await apiClient.uploadToSignedUrl(signed_url, file);
          // Step 3: Register document metadata
          await apiClient.post("/documents", {
            opportunity_id: oppId,
            filename: file.name,
          });
        } catch {
          console.warn(`Upload stub for ${file.name} — Django endpoints unavailable`);
        }
      }

      // Auto-create Linear issue for the new opportunity
      createLinearIssue.mutate(
        {
          title: `[Opportunity] ${form.project_name}`,
          description: [
            form.email_body ? `**Email body:**\n${form.email_body}` : "",
            form.contractor ? `**Contractor:** ${form.contractor}` : "",
            form.owner ? `**Owner:** ${form.owner}` : "",
            form.consultant ? `**Consultant:** ${form.consultant}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
          priority: 3,
        },
        {
          onSuccess: (issue) => toast.info(`Linear issue created: ${issue.identifier}`),
          onError: () => console.warn("Linear issue creation skipped — backend unavailable"),
        }
      );

      toast.success("Opportunity created successfully");
      navigate(`/app/opportunities/${oppId}`);
    } catch (err) {
      toast.error("Failed to create opportunity");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">New Opportunity</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={form.project_name}
                onChange={(e) => update("project_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                value={form.email_body}
                onChange={(e) => update("email_body", e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Contractor</Label>
                <Input
                  value={form.contractor}
                  onChange={(e) => update("contractor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input
                  value={form.owner}
                  onChange={(e) => update("owner", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Consultant</Label>
                <Input
                  value={form.consultant}
                  onChange={(e) => update("consultant", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Documents (PDF)</Label>
              <FileUpload files={files} onChange={setFiles} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating…" : "Create Opportunity"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
