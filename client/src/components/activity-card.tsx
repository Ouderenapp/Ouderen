import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import type { Activity } from "@shared/schema";
import { Calendar, Users } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useLocation } from "wouter";

interface ActivityCardProps {
  activity: Activity;
  onRegister?: () => void;
  isRegistered?: boolean;
  onEdit?: (activity: Activity) => void;
  onEditClick?: (activity: Activity) => void;
}

export function ActivityCard({ activity, onRegister, isRegistered, onEdit, onEditClick }: ActivityCardProps) {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const isFull = activity.capacity <= 0;
  const date = new Date(activity.date);
  const isAdmin = user && user.role === "center_admin";

  // Use default image if no image URL is provided
  const imageUrl = activity.imageUrl || "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img
          src={imageUrl}
          alt={activity.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-xl font-bold text-white">{activity.name}</h3>
          <p className="text-sm text-white/90">
            {format(new Date(activity.date), "PPP 'om' p")}
          </p>
        </div>
        {(onEdit || onEditClick) && user?.role === 'center_admin' && (
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(activity);
                if (onEditClick) onEditClick(activity);
              }}
            >
              Bewerken
            </Button>
          </div>
        )}
      </div>
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
          <Button asChild>
            <span>View Details</span>
          </Button>
        </Link>
        {onRegister && (
          <Button
            size="lg"
            variant={isRegistered ? "secondary" : "default"}
            onClick={onRegister}
          >
            {isRegistered ? "Annuleren" : "Aanmelden"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}