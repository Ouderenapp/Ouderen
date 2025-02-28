import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { ActivityCard } from "./activity-card";

export function RecommendedActivities() {
  const { data: recommendations, isLoading } = useQuery<Activity[]>({
    queryKey: [`/api/activities/recommended`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Aanbevolen Activiteiten</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations?.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Aanbevolen Activiteiten</h2>
        <p className="text-muted-foreground">
          We hebben nog geen aanbevelingen voor je. Werk je voorkeuren bij om persoonlijke suggesties te krijgen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Aanbevolen Activiteiten</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {recommendations.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
