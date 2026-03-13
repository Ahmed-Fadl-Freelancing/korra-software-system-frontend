import { Badge } from "@/components/ui/badge";
import { TimelineEvent } from "@/types";
import { Clock } from "lucide-react";

const stubTimeline: TimelineEvent[] = [
  { id: "1", status: "created", timestamp: "2026-03-01T09:00:00Z", user_name: "Demo User", note: "Opportunity created" },
  { id: "2", status: "documents_uploaded", timestamp: "2026-03-02T11:30:00Z", user_name: "Demo User", note: "2 documents uploaded" },
  { id: "3", status: "in_review", timestamp: "2026-03-03T14:00:00Z", user_name: "Tech Team", note: "Sent to Tech Office for review" },
];

const statusColors: Record<string, string> = {
  created: "bg-primary/10 text-primary",
  documents_uploaded: "bg-success/10 text-success",
  in_review: "bg-warning/10 text-warning",
  verified: "bg-success/10 text-success",
  pricing: "bg-primary/10 text-primary",
  offer_sent: "bg-primary/10 text-primary",
  awarded: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

export function Timeline({ events = stubTimeline }: { events?: TimelineEvent[] }) {
  return (
    <div className="relative space-y-0">
      {events.map((event, i) => (
        <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* vertical line */}
          {i < events.length - 1 && (
            <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
          )}
          {/* dot */}
          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {/* content */}
          <div className="flex-1 pt-0.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={statusColors[event.status] || ""}>
                {event.status.replace(/_/g, " ")}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {event.note && <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>}
            {event.user_name && <p className="mt-0.5 text-xs text-muted-foreground/70">by {event.user_name}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
