import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PaymentForm } from "@/components/payment-form";
import { apiRequest } from "@/lib/queryClient";
import type { Activity } from "@shared/schema";

export default function ActivityDetails() {
  const [params] = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPayment, setShowPayment] = useState(false);

  const { data: activity } = useQuery<Activity>({
    queryKey: [`/api/activities/${params.id}`],
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!activity) return;
      
      // If activity is free, register directly
      if (!activity.price) {
        const response = await apiRequest(
          "POST",
          `/api/activities/${activity.id}/register`,
          { userId: activity.id }
        );
        return response.json();
      }
      
      // If activity has a price, show payment form
      setShowPayment(true);
    },
    onSuccess: () => {
      if (!activity?.price) {
        queryClient.invalidateQueries({ queryKey: [`/api/activities/${params.id}`] });
        toast({
          title: "Succesvol ingeschreven",
          description: "Je bent nu ingeschreven voor deze activiteit",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij inschrijven",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegistration = () => {
    if (!activity) return;
    registerMutation.mutate();
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    queryClient.invalidateQueries({ queryKey: [`/api/activities/${params.id}`] });
  };

  if (!activity) {
    return <div>Laden...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">{activity.name}</h1>
        <p className="mb-4">{activity.description}</p>
        
        <div className="mb-4">
          <p>Datum: {new Date(activity.date).toLocaleString()}</p>
          <p>Capaciteit: {activity.capacity}</p>
          {activity.price && (
            <p>Prijs: €{(activity.price / 100).toFixed(2)}</p>
          )}
        </div>

        {showPayment && activity.price ? (
          <PaymentForm
            activityId={activity.id}
            price={activity.price}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPayment(false)}
          />
        ) : (
          <Button
            onClick={handleRegistration}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? "Bezig met inschrijven..."
              : "Inschrijven"}
          </Button>
        )}
      </Card>
    </div>
  );
}
