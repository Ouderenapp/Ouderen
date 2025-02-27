import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Statische lijst van Nederlandse steden en dorpen
const DUTCH_PLACES = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Groningen",
  "Tilburg",
  "Almere",
  "Breda",
  "Nijmegen",
  "Enschede",
  "Haarlem",
  "Arnhem",
  "Zaanstad",
  "Amersfoort",
  "Apeldoorn",
  "Nijmegen",
  "Enschede",
  "Haarlem",
  "Den Bosch",
  "Zwolle",
  "Maastricht",
  "Leiden",
  "Dordrecht",
  "Zoetermeer",
  "Delft",
  "Alkmaar",
  "Hilversum",
  "Oss",
  "Amstelveen"
].sort();

// Standaard wijken die voor elke stad/dorp beschikbaar zijn
const DEFAULT_NEIGHBORHOODS = [
  "Centrum",
  "Noord",
  "Zuid",
  "Oost",
  "West",
  "Nieuw-West",
  "Zuidoost",
  "Noordwest",
  "Zuidwest",
  "Buitengebied"
].sort();

type LocationData = {
  village: string;
  neighborhood: string;
};

interface LocationSelectorProps {
  onLocationSelect: (location: LocationData) => void;
  defaultVillage?: string;
  defaultNeighborhood?: string;
}

export function LocationSelector({ onLocationSelect, defaultVillage, defaultNeighborhood }: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [openNeighborhood, setOpenNeighborhood] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState(defaultVillage || "");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(defaultNeighborhood || "");

  return (
    <div className="flex flex-col gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedVillage || "Selecteer een plaats"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Zoek een plaats..." />
            <CommandEmpty>Geen plaatsen gevonden</CommandEmpty>
            <CommandGroup>
              {DUTCH_PLACES.map((place) => (
                <CommandItem
                  key={place}
                  onSelect={() => {
                    setSelectedVillage(place);
                    setSelectedNeighborhood("");
                    setOpen(false);
                    onLocationSelect({
                      village: place,
                      neighborhood: ""
                    });
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedVillage === place ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {place}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedVillage && (
        <Popover open={openNeighborhood} onOpenChange={setOpenNeighborhood}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="justify-between"
            >
              {selectedNeighborhood || "Selecteer een wijk"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Zoek een wijk..." />
              <CommandEmpty>Geen wijken gevonden</CommandEmpty>
              <CommandGroup>
                {DEFAULT_NEIGHBORHOODS.map((neighborhood) => (
                  <CommandItem
                    key={neighborhood}
                    onSelect={() => {
                      setSelectedNeighborhood(neighborhood);
                      setOpenNeighborhood(false);
                      onLocationSelect({
                        village: selectedVillage,
                        neighborhood
                      });
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedNeighborhood === neighborhood ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {neighborhood}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}