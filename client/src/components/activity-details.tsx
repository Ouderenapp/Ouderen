
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Activity, User } from "@shared/schema";

interface ActivityDetailsProps {
  activity: Activity;
}

export function ActivityDetails({ activity }: ActivityDetailsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [carpoolSeats, setCarpoolSeats] = useState(4);
  const [departureTime, setDepartureTime] = useState(() => {
    const date = new Date(activity.date);
    date.setHours(date.getHours() - 1); // Default to 1 hour before
    return date.toISOString().slice(0, 16); // Format for datetime-local
  });
  const [departureLocation, setDepartureLocation] = useState("");
  const [showReminderOption, setShowReminderOption] = useState(true);
  const [showCarpoolingOptions, setShowCarpoolingOptions] = useState(false);
  const [offerCarpooling, setOfferCarpooling] = useState(false);
  const [wantCarpooling, setWantCarpooling] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);

  // Fetch registrations
  const { data: registrations = [] } = useQuery<User[]>({
    queryKey: [`/api/activities/${activity.id}/registrations`],
  });

  // Fetch waitlist
  const { data: waitlist = [] } = useQuery({
    queryKey: [`/api/activities/${activity.id}/waitlist`],
    enabled: activity.enableWaitlist === true,
  });

  // Fetch carpool groups
  const { data: carpoolGroups = [] } = useQuery({
    queryKey: [`/api/activities/${activity.id}/carpool`],
    enabled: activity.enableCarpooling === true,
  });

  // Check if user is registered
  const isRegistered = registrations.some(
    (registration) => user && registration.id === user.id
  );

  // Check if user is on waitlist
  const isWaitlisted = waitlist.some(
    (entry) => user && entry.user.id === user.id
  );

  // Check capacity
  const isFull = registrations.length >= activity.capacity;

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest.post(`/api/activities/${activity.id}/register`, {
        userId: user?.id,
        needsReminder: showReminderOption,
        offersCarpooling: offerCarpooling,
        carpoolingSeats: offerCarpooling ? carpoolSeats : undefined,
        wantsCarpooling: wantCarpooling,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activity.id}/registrations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/activities`] });
      toast({
        title: "Geregistreerd",
        description: "Je bent succesvol geregistreerd voor deze activiteit.",
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 202) {
        // Added to waitlist
        queryClient.invalidateQueries({ queryKey: [`/api/activities/${activity.id}/waitlist`] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/waitlisted`] });
        toast({
          title: "Op wachtlijst geplaatst",
          description: "De activiteit is vol. Je bent op de wachtlijst geplaatst.",
        });
      } else {
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden. Probeer het later opnieuw.",
          variant: "destructive",
        });
      }
    },
  });

  // Unregister mutation
  const unregisterMutation = useMutation({
    mutationFn: async () => {
      return apiRequest.delete(`/api/activities/${activity.id}/register`, {
        data: { userId: user?.id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activity.id}/registrations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/activities`] });
      toast({
        title: "Uitgeschreven",
        description: "Je bent uitgeschreven voor deze activiteit.",
      });
    },
  });

  // Waitlist join mutation
  const joinWaitlistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest.post(`/api/activities/${activity.id}/waitlist`, {
        userId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activity.id}/waitlist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/waitlisted`] });
      toast({
        title: "Op wachtlijst",
        description: "Je bent op de wachtlijst geplaatst.",
      });
      setShowWaitlistDialog(false);
    },
  });

  // Waitlist leave mutation
  const leaveWaitlistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest.delete(`/api/activities/${activity.id}/waitlist`, {
        data: { userId: user?.id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activity.id}/waitlist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/waitlisted`] });
      toast({
        title: "Verwijderd van wachtlijst",
        description: "Je bent van de wachtlijst verwijderd.",
      });
    },
  });

  // Create carpool group mutation
  const createCarpoolGroupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest.post(`/api/activities/${activity.id}/carpool`, {
        availableSeats: carpoolSeats,
        departureLocation: departureLocation || `${user?.neighborhood}, ${user?.village}`,
        departureTime: departureTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activity.id}/carpool`] });
      toast({
        title: "Carpool groep aangemaakt",
        description: "Je carpool groep is succesvol aangemaakt.",
      });
    },
  });

  // Join carpool group mutation
  const joinCarpoolGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      return apiRequest.post(`/api/carpool/${groupId}/join`, {
        pickupLocation: pickupLocation || `${user?.neighborhood}, ${user?.village}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activity.id}/carpool`] });
      toast({
        title: "Carpool groep toegetreden",
        description: "Je bent succesvol toegetreden tot de carpool groep.",
      });
    },
  });

  // Leave carpool group mutation
  const leaveCarpoolGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      return apiRequest.delete(`/api/carpool/${groupId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activity.id}/carpool`] });
      toast({
        title: "Carpool groep verlaten",
        description: "Je hebt de carpool groep verlaten.",
      });
    },
  });

  // Check if user is in any carpool group
  const userCarpoolGroup = carpoolGroups.find(group => 
    group.driver?.id === user?.id || 
    group.passengers.some(p => p.id === user?.id)
  );

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get waitlist position for user
  const userWaitlistPosition = waitlist.find(entry => entry.user.id === user?.id)?.position;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{activity.name}</CardTitle>
        <CardDescription>
          <div className="flex flex-col gap-1">
            <span>{formatDate(activity.date)}</span>
            <span>Capaciteit: {registrations.length} / {activity.capacity}</span>
            {activity.requiredMaterials && (
              <div className="mt-2">
                <h4 className="font-semibold">Benodigde materialen:</h4>
                <p>{activity.requiredMaterials}</p>
              </div>
            )}
            {activity.availableFacilities && (
              <div className="mt-2">
                <h4 className="font-semibold">Beschikbare faciliteiten:</h4>
                <p>{activity.availableFacilities}</p>
              </div>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Informatie</TabsTrigger>
            <TabsTrigger value="participants" className="flex-1">Deelnemers</TabsTrigger>
            {activity.enableWaitlist && (
              <TabsTrigger value="waitlist" className="flex-1">Wachtlijst</TabsTrigger>
            )}
            {activity.enableCarpooling && (
              <TabsTrigger value="carpool" className="flex-1">Carpoolen</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="info">
            <div className="prose">
              <p>{activity.description}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="participants">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Deelnemers ({registrations.length} / {activity.capacity})</h3>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deelnemer</TableHead>
                      <TableHead>Wijk/Dorp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          {participant.anonymousParticipation
                            ? "Anonieme deelnemer"
                            : participant.displayName}
                        </TableCell>
                        <TableCell>
                          {participant.neighborhood}, {participant.village}
                        </TableCell>
                      </TableRow>
                    ))}
                    {registrations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          Nog geen deelnemers
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          {activity.enableWaitlist && (
            <TabsContent value="waitlist">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Wachtlijst ({waitlist.length})</h3>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Positie</TableHead>
                        <TableHead>Deelnemer</TableHead>
                        <TableHead>Wijk/Dorp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitlist.map((entry) => (
                        <TableRow key={entry.position}>
                          <TableCell>{entry.position}</TableCell>
                          <TableCell>
                            {entry.user.anonymousParticipation
                              ? "Anonieme deelnemer"
                              : entry.user.displayName}
                          </TableCell>
                          <TableCell>
                            {entry.user.neighborhood}, {entry.user.village}
                          </TableCell>
                        </TableRow>
                      ))}
                      {waitlist.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            Wachtlijst is leeg
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          )}
          
          {activity.enableCarpooling && (
            <TabsContent value="carpool">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Carpool Groepen</h3>
                
                {carpoolGroups.length === 0 ? (
                  <div className="text-center py-4 border rounded-md">
                    <p>Er zijn nog geen carpool groepen aangemaakt</p>
                    {isRegistered && !userCarpoolGroup && (
                      <Button 
                        className="mt-2" 
                        variant="outline"
                        onClick={() => {
                          setDepartureLocation(`${user?.neighborhood}, ${user?.village}`);
                          setShowCarpoolingOptions(true);
                        }}
                      >
                        Maak een carpool groep aan
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {carpoolGroups.map((group) => (
                      <Card key={group.id} className="border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Carpool vanaf {group.departureLocation}
                          </CardTitle>
                          <CardDescription>
                            Vertrektijd: {formatDate(group.departureTime)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="text-sm">
                            <div className="font-medium">Chauffeur:</div>
                            <div>
                              {group.driver?.displayName || "Anonieme chauffeur"} ({group.driver?.neighborhood}, {group.driver?.village})
                            </div>
                            
                            <div className="font-medium mt-2">Passagiers:</div>
                            {group.passengers.length === 0 ? (
                              <div className="text-muted-foreground">Nog geen passagiers</div>
                            ) : (
                              <ul className="list-disc list-inside">
                                {group.passengers.map((passenger) => (
                                  <li key={passenger.id}>
                                    {passenger.displayName || "Anoniem"} ({passenger.neighborhood}, {passenger.village})
                                  </li>
                                ))}
                              </ul>
                            )}
                            
                            <div className="mt-2">
                              Beschikbare plaatsen: {group.availableSeats}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          {isRegistered && !userCarpoolGroup && group.availableSeats > 0 && (
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setPickupLocation(`${user?.neighborhood}, ${user?.village}`);
                                joinCarpoolGroupMutation.mutate(group.id);
                              }}
                            >
                              Aansluiten
                            </Button>
                          )}
                          
                          {isRegistered && userCarpoolGroup?.id === group.id && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => leaveCarpoolGroupMutation.mutate(group.id)}
                            >
                              Verlaten
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                    
                    {isRegistered && !userCarpoolGroup && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          setDepartureLocation(`${user?.neighborhood}, ${user?.village}`);
                          setShowCarpoolingOptions(true);
                        }}
                      >
                        Maak een carpool groep aan
                      </Button>
                    )}
                  </div>
                )}
                
                {showCarpoolingOptions && (
                  <Dialog open={showCarpoolingOptions} onOpenChange={setShowCarpoolingOptions}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Maak een carpool groep aan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="departureLocation">Vertreklocatie</Label>
                          <Input
                            id="departureLocation"
                            value={departureLocation}
                            onChange={(e) => setDepartureLocation(e.target.value)}
                            placeholder={`${user?.neighborhood}, ${user?.village}`}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="departureTime">Vertrektijd</Label>
                          <Input
                            id="departureTime"
                            type="datetime-local"
                            value={departureTime}
                            onChange={(e) => setDepartureTime(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="seats">Aantal beschikbare plaatsen</Label>
                          <Input
                            id="seats"
                            type="number"
                            min="1"
                            max="8"
                            value={carpoolSeats}
                            onChange={(e) => setCarpoolSeats(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCarpoolingOptions(false)}>
                          Annuleren
                        </Button>
                        <Button onClick={() => {
                          createCarpoolGroupMutation.mutate();
                          setShowCarpoolingOptions(false);
                        }}>
                          Aanmaken
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {!user ? (
          <Button disabled>Log in om deel te nemen</Button>
        ) : isRegistered ? (
          <Button
            variant="destructive"
            onClick={() => unregisterMutation.mutate()}
            disabled={unregisterMutation.isPending}
          >
            {unregisterMutation.isPending ? "Bezig..." : "Uitschrijven"}
          </Button>
        ) : isWaitlisted ? (
          <div className="flex flex-col space-y-2 w-full">
            <div className="text-sm">
              Je staat op positie {userWaitlistPosition} op de wachtlijst
            </div>
            <Button
              variant="destructive"
              onClick={() => leaveWaitlistMutation.mutate()}
              disabled={leaveWaitlistMutation.isPending}
            >
              {leaveWaitlistMutation.isPending ? "Bezig..." : "Verlaat wachtlijst"}
            </Button>
          </div>
        ) : isFull ? (
          activity.enableWaitlist ? (
            <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  Plaats op wachtlijst
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Plaats op wachtlijst</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    Deze activiteit is vol. Wil je op de wachtlijst geplaatst worden?
                    Je wordt automatisch aangemeld als er een plaats vrijkomt.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowWaitlistDialog(false)}>
                    Annuleren
                  </Button>
                  <Button
                    onClick={() => joinWaitlistMutation.mutate()}
                    disabled={joinWaitlistMutation.isPending}
                  >
                    {joinWaitlistMutation.isPending ? "Bezig..." : "Plaats op wachtlijst"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button disabled>Activiteit is vol</Button>
          )
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Schrijf in</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inschrijven voor activiteit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminders"
                    checked={showReminderOption}
                    onCheckedChange={(checked: boolean) => setShowReminderOption(checked)}
                  />
                  <Label htmlFor="reminders">
                    Stuur me een herinnering 24 uur voor de activiteit
                  </Label>
                </div>
                
                {activity.enableCarpooling && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Carpool opties</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="offerCarpooling"
                        checked={offerCarpooling}
                        onCheckedChange={(checked: boolean) => {
                          setOfferCarpooling(checked as boolean);
                          if (checked) setWantCarpooling(false);
                        }}
                      />
                      <Label htmlFor="offerCarpooling">
                        Ik kan rijden (carpool aanbieden)
                      </Label>
                    </div>
                    
                    {offerCarpooling && (
                      <div className="pl-6">
                        <div className="space-y-2">
                          <Label htmlFor="carpoolSeats">Aantal beschikbare plaatsen</Label>
                          <Input
                            id="carpoolSeats"
                            type="number"
                            min="1"
                            max="8"
                            value={carpoolSeats}
                            onChange={(e) => setCarpoolSeats(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wantCarpooling"
                        checked={wantCarpooling}
                        onCheckedChange={(checked: boolean) => {
                          setWantCarpooling(checked as boolean);
                          if (checked) setOfferCarpooling(false);
                        }}
                      />
                      <Label htmlFor="wantCarpooling">
                        Ik wil graag meerijden (carpool zoeken)
                      </Label>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Bezig..." : "Bevestig inschrijving"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
