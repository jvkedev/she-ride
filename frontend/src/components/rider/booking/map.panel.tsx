import { Navigation } from "lucide-react";

export default function MapPanel() {
  return (
    <div className="sticky top-24 hidden h-[calc(100vh-110px)] overflow-hidden rounded-2xl border bg-muted lg:block">
      <div className="relative h-full bg-[url('/maps/delhi-map.png')] bg-cover bg-center">
        <div className="absolute left-1/2 top-1/3 rounded-lg bg-background px-4 py-2 text-sm shadow">
          <strong>2 min</strong> from Bikanervala Pitampura
        </div>

        <div className="absolute bottom-32 left-10 rounded-lg bg-background px-4 py-2 text-sm shadow">
          To Century Public School
        </div>

        <div className="absolute left-[45%] top-[42%] rounded-full bg-primary p-3 text-primary-foreground shadow">
          <Navigation className="h-5 w-5" />
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col overflow-hidden rounded-lg bg-background shadow">
          <button className="px-4 py-2 text-xl">+</button>
          <button className="border-t px-4 py-2 text-xl">−</button>
        </div>
      </div>
    </div>
  );
}
