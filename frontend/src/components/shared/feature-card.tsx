import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="flex items-center gap-5">
      {/* Icon */}
      <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-primary">
        <Icon className="h-10 w-10" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-primary">{title}</h3>
        <p className="text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
