import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RiderActionButtonProps = React.ComponentProps<typeof Button> & {
  fullWidth?: boolean;
};

export default function RiderActionButton({
  className,
  fullWidth,
  variant = "default",
  size = "lg",
  ...props
}: RiderActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "h-11 rounded-lg font-semibold",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
