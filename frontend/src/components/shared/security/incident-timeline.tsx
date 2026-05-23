import { cn } from "@/lib/utils";

export type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  description?: string;
};

type IncidentTimelineProps = {
  events: TimelineEvent[];
  className?: string;
};

export default function IncidentTimeline({ events, className }: IncidentTimelineProps) {
  return (
    <ol className={cn("space-y-0", className)}>
      {events.map((event, index) => (
        <li key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex size-7 items-center justify-center rounded-full border-2 border-primary bg-white text-xs font-semibold text-primary">
              {index + 1}
            </div>
            {index < events.length - 1 ? (
              <div className="my-1 w-0.5 flex-1 min-h-6 bg-neutral-200" />
            ) : null}
          </div>
          <div className="pb-6 pt-0.5">
            <p className="text-sm font-medium text-neutral-900">{event.title}</p>
            {event.description ? (
              <p className="mt-0.5 text-sm text-neutral-500">{event.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-neutral-400">{event.time}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
