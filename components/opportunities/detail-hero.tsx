import { StatusBadge, Badge } from "@/components/luxury-ui/badge";

interface DetailHeroProps {
  title: string;
  brand?: string | null;
  modelDescriptor?: string | null;
  status: string;
  accessTierRequired: string;
  heroMediaUrl?: string | null;
}

export function DetailHero({
  title,
  brand,
  modelDescriptor,
  status,
  accessTierRequired,
  heroMediaUrl,
}: DetailHeroProps) {
  return (
    <div className="relative h-72 md:h-96 rounded-xl overflow-hidden mb-8">
      {heroMediaUrl ? (
        <img src={heroMediaUrl} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-surface-elevated to-surface-overlay flex items-center justify-center">
          <span className="text-muted text-lg">Premium Inventory</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={status} />
          {accessTierRequired === "vip" && <Badge variant="gold">VIP</Badge>}
        </div>
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
          {brand}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {modelDescriptor && (
          <p className="text-muted-foreground mt-1">{modelDescriptor}</p>
        )}
      </div>
    </div>
  );
}
