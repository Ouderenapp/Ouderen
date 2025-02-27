import { useQuery } from "@tanstack/react-query";
import { CenterCard } from "@/components/center-card";
import { OnboardingGuide } from "@/components/onboarding-guide";
import type { Center } from "@shared/schema";

export default function Home() {
  const { data: centers, isLoading } = useQuery<Center[]>({
    queryKey: ["/api/centers"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Activiteitencentra</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <OnboardingGuide />
      <h1 className="text-4xl font-bold">Activiteitencentra</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {centers?.map((center) => (
          <CenterCard key={center.id} center={center} />
        ))}
      </div>
    </div>
  );
}