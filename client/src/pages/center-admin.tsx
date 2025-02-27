import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Center, Activity, insertActivitySchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ActivityCard } from "@/components/activity-card";

export default function CenterAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Direct het buurthuis ophalen voor de ingelogde admin
  const { data: center, isLoading: isLoadingCenter } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
    enabled: !!user?.id && user?.role === 'center_admin',
  });

  // Activiteiten ophalen voor dit buurthuis
  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: [`/api/activities`, { centerId: center?.id }],
    enabled: !!center?.id,
  });

  // Form voor het bijwerken van buurthuis details
  const centerForm = useForm({
    defaultValues: {
      name: center?.name || "",
      address: center?.address || "",
      description: center?.description || "",
      imageUrl: center?.imageUrl || "",
    },
  });

  // Bijwerken van buurthuis informatie
  const updateCenterMutation = useMutation({
    mutationFn: async (data: Partial<Center>) => {
      const response = await apiRequest("PUT", `/api/centers/${center?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/centers/my-center`] });
      toast({
        title: "Buurthuis bijgewerkt",
        description: "De wijzigingen zijn succesvol opgeslagen.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij bijwerken",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form voor het aanmaken van nieuwe activiteiten
  const activityForm = useForm({
    resolver: zodResolver(insertActivitySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
      capacity: 10,
      centerId: center?.id,
    },
  });

  // Bijwerken centerId wanneer center data binnenkomt
  useEffect(() => {
    if (center?.id && !editingActivityId) {
      activityForm.setValue("centerId", center.id);
    }
  }, [center?.id]);

  // Aanmaken van nieuwe activiteit
  const createActivityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/activities", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      activityForm.reset();
      setEditingActivityId(null);
      toast({
        title: "Activiteit aangemaakt",
        description: "De activiteit is succesvol aangemaakt.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij aanmaken activiteit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bijwerken van bestaande activiteit
  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest("PUT", `/api/activities/${id}`, data);
      return response.json();
    },
    onSuccess: () => {

  {/* Render activiteiten met edit knoppen */}
  <div className="space-y-4 mt-8">
    <h2 className="text-3xl font-bold">Activiteiten beheren</h2>
    <div className="grid gap-6 md:grid-cols-2">
      {activities?.map((activity) => (
        <div key={activity.id} className="relative border rounded-lg shadow-sm p-4">
          <ActivityCard activity={activity} />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing(activity)}
            >
              Bewerken
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                /* TODO: Delete functionaliteit toevoegen */
              }}
            >
              Verwijderen
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Formulier voor activiteiten */}
  <div className="mt-8">
    <h2 className="text-3xl font-bold mb-4">
      {editingActivityId ? "Activiteit bewerken" : "Nieuwe activiteit aanmaken"}
    </h2>
    <Form {...activityForm}>
      <form
        onSubmit={activityForm.handleSubmit((data) => {
          if (editingActivityId) {
            updateActivityMutation.mutate({
              id: editingActivityId,
              data: {
                ...data,
                centerId: center?.id
              }
            });
          } else {
            createActivityMutation.mutate({
              ...data,
              centerId: center?.id
            });
          }
        })}
        className="space-y-4"
      >
        <FormField
          control={activityForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Naam</FormLabel>
              <FormControl>
                <Input placeholder="Activiteitsnaam" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={activityForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschrijving</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Beschrijf de activiteit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={activityForm.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Afbeelding URL</FormLabel>
              <FormControl>
                <Input placeholder="URL naar een afbeelding" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={activityForm.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datum en tijd</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={activityForm.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capaciteit</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Aantal deelnemers"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">
            {editingActivityId ? "Activiteit bijwerken" : "Activiteit aanmaken"}
          </Button>
          {editingActivityId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingActivityId(null);
                activityForm.reset({
                  name: "",
                  description: "",
                  imageUrl: "",
                  date: new Date().toISOString().slice(0, 16),
                  capacity: 10,
                  centerId: center?.id,
                });
              }}
            >
              Annuleren
            </Button>
          )}
        </div>
      </form>
    </Form>
  </div>

      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      activityForm.reset();
      setEditingActivityId(null);
      toast({
        title: "Activiteit bijgewerkt",
        description: "De activiteit is succesvol bijgewerkt.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij bijwerken activiteit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // State om bij te houden welke activiteit wordt bewerkt
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);

  // Functie om het bewerken van een activiteit te starten
  const startEditing = (activity: Activity) => {
    setEditingActivityId(activity.id);
    activityForm.reset({
      name: activity.name,
      description: activity.description,
      imageUrl: activity.imageUrl,
      date: new Date(activity.date).toISOString().slice(0, 16),
      capacity: activity.capacity,
      centerId: activity.centerId
    });
  };

  if (isLoadingCenter || isLoadingActivities) {
    return (
      <div className="space-y-8">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'center_admin') {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Geen toegang</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Deze pagina is alleen toegankelijk voor buurthuisbeheerders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Beheer Buurthuis</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Beheer de informatie en activiteiten van {center?.name}
        </p>
      </div>

      {/* Buurthuis informatie bewerken */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Buurthuis Informatie</h2>
        <Form {...centerForm}>
          <form
            onSubmit={centerForm.handleSubmit((data) =>
              updateCenterMutation.mutate(data)
            )}
            className="space-y-4"
          >
            <FormField
              control={centerForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={centerForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={centerForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschrijving</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={centerForm.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Afbeelding URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={updateCenterMutation.isPending}
            >
              {updateCenterMutation.isPending
                ? "Bezig met opslaan..."
                : "Wijzigingen opslaan"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Nieuwe activiteit aanmaken */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Nieuwe Activiteit</h2>
        <Form {...activityForm}>
          <form
            onSubmit={activityForm.handleSubmit((data) =>
              createActivityMutation.mutate(data)
            )}
            className="space-y-4"
          >
            <FormField
              control={activityForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={activityForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschrijving</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={activityForm.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Afbeelding URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={activityForm.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Datum en tijd</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      value={field.value ? field.value.slice(0, 16) : ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={activityForm.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capaciteit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createActivityMutation.isPending}
            >
              {createActivityMutation.isPending
                ? "Bezig met aanmaken..."
                : "Activiteit aanmaken"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Bestaande activiteiten */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Huidige Activiteiten</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {activities?.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}