import { cn } from "@/lib/utils";

type BookingSidebarCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function BookingSidebarCard({
  children,
  className,
}: BookingSidebarCardProps) {
  return (
    <div
      className={cn(
        "relative z-20 flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] ring-1 ring-neutral-200/80",
        className,
      )}
    >
      {children}
    </div>
  );
}
