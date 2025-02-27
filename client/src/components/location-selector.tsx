import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVillage, setSelectedVillage] = useState(defaultVillage || "");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(defaultNeighborhood || "");

  // Zoek dorpen via Overpass API
  const { data: villages = [], isLoading } = useQuery({
    queryKey: [`/api/activities`, searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      try {
        const query = `[out:json][timeout:60];area["ISO3166-1"="NL"]->.nl;(node["place"="city"]["name"~"${searchTerm}", i](area.nl);node["place"="town"]["name"~"${searchTerm}", i](area.nl);node["place"="village"]["name"~"${searchTerm}", i](area.nl););out body;`;

        console.log('Searching for villages with query:', searchTerm);
        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: query,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        const data = await response.json();
        return data.elements
          .filter((item: any) => item.tags && item.tags.name)
          .map((item: any) => item.tags.name)
          .sort();
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },
    enabled: searchTerm.length >= 2
  });

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
            <CommandInput 
              placeholder="Type om te zoeken..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>
              {searchTerm.length < 2 
                ? "Type minimaal 2 letters..."
                : isLoading 
                  ? "Zoeken..." 
                  : "Geen plaatsen gevonden"}
            </CommandEmpty>
            <CommandGroup>
              {villages.map((village) => (
                <CommandItem
                  key={village}
                  onSelect={() => {
                    setSelectedVillage(village);
                    setSelectedNeighborhood("Centrum");
                    setOpen(false);
                    onLocationSelect({
                      village,
                      neighborhood: "Centrum"
                    });
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedVillage === village ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {village}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}