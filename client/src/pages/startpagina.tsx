import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { Heart, Users, CalendarDays, Clock, MapPin, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function Startpagina() {
  const { theme } = useTheme();

  const features = [
    {
      title: "Ontdek activiteiten",
      description: "Vind activiteiten in jouw buurt die aansluiten bij je interesses.",
      icon: CalendarDays,
    },
    {
      title: "Ontmoet anderen",
      description: "Leer nieuwe mensen kennen en breid je sociale netwerk uit.",
      icon: Users,
    },
    {
      title: "Blijf actief",
      description: "Houd je lichaam en geest gezond door deel te nemen aan diverse activiteiten.",
      icon: Heart,
    },
  ];

  const upcomingActivities = [
    {
      id: 1,
      title: "Samen Koken",
      location: "Buurthuis De Eendracht",
      time: "14:00 - 16:00",
      date: "Morgen",
    },
    {
      id: 2,
      title: "Wandelclub",
      location: "Stadspark Centrum",
      time: "09:30 - 11:00",
      date: "Woensdag",
    },
    {
      id: 3,
      title: "Kaartavond",
      location: "Gemeenschapshuis Het Anker",
      time: "19:00 - 21:30",
      date: "Vrijdag",
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero sectie */}
      <section className="relative -mt-8 h-[500px] overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-[url('/images/samenactief-logo.svg')] bg-center opacity-10"></div>
        <div className="container mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            Welkom bij SamenActief
          </h1>
          <p className="mb-8 max-w-2xl text-xl">
            Het platform waar senioren gemakkelijk activiteiten kunnen vinden en deelnemen. 
            Blijf actief, ontmoet nieuwe mensen en maak deel uit van de gemeenschap.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/">
              <Button size="lg" className="min-w-[180px] text-lg" data-accessibility-mode={theme.isAccessibilityMode}>
                Bekijk activiteiten
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" size="lg" className="min-w-[180px] border-white bg-transparent text-lg text-white hover:bg-white hover:text-indigo-700" data-accessibility-mode={theme.isAccessibilityMode}>
                Hoe werkt het?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Welkom tekstgedeelte */}
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Uw nieuwe sociale platform
          </h2>
          <p className="text-lg text-muted-foreground">
            SamenActief is speciaal ontwikkeld voor senioren die op zoek zijn naar activiteiten 
            en sociale contacten in hun buurt. Ons doel is om het zo gemakkelijk mogelijk 
            te maken om deel te nemen aan activiteiten die aansluiten bij uw interesses.
          </p>
        </div>
      </section>

      {/* Features sectie */}
      <section className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="mb-2 rounded-full bg-primary/10 p-3 text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Komende activiteiten sectie */}
      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Komende activiteiten</h2>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-1" data-accessibility-mode={theme.isAccessibilityMode}>
              Bekijk alles <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Carousel className="mx-auto max-w-5xl">
          <CarouselContent>
            {upcomingActivities.map((activity) => (
              <CarouselItem key={activity.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{activity.title}</CardTitle>
                    <CardDescription>{activity.date}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.time}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" data-accessibility-mode={theme.isAccessibilityMode}>
                      Meer info
                    </Button>
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 pt-4">
            <CarouselPrevious className="static" />
            <CarouselNext className="static" />
          </div>
        </Carousel>
      </section>

      {/* CTA Sectie */}
      <section className="container mx-auto bg-muted px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Klaar om mee te doen?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Word lid van SamenActief en ontdek alle activiteiten in jouw buurt.
          </p>
          <Link href="/auth">
            <Button size="lg" className="min-w-[200px]" data-accessibility-mode={theme.isAccessibilityMode}>
              Nu aanmelden
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
} 