import { useQuery } from "@tanstack/react-query";
import { CenterCard } from "@/components/center-card";
import { OnboardingGuide } from "@/components/onboarding-guide";
import { RecommendedActivities } from "@/components/recommended-activities";
import { UserPreferences } from "@/components/user-preferences";
import { useAuth } from "@/hooks/use-auth";
import type { Center } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
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

      {/* Only show recommendations and preferences for logged in users */}
      {user && (
        <>
          <RecommendedActivities />
          <UserPreferences />
        </>
      )}

      <h1 className="text-4xl font-bold">Activiteitencentra</h1>
      {centers && centers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {centers.map((center) => (
            <CenterCard key={center.id} center={center} />
          ))}
        </div>
      ) : (
        <p className="text-xl text-muted-foreground">
          Er zijn momenteel geen buurthuizen beschikbaar.
        </p>
      )}
    </div>
  );
}