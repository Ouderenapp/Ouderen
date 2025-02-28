import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Center, Activity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActivityCard } from "@/components/activity-card";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function CenterAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState(null);

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

  // Simpele submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!center?.id) return;

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      date: formData.get('date'),
      capacity: parseInt(formData.get('capacity') as string) || 10,
      centerId: center.id,
      imageUrl: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    };

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Kon activiteit niet aanmaken');
      }

      // Refresh de activiteiten lijst
      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      toast({ title: "Activiteit aangemaakt" });

      // Reset het formulier
      e.target.reset();
    } catch (error) {
      toast({ 
        title: "Fout",
        description: "Kon activiteit niet aanmaken",
        variant: "destructive"
      });
    }
  };

  if (isLoadingCenter || isLoadingActivities) {
    return <div>Laden...</div>;
  }

  if (!user || user.role !== 'center_admin') {
    return <div>Geen toegang</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Beheer Buurthuis</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Beheer de informatie en activiteiten van {center?.name}
        </p>
      </div>

      {/* Nieuwe activiteit aanmaken - versimpelde versie */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Nieuwe Activiteit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Naam</label>
            <Input name="name" required />
          </div>

          <div>
            <label>Beschrijving</label>
            <Textarea name="description" required />
          </div>

          <div>
            <label>Datum en tijd</label>
            <Input name="date" type="datetime-local" required />
          </div>

          <div>
            <label>Capaciteit</label>
            <Input name="capacity" type="number" defaultValue="10" required />
          </div>

          <Button type="submit" className="w-full">
            Activiteit aanmaken
          </Button>
        </form>
      </div>

      {/* Bestaande activiteiten */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Huidige Activiteiten</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {activities?.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={setEditingActivity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}