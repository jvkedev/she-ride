type RentalFeatureItemProps = {
  children: React.ReactNode;
};

export default function RentalFeatureItem({ children }: RentalFeatureItemProps) {
  return (
    <p className="border-b border-neutral-100 py-4 text-sm leading-relaxed text-neutral-700 last:border-0">
      {children}
    </p>
  );
}
