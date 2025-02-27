
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BellRing, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Reminder } from "@shared/schema";

interface RemindersPanelProps {
  userId: number;
}

export function RemindersPanel({ userId }: RemindersPanelProps) {
  const { toast } = useToast();

  const { data: reminders, isLoading } = useQuery<Reminder[]>({
    queryKey: [`/api/users/${userId}/upcoming-reminders`],
    enabled: !!userId,
  });

  const markAsRead = useMutation({
    mutationFn: async (reminderId: number) => {
      await apiRequest("PATCH", `/api/reminders/${reminderId}`, {
        isRead: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/upcoming-reminders`] });
      toast({
        title: "Herinnering gelezen",
        description: "De herinnering is gemarkeerd als gelezen.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het markeren van de herinnering.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Laden...</div>;
  }

  if (!reminders || reminders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Herinneringen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">U heeft geen openstaande herinneringen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Herinneringen
          <Badge variant="secondary" className="ml-2">
            {reminders.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-start gap-4 rounded-lg border p-3">
              <div className="flex-1">
                <h4 className="font-semibold">{reminder.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {reminder.message}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(reminder.reminderDate), "dd MMMM yyyy")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => markAsRead.mutate(reminder.id)}
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Markeer als gelezen</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
