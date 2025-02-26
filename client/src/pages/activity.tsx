import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Activity, User } from "@shared/schema";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

export default function ActivityPage() {
  const { id } = useParams();
  const activityId = parseInt(id);
  const { toast } = useToast();

  const { data: activity, isLoading: isLoadingActivity } = useQuery<Activity>({
    queryKey: [`/api/activities/${activityId}`],
  });

  const { data: attendees, isLoading: isLoadingAttendees } = useQuery<User[]>({
    queryKey: [`/api/activities/${activityId}/registrations`],
  });

  const register = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/activities/${activityId}/register`, {
        userId: 1, // TODO: Get from auth context
      });
    },
    onSuccess: () => {
      toast({
        title: "Successfully registered!",
        description: "You are now registered for this activity.",
      });
    },
  });

  if (isLoadingActivity || isLoadingAttendees) {
    return (
      <div className="space-y-8">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!activity) return null;

  const date = new Date(activity.date);

  return (
    <div className="space-y-8">
      <div className="relative h-64 overflow-hidden rounded-lg">
        <img
          src={activity.imageUrl}
          alt={activity.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl font-bold text-white">{activity.name}</h1>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xl">
              <Calendar className="h-6 w-6" />
              <time dateTime={date.toISOString()}>
                {format(date, "EEEE, MMMM d 'at' h:mm a")}
              </time>
            </div>
            <div className="flex items-center space-x-2 text-xl">
              <Users className="h-6 w-6" />
              <span>
                {attendees?.length || 0} / {activity.capacity} registered
              </span>
            </div>
          </div>

          <p className="text-xl">{activity.description}</p>

          <Button
            size="lg"
            className="w-full text-lg"
            onClick={() => register.mutate()}
            disabled={register.isPending}
          >
            {register.isPending ? "Registering..." : "Register for Activity"}
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Registered Attendees</h2>
          <div className="rounded-lg border p-4">
            {attendees?.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-2 py-2 text-lg"
              >
                <span>{user.displayName}</span>
              </div>
            ))}
            {attendees?.length === 0 && (
              <p className="text-lg text-muted-foreground">
                No one has registered yet. Be the first!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
