"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  activityId: number;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ price, onSuccess, onCancel }: Omit<PaymentFormProps, 'activityId'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
      });

      if (error) {
        toast({
          title: "Fout bij betalen",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Betaling geslaagd",
          description: "Je bent nu ingeschreven voor de activiteit",
        });
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Fout bij betalen",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <div className="flex gap-4 mt-4">
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            onCancel();
          }}
          disabled={loading}
        >
          Annuleren
        </Button>
        <Button type="submit" disabled={loading || !stripe || !elements}>
          {loading ? "Bezig met betalen..." : `Betalen €${(price / 100).toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

export function PaymentForm({ activityId, price, onSuccess, onCancel }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize payment on the server
    const initializePayment = async () => {
      try {
        const response = await fetch(`/api/activities/${activityId}/payment`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Er is een fout opgetreden");
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (err: any) {
        toast({
          title: "Fout bij initialiseren betaling",
          description: err.message,
          variant: "destructive",
        });
        onCancel();
      }
    };

    initializePayment();
  }, [activityId]);

  if (!clientSecret) {
    return <div>Laden...</div>;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Betaling</h3>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
          },
        }}
      >
        <CheckoutForm
          price={price}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </Card>
  );
}