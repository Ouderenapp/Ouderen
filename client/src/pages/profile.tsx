import { useQuery } from "@tanstack/react-query";
import { ActivityCard } from "@/components/activity-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Activity } from "@shared/schema";

export default function Profile() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader className="text-2xl font-bold">My Profile</CardHeader>
          <CardContent>
            <div className="h-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">My Activities</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-2xl font-bold">My Profile</CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-lg font-medium">Display Name</label>
              <p className="text-xl">John Doe</p>
            </div>
            <div>
              <label className="text-lg font-medium">Phone</label>
              <p className="text-xl">555-0123</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Activities</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {activities?.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isRegistered={true}
              onRegister={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
