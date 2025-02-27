import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import type { Activity } from "@shared/schema";
import { Calendar } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  onRegister?: () => void;
  isRegistered?: boolean;
  actionButton?: React.ReactNode;
}

export function ActivityCard({ activity, onRegister, isRegistered, actionButton }: ActivityCardProps) {
  const date = new Date(activity.date);

  return (
    <Card className="overflow-hidden">
      <img
        src={activity.imageUrl}
        alt={activity.name}
        className="h-48 w-full object-cover"
      />
      <CardHeader className="text-2xl font-bold">{activity.name}</CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-lg text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <time dateTime={date.toISOString()}>
            {format(date, "EEEE, MMMM d 'at' h:mm a")}
          </time>
        </div>
        <p className="mt-4 text-lg">{activity.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/activities/${activity.id}`}>
          <a className="text-lg font-medium text-primary hover:underline">
            View Details
          </a>
        </Link>
        <div className="flex space-x-2">
          {actionButton}
          {onRegister && (
            <Button
              size="lg"
              variant={isRegistered ? "secondary" : "default"}
              onClick={onRegister}
            >
              {isRegistered ? "Annuleren" : "Aanmelden"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
