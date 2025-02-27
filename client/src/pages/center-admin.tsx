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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import type { z } from "zod";

type FormData = z.infer<typeof insertActivitySchema>;

export default function CenterAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const { data: center, isLoading: isLoadingCenter } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
    enabled: !!user?.id && user?.role === 'center_admin',
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: [`/api/activities`, { centerId: center?.id }],
    enabled: !!center?.id,
  });

  // Form voor het aanmaken van nieuwe activiteiten
  const activityForm = useForm<FormData>({
    resolver: zodResolver(insertActivitySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      date: new Date().toISOString().slice(0, 16),
      capacity: 10,
      centerId: center?.id,
    },
  });

  // Aanmaken van nieuwe activiteit
  const createActivityMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!center?.id) {
        throw new Error("Geen buurthuis ID gevonden");
      }
      const response = await apiRequest("POST", "/api/activities", {
        ...data,
        centerId: center.id,
      });
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

  // Handle form submission
  const handleSubmitActivity = async (data: FormData) => {
    try {
      await createActivityMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Beheer Buurthuis</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Beheer de informatie en activiteiten van {center?.name}
        </p>
      </div>

      {/* Nieuwe activiteit aanmaken */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Nieuwe Activiteit</h2>
        <Form {...activityForm}>
          <form
            onSubmit={activityForm.handleSubmit(handleSubmitActivity)}
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
                  <FormLabel>Afbeelding URL (optioneel)</FormLabel>
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
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={handleEditActivity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}