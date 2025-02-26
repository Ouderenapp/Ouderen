import { useQuery, useMutation } from "@tanstack/react-query";
import { ActivityCard } from "@/components/activity-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Activity } from "@shared/schema";
import { Building2, MapPin } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: myActivities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: [`/api/users/${user?.id}/activities`],
    enabled: !!user,
  });

  const updateAnonymous = useMutation({
    mutationFn: async (anonymous: boolean) => {
      if (!user) return;
      await apiRequest("PATCH", `/api/users/${user.id}`, {
        anonymousParticipation: anonymous,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Instellingen bijgewerkt",
        description: "Uw privacy-voorkeuren zijn opgeslagen.",
      });
    },
  });

  if (!user) return null;

  if (isLoadingActivities) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader className="text-2xl font-bold">Mijn Profiel</CardHeader>
          <CardContent>
            <div className="h-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Mijn Activiteiten</h2>
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
        <CardHeader className="text-2xl font-bold">Mijn Profiel</CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-lg font-medium">Naam</label>
                <p className="text-xl">{user.displayName}</p>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <div>
                  <label className="text-lg font-medium">Locatie</label>
                  <p className="text-xl">{user.village}, {user.neighborhood}</p>
                </div>
              </div>

              <div>
                <label className="text-lg font-medium">Telefoonnummer</label>
                <p className="text-xl">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={user.anonymousParticipation}
                onCheckedChange={(checked) => {
                  updateAnonymous.mutate(checked as boolean);
                }}
              />
              <label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Anoniem deelnemen aan activiteiten
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Mijn Activiteiten</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {myActivities?.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isRegistered={true}
              onRegister={() => {}}
            />
          ))}
          {(!myActivities || myActivities.length === 0) && (
            <p className="col-span-2 text-center text-lg text-muted-foreground">
              U bent nog niet aangemeld voor activiteiten
            </p>
          )}
        </div>
      </div>
    </div>
  );
}