import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "wouter";
import type { Center } from "@shared/schema";

interface CenterCardProps {
  center: Center;
}

export function CenterCard({ center }: CenterCardProps) {
  return (
    <Link href={`/centers/${center.id}`}>
      <a className="block transition-transform hover:scale-[1.02]">
        <Card className="overflow-hidden">
          <img
            src={center.imageUrl}
            alt={center.name}
            className="h-48 w-full object-cover"
          />
          <CardHeader className="text-2xl font-bold">{center.name}</CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">{center.address}</p>
            <p className="mt-2 text-lg">{center.description}</p>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
