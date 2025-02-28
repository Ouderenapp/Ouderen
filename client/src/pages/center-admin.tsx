import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Center, Activity, insertActivitySchema, updateActivitySchema } from "@shared/schema";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";

export default function CenterAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

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

  // Nieuwe activiteit aanmaken
  const createActivityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/activities", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      activityForm.reset();
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

  // Form voor nieuwe activiteiten
  const activityForm = useForm({
    resolver: zodResolver(insertActivitySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      date: new Date().toISOString().slice(0, 16),
      capacity: 10,
      centerId: center?.id,
      materialsNeeded: "",
      facilitiesAvailable: ""
    },
  });

  // Form voor het bewerken van activiteiten
  const editActivityForm = useForm({
    resolver: zodResolver(updateActivitySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      date: "",
      capacity: 0,
    }
  });

  // Bijwerken van een activiteit
  const updateActivityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/activities/${editingActivity?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      setEditingActivity(null);
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

  // Open het bewerken dialog met de geselecteerde activiteit
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    editActivityForm.reset({
      name: activity.name,
      description: activity.description,
      imageUrl: activity.imageUrl,
      date: new Date(activity.date).toISOString().slice(0, 16),
      capacity: activity.capacity,
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
          <form onSubmit={activityForm.handleSubmit((data) => {
            if (!center?.id) return;
            createActivityMutation.mutate({
              ...data,
              centerId: center.id
            });
          })} className="space-y-4">
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
            <FormField
              control={activityForm.control}
              name="materialsNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benodigde materialen</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={activityForm.control}
              name="facilitiesAvailable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschikbare faciliteiten</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {createActivityMutation.isPending ? "Bezig..." : "Activiteit aanmaken"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Bestaande activiteiten */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Huidige Activiteiten</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {activities?.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={handleEditActivity}
            />
          ))}
        </div>
      </div>

      {/* Dialog voor het bewerken van een activiteit */}
      <Dialog open={!!editingActivity} onOpenChange={(open) => !open && setEditingActivity(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Activiteit bewerken</DialogTitle>
          </DialogHeader>
          <Form {...editActivityForm}>
            <form
              className="space-y-4"
              onSubmit={editActivityForm.handleSubmit((data) => updateActivityMutation.mutate(data))}
            >
              <FormField
                control={editActivityForm.control}
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
                control={editActivityForm.control}
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
                control={editActivityForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Afbeelding URL (optioneel)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editActivityForm.control}
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
                control={editActivityForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capaciteit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingActivity(null)}
                >
                  Annuleren
                </Button>
                <Button
                  type="submit"
                  disabled={updateActivityMutation.isPending}
                >
                  {updateActivityMutation.isPending ? "Bezig met opslaan..." : "Opslaan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}