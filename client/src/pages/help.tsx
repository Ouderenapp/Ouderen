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
            <Book className="h-8 w-8 text-primary" /> Hoe gebruikt u deze app?
          </CardTitle>
          <CardDescription className="text-xl">
            Hier vindt u uitleg over de belangrijkste functies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border-2 rounded-lg">
              <AccordionTrigger className="text-2xl p-4">
                Hoe schrijf ik me in voor een activiteit?
              </AccordionTrigger>
              <AccordionContent className="p-6">
                <div className="space-y-6">
                  <p className="text-xl">Om deel te nemen aan een activiteit volgt u deze eenvoudige stappen:</p>
                  <ol className="list-decimal pl-8 space-y-4 text-xl">
                    <li>Klik op de hoofdpagina op het gewenste buurthuis</li>
                    <li>Bekijk de beschikbare activiteiten</li>
                    <li>Klik op een activiteit voor meer informatie</li>
                    <li>Klik op de grote knop "Inschrijven" om deel te nemen</li>
                  </ol>
                  <p className="text-xl">Als de activiteit vol is, kunt u zich ook op de wachtlijst plaatsen.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-2 rounded-lg">
              <AccordionTrigger className="text-2xl p-4">
                Hoe maak ik de tekst groter?
              </AccordionTrigger>
              <AccordionContent className="p-6">
                <div className="space-y-6">
                  <p className="text-xl">U kunt de tekst groter maken voor betere leesbaarheid:</p>
                  <ol className="list-decimal pl-8 space-y-4 text-xl">
                    <li>Zoek de knop met het oog-icoontje rechtsboven in het scherm</li>
                    <li>Klik één keer op deze knop</li>
                    <li>De tekst wordt nu direct groter</li>
                    <li>Klik nogmaals op de knop om terug te gaan naar normale grootte</li>
                  </ol>
                  <Button variant="outline" onClick={toggleAccessibilityMode} className="flex items-center gap-2 mt-4 text-xl">
                    <Eye className="h-6 w-6" />
                    <span>{theme.isAccessibilityMode ? "Kleinere letters" : "Grotere letters"}</span>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-2 rounded-lg">
              <AccordionTrigger className="text-2xl p-4">
                Waar vind ik mijn activiteiten?
              </AccordionTrigger>
              <AccordionContent className="p-6">
                <div className="space-y-6">
                  <p className="text-xl">Om uw aankomende activiteiten te bekijken:</p>
                  <ol className="list-decimal pl-8 space-y-4 text-xl">
                    <li>Klik op "Mijn Profiel" in het menu</li>
                    <li>U ziet direct al uw activiteiten</li>
                    <li>U krijgt een herinnering een dag van tevoren</li>
                  </ol>
                  <Link href="/profile">
                    <Button className="flex items-center gap-2 mt-4 text-xl">
                      <Calendar className="h-6 w-6" />
                      <span>Bekijk mijn activiteiten</span>
                    </Button>
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <Euro className="h-8 w-8 text-primary" /> Kosten & Lidmaatschap
          </CardTitle>
          <CardDescription className="text-xl">
            Informatie over prijzen en betalingen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="kosten-1" className="border-2 rounded-lg">
              <AccordionTrigger className="text-2xl p-4">
                Wat kost deelname aan activiteiten?
              </AccordionTrigger>
              <AccordionContent className="p-6">
                <div className="space-y-6">
                  <p className="text-xl">De kosten verschillen per activiteit:</p>
                  <ul className="list-disc pl-8 space-y-4 text-xl">
                    <li>Gratis activiteiten: kennismaking en sociale bijeenkomsten</li>
                    <li>Betaalde activiteiten: workshops, cursussen en speciale evenementen</li>
                    <li>Lidmaatschap: €5 per maand voor onbeperkt toegang tot alle basis-activiteiten</li>
                  </ul>
                  <p className="text-xl mt-4">Bij elke activiteit staat duidelijk aangegeven wat de kosten zijn.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="kosten-2" className="border-2 rounded-lg">
              <AccordionTrigger className="text-2xl p-4">
                Hoe werkt betalen?
              </AccordionTrigger>
              <AccordionContent className="p-6">
                <div className="space-y-6">
                  <p className="text-xl">U kunt op verschillende manieren betalen:</p>
                  <ul className="list-disc pl-8 space-y-4 text-xl">
                    <li>Direct online via iDEAL of creditcard</li>
                    <li>Contant bij het buurthuis (alleen voor losse activiteiten)</li>
                    <li>Automatische incasso voor het maandelijkse lidmaatschap</li>
                  </ul>
                  <p className="text-xl mt-4">U ontvangt altijd een bevestiging van uw betaling per e-mail.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="kosten-3" className="border-2 rounded-lg">
              <AccordionTrigger className="text-2xl p-4">
                Wat zijn de voordelen van lidmaatschap?
              </AccordionTrigger>
              <AccordionContent className="p-6">
                <div className="space-y-6">
                  <p className="text-xl">Als lid krijgt u extra voordelen:</p>
                  <ul className="list-disc pl-8 space-y-4 text-xl">
                    <li>Gratis deelname aan alle basis-activiteiten</li>
                    <li>Korting op speciale workshops en evenementen</li>
                    <li>Voorrang bij populaire activiteiten</li>
                    <li>Maandelijkse nieuwsbrief met exclusieve activiteiten</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
        </CardContent>
      </Card>
    </div>
  );
}