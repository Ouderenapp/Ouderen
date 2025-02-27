import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Command as CommandPrimitive,
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
  const { data: villages = [], isLoading: isLoadingVillages } = useQuery({
    queryKey: ["villages", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const query = `
        [out:json][timeout:25];
        area["ISO3166-1"="NL"]->.netherlands;
        (
          node["place"~"city|town|village"]["name"~"${searchTerm}", i](area.netherlands);
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      });

      if (!response.ok) {
        throw new Error('Fout bij het ophalen van dorpen');
      }

      const data = await response.json();
      return data.elements
        .filter((item: any) => item.tags && item.tags.name)
        .map((item: any) => item.tags.name)
        .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index)
        .sort();
    },
    enabled: searchTerm.length >= 2
  });

  // Zoek wijken voor geselecteerd dorp
  const { data: neighborhoods = [], isLoading: isLoadingNeighborhoods } = useQuery({
    queryKey: ["neighborhoods", selectedVillage],
    queryFn: async () => {
      if (!selectedVillage) return [];

      const query = `
        [out:json][timeout:25];
        area["ISO3166-1"="NL"]->.netherlands;
        area["name"="${selectedVillage}"](area.netherlands)->.searchArea;
        (
          node["place"="suburb"](area.searchArea);
          way["place"="suburb"](area.searchArea);
          relation["place"="suburb"](area.searchArea);
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      });

      if (!response.ok) {
        throw new Error('Fout bij het ophalen van wijken');
      }

      const data = await response.json();
      return data.elements
        .filter((item: any) => item.tags && item.tags.name)
        .map((item: any) => item.tags.name)
        .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index)
        .sort();
    },
    enabled: !!selectedVillage
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
          <CommandPrimitive>
            <CommandInput 
              placeholder="Type om te zoeken..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>
              {searchTerm.length < 2 
                ? "Type minimaal 2 letters..."
                : isLoadingVillages 
                  ? "Zoeken..." 
                  : "Geen plaatsen gevonden"}
            </CommandEmpty>
            <CommandGroup>
              {villages.map((village) => (
                <CommandItem
                  key={village}
                  onSelect={() => {
                    setSelectedVillage(village);
                    setSelectedNeighborhood("");
                    setOpen(false);
                    onLocationSelect({
                      village,
                      neighborhood: "",
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
          </CommandPrimitive>
        </PopoverContent>
      </Popover>

      {selectedVillage && (
        <Popover>
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
            <CommandPrimitive>
              <CommandInput placeholder="Zoek een wijk..." />
              <CommandEmpty>
                {isLoadingNeighborhoods 
                  ? "Wijken ophalen..." 
                  : neighborhoods.length === 0
                    ? `Geen wijken gevonden in ${selectedVillage}`
                    : "Begin met typen om te zoeken..."}
              </CommandEmpty>
              <CommandGroup>
                {neighborhoods.map((neighborhood) => (
                  <CommandItem
                    key={neighborhood}
                    onSelect={() => {
                      setSelectedNeighborhood(neighborhood);
                      onLocationSelect({
                        village: selectedVillage,
                        neighborhood,
                      });
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedNeighborhood === neighborhood
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    {neighborhood}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandPrimitive>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}