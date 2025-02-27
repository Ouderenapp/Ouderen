import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Activity, User } from "@shared/schema";
import { Calendar, Users, Package, Building2 } from "lucide-react";
import { format } from "date-fns";

type WaitlistUser = User & { position: number };

export default function ActivityPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const activityId = parseInt(id || "0");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: activity, isLoading: isLoadingActivity } = useQuery<Activity>({
    queryKey: [`/api/activities/${activityId}`],
  });

  const { data: attendees, isLoading: isLoadingAttendees } = useQuery<User[]>({
    queryKey: [`/api/activities/${activityId}/registrations`],
  });

  const { data: waitlist, isLoading: isLoadingWaitlist } = useQuery<WaitlistUser[]>({
    queryKey: [`/api/activities/${activityId}/waitlist`],
  });

  const isRegistered = attendees?.some(attendee => attendee.id === user?.id);
  const onWaitlist = waitlist?.some(entry => entry.id === user?.id);
  const waitlistPosition = waitlist?.find(entry => entry.id === user?.id)?.position;
  const isFull = attendees && activity ? attendees.length >= activity.capacity : false;

  const register = useMutation({
    mutationFn: async () => {
      if (!user) {
        setLocation("/auth");
        throw new Error("U moet eerst inloggen");
      }
      await apiRequest("POST", `/api/activities/${activityId}/register`, {
        userId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activityId}/registrations`] });
      toast({
        title: "Aanmelding geslaagd!",
        description: "U bent nu aangemeld voor deze activiteit.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Aanmelding mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unregister = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await apiRequest("DELETE", `/api/activities/${activityId}/register`, {
        userId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activityId}/registrations`] });
      toast({
        title: "Afmelding geslaagd",
        description: "U bent afgemeld voor deze activiteit.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Afmelding mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const joinWaitlist = useMutation({
    mutationFn: async () => {
      if (!user) {
        setLocation("/auth");
        throw new Error("U moet eerst inloggen");
      }
      await apiRequest("POST", `/api/activities/${activityId}/waitlist`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activityId}/waitlist`] });
      toast({
        title: "Op wachtlijst geplaatst",
        description: "U staat nu op de wachtlijst voor deze activiteit.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Aanmelding voor wachtlijst mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const leaveWaitlist = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await apiRequest("DELETE", `/api/activities/${activityId}/waitlist`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activityId}/waitlist`] });
      toast({
        title: "Van wachtlijst verwijderd",
        description: "U bent van de wachtlijst verwijderd.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Afmelden van wachtlijst mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoadingActivity || isLoadingAttendees || isLoadingWaitlist) {
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
                {format(date, "EEEE, MMMM d 'om' HH:mm 'uur'")}
              </time>
            </div>
            <div className="flex items-center space-x-2 text-xl">
              <Users className="h-6 w-6" />
              <span>
                {attendees?.length || 0} / {activity.capacity} aanmeldingen
              </span>
            </div>
          </div>

          {/* Materialen en faciliteiten */}
          {(activity.materialsNeeded || activity.facilitiesAvailable) && (
            <div className="space-y-2">
              {activity.materialsNeeded && (
                <div className="flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  <p className="text-lg">Meenemen: {activity.materialsNeeded}</p>
                </div>
              )}
              {activity.facilitiesAvailable && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  <p className="text-lg">Beschikbaar: {activity.facilitiesAvailable}</p>
                </div>
              )}
            </div>
          )}

          <p className="text-xl">{activity.description}</p>

          <div className="space-y-2">
            {user ? (
              <>
                {isRegistered ? (
                  <Button
                    size="lg"
                    className="w-full text-lg"
                    variant="destructive"
                    onClick={() => unregister.mutate()}
                    disabled={unregister.isPending}
                  >
                    {unregister.isPending ? "Bezig..." : "Afmelden"}
                  </Button>
                ) : isFull ? (
                  onWaitlist ? (
                    <div className="space-y-2">
                      <p className="text-center text-muted-foreground">
                        U staat #{waitlistPosition} op de wachtlijst
                      </p>
                      <Button
                        size="lg"
                        className="w-full text-lg"
                        variant="destructive"
                        onClick={() => leaveWaitlist.mutate()}
                        disabled={leaveWaitlist.isPending}
                      >
                        {leaveWaitlist.isPending ? "Bezig..." : "Wachtlijst verlaten"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full text-lg"
                      onClick={() => joinWaitlist.mutate()}
                      disabled={joinWaitlist.isPending}
                    >
                      {joinWaitlist.isPending ? "Bezig..." : "Aanmelden voor wachtlijst"}
                    </Button>
                  )
                ) : (
                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={() => register.mutate()}
                    disabled={register.isPending}
                  >
                    {register.isPending ? "Bezig..." : "Aanmelden voor activiteit"}
                  </Button>
                )}
              </>
            ) : (
              <Button
                size="lg"
                className="w-full text-lg"
                onClick={() => setLocation("/auth")}
              >
                Log in om aan te melden
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Aangemelde deelnemers</h2>
          <div className="rounded-lg border p-4">
            {attendees?.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center space-x-2 py-2 text-lg"
              >
                {attendee.anonymousParticipation ? (
                  <div className="font-medium">Anonieme deelnemer</div>
                ) : (
                  <div className="font-medium">{attendee.displayName}</div>
                )}
                <div className="text-sm text-muted-foreground">
                  {attendee.village}, {attendee.neighborhood}
                </div>
              </div>
            ))}
            {!attendees?.length && (
              <p className="text-lg text-muted-foreground">
                Nog niemand aangemeld. Wees de eerste!
              </p>
            )}
          </div>

          {/* Wachtlijst sectie */}
          {waitlist && waitlist.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Wachtlijst</h2>
              <div className="rounded-lg border p-4">
                {waitlist.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 text-lg"
                  >
                    <div className="flex items-center space-x-2">
                      {entry.anonymousParticipation ? (
                        <div className="font-medium">Anonieme deelnemer</div>
                      ) : (
                        <div className="font-medium">{entry.displayName}</div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {entry.village}, {entry.neighborhood}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      #{entry.position}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}