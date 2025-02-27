import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Book, Settings, Eye, Calendar, User, Building2, Euro } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";

export default function HelpPage() {
  const { theme, toggleAccessibilityMode } = useTheme();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Hulp & Informatie</h1>
        {!theme.isAccessibilityMode && (
          <Button variant="outline" onClick={toggleAccessibilityMode} className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <span>Activeer grotere letters</span>
          </Button>
        )}
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <HelpCircle className="h-8 w-8 text-primary" /> Veelgestelde vragen
          </CardTitle>
          <CardDescription className="text-xl">
            Antwoorden op de meest voorkomende vragen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg p-2">
              <AccordionTrigger className="text-xl px-4">Hoe schrijf ik me in voor een activiteit?</AccordionTrigger>
              <AccordionContent className="text-lg px-4 pt-2">
                U kunt zich inschrijven voor activiteiten door naar de pagina van een buurthuis te gaan, een activiteit te selecteren en op de knop "Inschrijven" te klikken. U moet ingelogd zijn om te kunnen inschrijven.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border rounded-lg p-2">
              <AccordionTrigger className="text-xl px-4">Kan ik mijn inschrijving annuleren?</AccordionTrigger>
              <AccordionContent className="text-lg px-4 pt-2">
                Ja, u kunt uw inschrijving annuleren door naar uw profiel te gaan en op de knop "Uitschrijven" te klikken bij de betreffende activiteit.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border rounded-lg p-2">
              <AccordionTrigger className="text-xl px-4">Hoe werkt de wachtlijst?</AccordionTrigger>
              <AccordionContent className="text-lg px-4 pt-2">
                Als een activiteit vol is, komt u op de wachtlijst. Als er een plek vrijkomt, wordt de eerste persoon op de wachtlijst automatisch geïnformeerd.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <Book className="h-8 w-8 text-primary" /> Handleiding
          </CardTitle>
          <CardDescription className="text-xl">
            Leer hoe u de applicatie kunt gebruiken
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Voor deelnemers</h3>
            <ul className="list-disc pl-6 space-y-2 text-lg">
              <li>Bekijk beschikbare buurthuizen en hun activiteiten</li>
              <li>Schrijf u in voor activiteiten die u interesseren</li>
              <li>Beheer uw profiel en privacy-instellingen</li>
              <li>Bekijk uw aankomende activiteiten in uw profiel</li>
            </ul>
          </div>
          {user?.role === 'center_admin' && (
            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="text-xl font-semibold">Voor beheerders</h3>
              <ul className="list-disc pl-6 space-y-2 text-lg">
                <li>Beheer uw buurthuis en activiteiten</li>
                <li>Voeg nieuwe activiteiten toe of bewerk bestaande</li>
                <li>Bekijk inschrijvingen voor activiteiten</li>
                <li>Beheer wachtlijsten</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <Settings className="h-8 w-8 text-primary" /> Snelkoppelingen
          </CardTitle>
          <CardDescription className="text-xl">
            Handige links om direct naar belangrijke pagina's te gaan
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/">
            <Button variant="outline" className="w-full flex items-center justify-start gap-4 p-6 text-xl">
              <Building2 className="h-8 w-8" />
              <div>
                <div className="font-medium">Buurthuizen</div>
                <div className="text-muted-foreground">Bekijk alle buurthuizen</div>
              </div>
            </Button>
          </Link>

          <Link href="/profile">
            <Button variant="outline" className="w-full flex items-center justify-start gap-4 p-6 text-xl">
              <User className="h-8 w-8" />
              <div>
                <div className="font-medium">Mijn profiel</div>
                <div className="text-muted-foreground">Bekijk uw activiteiten</div>
              </div>
            </Button>
          </Link>

          {user?.role === 'center_admin' && (
            <Link href="/admin">
              <Button variant="outline" className="w-full flex items-center justify-start gap-4 p-6 text-xl">
                <Calendar className="h-8 w-8" />
                <div>
                  <div className="font-medium">Beheer</div>
                  <div className="text-muted-foreground">Beheer uw buurthuis</div>
                </div>
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}