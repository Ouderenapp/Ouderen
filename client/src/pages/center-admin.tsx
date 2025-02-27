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

  const { data: centers } = useQuery<Center[]>({
    queryKey: ["/api/centers"],
    enabled: user?.role === 'center_admin',
  });

  const center = centers?.find(c => c.adminId === user?.id);

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities", { centerId: center?.id }],
    enabled: !!center?.id,
  });

  // Form for updating center details
  const centerForm = useForm({
    defaultValues: {
      name: center?.name || "",
      address: center?.address || "",
      description: center?.description || "",
      imageUrl: center?.imageUrl || "",
    },
  });

  const updateCenterMutation = useMutation({
    mutationFn: async (data: Partial<Center>) => {
      const response = await apiRequest("PUT", `/api/centers/${center?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/centers"] });
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

  // Form for creating new activities
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

  const createActivityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/activities", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
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

  if (user?.role !== 'center_admin') {
    return (
      <div>
        <h1 className="text-4xl font-bold">Geen toegang</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Deze pagina is alleen toegankelijk voor buurthuisbeheerders.
        </p>
      </div>
    );
  }

  if (!center) {
    return (
      <div>
        <h1 className="text-4xl font-bold">Buurthuis niet gevonden</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Er is geen buurthuis gekoppeld aan uw account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Beheer Buurthuis</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Beheer de informatie en activiteiten van {center.name}
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
              createActivityMutation.mutate({ ...data, centerId: center.id })
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