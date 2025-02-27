
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Book, Settings, Eye, Calendar, User, Building2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";

export default function HelpPage() {
  const { theme, toggleAccessibilityMode } = useTheme();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hulp & Informatie</h1>
        {!theme.isAccessibilityMode && (
          <Button variant="outline" onClick={toggleAccessibilityMode} className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <span>Activeer grotere letters</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" /> Hoe gebruikt u deze app?
          </CardTitle>
          <CardDescription>
            Hier vindt u uitleg over de belangrijkste functies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Hoe schrijf ik me in voor een activiteit?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Om deel te nemen aan een activiteit volgt u deze eenvoudige stappen:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Klik op de hoofdpagina op het gewenste buurthuis</li>
                    <li>Bekijk de beschikbare activiteiten</li>
                    <li>Klik op een activiteit voor meer informatie</li>
                    <li>Klik op de knop "Inschrijven" om deel te nemen</li>
                  </ol>
                  <p>Als de activiteit vol is, kunt u zich ook op de wachtlijst plaatsen.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Hoe gebruik ik de toegankelijkheidsmodus?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Deze app heeft speciale instellingen voor een betere leesbaarheid:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Ga naar uw profiel door op uw naam te klikken</li>
                    <li>Klik op de tab "Toegankelijkheid"</li>
                    <li>Schakel de toegankelijkheidsmodus in</li>
                    <li>Pas de lettergrootte aan naar wens</li>
                  </ol>
                  <p>U kunt ook op het "oog" pictogram in de navigatiebalk klikken om de toegankelijkheidsmodus snel in of uit te schakelen.</p>
                  <Button variant="outline" onClick={toggleAccessibilityMode} className="flex items-center gap-2 mt-4">
                    <Eye className="h-5 w-5" />
                    <span>{theme.isAccessibilityMode ? "Schakel grotere letters uit" : "Schakel grotere letters in"}</span>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>Waar vind ik mijn aankomende activiteiten?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Om uw aankomende activiteiten te bekijken:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Klik op "Mijn Profiel" in het menu</li>
                    <li>Onder de tab "Mijn Activiteiten" ziet u alle activiteiten waarvoor u zich heeft ingeschreven</li>
                    <li>U krijgt ook een herinnering een dag voordat de activiteit begint</li>
                  </ol>
                  <Link href="/profile">
                    <Button className="flex items-center gap-2 mt-4">
                      <Calendar className="h-5 w-5" />
                      <span>Bekijk mijn activiteiten</span>
                    </Button>
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" /> Veelgestelde vragen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>Zijn mijn gegevens veilig?</AccordionTrigger>
              <AccordionContent>
                Ja, uw privacy is belangrijk voor ons. U kunt in uw profiel instellen dat uw naam niet zichtbaar is voor andere deelnemers door de optie "Anonieme deelname" aan te vinken.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>Hoe kan ik me afmelden voor een activiteit?</AccordionTrigger>
              <AccordionContent>
                Ga naar uw profiel, klik op de activiteit en klik vervolgens op de knop "Afmelden". Iemand van de wachtlijst krijgt dan automatisch uw plaats.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>Kan ik zien wie er nog meer meedoet?</AccordionTrigger>
              <AccordionContent>
                Ja, op de detailpagina van een activiteit kunt u zien wie zich heeft ingeschreven, tenzij deze personen ervoor hebben gekozen om anoniem deel te nemen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger>Hoe werkt de wachtlijst?</AccordionTrigger>
              <AccordionContent>
                Als een activiteit vol is, kunt u zich op de wachtlijst plaatsen. Zodra er een plaats vrijkomt, wordt de eerste persoon op de wachtlijst automatisch ingeschreven en hiervan op de hoogte gebracht.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Snelkoppelingen
          </CardTitle>
          <CardDescription>
            Handige links om direct naar belangrijke pagina's te gaan
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/">
            <Button variant="outline" className="w-full flex items-center justify-start gap-2 text-left">
              <Building2 className="h-5 w-5" />
              <div>
                <div className="font-medium">Buurthuizen</div>
                <div className="text-sm text-muted-foreground">Bekijk alle buurthuizen</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/profile">
            <Button variant="outline" className="w-full flex items-center justify-start gap-2 text-left">
              <User className="h-5 w-5" />
              <div>
                <div className="font-medium">Mijn profiel</div>
                <div className="text-sm text-muted-foreground">Bekijk uw activiteiten en instellingen</div>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
