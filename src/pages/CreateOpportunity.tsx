import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Project, ProjectApplication, ProjectScope, ProductFamily, DocumentType, SignedUploadUrl,
} from "@/types";
import { toast } from "sonner";
import { useCreateLinearIssue } from "@/hooks/useLinear";

// Real PDF extraction is not wired up yet (backend fetch/parse is still stubbed) — this
// form collects the same fields a review-and-confirm step would, so the create -> Supabase
// write -> document-in-bucket flow can be exercised end-to-end without it. Swap this for the
// real Path A extraction UI once the backend pipeline is implemented.

const APPLICATIONS: ProjectApplication[] = ["Industrial", "Commercial", "Health", "Residential"];
const SCOPES: { value: ProjectScope; label: string }[] = [
  { value: "Supply", label: "Supply" },
  { value: "SupplyInstallation", label: "Supply & Installation" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Retrofit", label: "Retrofit" },
  { value: "Other", label: "Other" },
];
const PRODUCT_FAMILIES: ProductFamily[] = ["Chiller", "Pump", "Generator"];
const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "rfq", label: "RFQ" },
  { value: "offer", label: "Offer" },
  { value: "submittal", label: "Submittal" },
];

interface FormState {
  name: string;
  application: ProjectApplication | "";
  scope: ProjectScope | "";
  contractor_name: string;
  owner_name: string;
  consultant_name: string;
  product_family: ProductFamily | "";
  product_model_code: string;
}

const initialForm: FormState = {
  name: "",
  application: "",
  scope: "",
  contractor_name: "",
  owner_name: "",
  consultant_name: "",
  product_family: "",
  product_model_code: "",
};

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [docType, setDocType] = useState<DocumentType>("rfq");
  const createLinearIssue = useCreateLinearIssue();
  const [form, setForm] = useState<FormState>(initialForm);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.application || !form.scope) {
      toast.error("Name, application, and scope are required.");
      return;
    }
    if (Boolean(form.product_family) !== Boolean(form.product_model_code)) {
      toast.error("Product family and model code must be provided together.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: create the opportunity (Path B — manual entry, no PDF extraction yet)
      const project = await apiClient.post<Project>("/opportunities/manual", {
        name: form.name,
        application: form.application,
        scope: form.scope,
        contractor_name: form.contractor_name || undefined,
        owner_name: form.owner_name || undefined,
        consultant_name: form.consultant_name || undefined,
        product_family: form.product_family || undefined,
        product_model_code: form.product_model_code || undefined,
      });

      // Step 2: upload each file to Supabase Storage via a signed URL, then register its
      // metadata (this is what actually moves the file into the bucket at a real path and
      // creates a Document row pointing at it).
      for (const file of files) {
        const path = `${project.id}/${docType}/${Date.now()}-${file.name}`;
        const { signed_url } = await apiClient.post<SignedUploadUrl>(
          "/documents/signed-upload-url",
          { bucket: "documents", path, content_type: file.type }
        );
        await apiClient.uploadToSignedUrl(signed_url, file);
        await apiClient.post("/documents/", {
          project_id: project.id,
          doc_type: docType,
          bucket: "documents",
          path,
          filename: file.name,
          content_type: file.type,
        });
      }

      // Auto-create a Linear issue for the new opportunity — non-blocking, doesn't affect
      // the main create flow if it fails.
      createLinearIssue.mutate(
        {
          title: `[Opportunity] ${form.name}`,
          description: [
            `**Application:** ${form.application} · **Scope:** ${form.scope}`,
            form.contractor_name ? `**Contractor:** ${form.contractor_name}` : "",
            form.owner_name ? `**Owner:** ${form.owner_name}` : "",
            form.consultant_name ? `**Consultant:** ${form.consultant_name}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
          priority: 3,
        },
        {
          onSuccess: (issue) => toast.info(`Linear issue created: ${issue.identifier}`),
          onError: () => console.warn("Linear issue creation failed — continuing anyway"),
        }
      );

      toast.success("Opportunity created successfully");
      navigate(`/app/opportunities/${project.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create opportunity");
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
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Application</Label>
                <Select
                  value={form.application}
                  onValueChange={(v) => update("application", v as ProjectApplication)}
                >
                  <SelectTrigger><SelectValue placeholder="Select application" /></SelectTrigger>
                  <SelectContent>
                    {APPLICATIONS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select
                  value={form.scope}
                  onValueChange={(v) => update("scope", v as ProjectScope)}
                >
                  <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
                  <SelectContent>
                    {SCOPES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Contractor</Label>
                <Input
                  value={form.contractor_name}
                  onChange={(e) => update("contractor_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input
                  value={form.owner_name}
                  onChange={(e) => update("owner_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Consultant</Label>
                <Input
                  value={form.consultant_name}
                  onChange={(e) => update("consultant_name", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Family</Label>
                <Select
                  value={form.product_family}
                  onValueChange={(v) => update("product_family", v as ProductFamily)}
                >
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_FAMILIES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model Code</Label>
                <Input
                  value={form.product_model_code}
                  onChange={(e) => update("product_model_code", e.target.value)}
                  disabled={!form.product_family}
                  placeholder={form.product_family ? "e.g. CH-500X" : "Select a product family first"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Documents</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                  <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
