
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ZoomIn } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AccessibilitySettings() {
  const { theme, toggleAccessibilityMode, setAccessibilityLevel } = useTheme();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" /> Toegankelijkheidsinstellingen
        </CardTitle>
        <CardDescription>
          Pas de weergave aan uw persoonlijke behoeften aan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="accessibility-mode">Toegankelijkheidsmodus</Label>
            <p className="text-sm text-muted-foreground">
              Schakel grotere letters en beter contrast in
            </p>
          </div>
          <Switch
            id="accessibility-mode"
            checked={theme.isAccessibilityMode}
            onCheckedChange={toggleAccessibilityMode}
          />
        </div>

        {theme.isAccessibilityMode && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size">Lettergrootte</Label>
                <span className="text-sm font-medium">
                  {theme.accessibilityLevel === 1 ? "Klein" : 
                   theme.accessibilityLevel === 2 ? "Gemiddeld" : "Groot"}
                </span>
              </div>
              <Slider
                id="font-size"
                min={1}
                max={3}
                step={1}
                value={[theme.accessibilityLevel]}
                onValueChange={(vals) => setAccessibilityLevel(vals[0])}
                className="py-2"
              />
            </div>
            
            <div className="rounded-md bg-primary/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ZoomIn className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Voorbeeldtekst</h4>
              </div>
              <p>Dit is een voorbeeld van hoe de tekst eruit zal zien met de huidige instellingen.</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Deze instellingen worden automatisch opgeslagen
        </p>
      </CardFooter>
    </Card>
  );
}
