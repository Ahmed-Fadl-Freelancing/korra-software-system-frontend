import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      <EmptyState
        icon={Construction}
        title="Coming Soon"
        description={description || `The ${title} feature is under development.`}
      />
    </div>
  );
}
