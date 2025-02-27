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

  // Zoek dorpen via Nominatim API
  const { data: villages = [], isLoading: isLoadingVillages } = useQuery({
    queryKey: ["villages", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&country=Netherlands&city=${encodeURIComponent(
          searchTerm
        )}&limit=5`
      );
      const data = await response.json();
      return data.map((item: any) => ({
        name: item.display_name.split(",")[0],
        lat: item.lat,
        lon: item.lon,
      }));
    },
    enabled: searchTerm.length > 2,
  });

  // Zoek wijken voor geselecteerd dorp
  const { data: neighborhoods = [], isLoading: isLoadingNeighborhoods } = useQuery({
    queryKey: ["neighborhoods", selectedVillage],
    queryFn: async () => {
      if (!selectedVillage) return [];
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&country=Netherlands&city=${encodeURIComponent(
          selectedVillage
        )}&type=suburb&limit=10`
      );
      const data = await response.json();
      return data.map((item: any) => item.display_name.split(",")[0]);
    },
    enabled: !!selectedVillage,
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
            {selectedVillage || "Selecteer een dorp"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <CommandPrimitive>
            <CommandInput
              placeholder="Zoek een dorp..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>Geen dorpen gevonden.</CommandEmpty>
            <CommandGroup>
              {villages.map((village: any) => (
                <CommandItem
                  key={village.name}
                  onSelect={() => {
                    setSelectedVillage(village.name);
                    setSelectedNeighborhood("");
                    setOpen(false);
                    onLocationSelect({
                      village: village.name,
                      neighborhood: "",
                    });
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedVillage === village.name ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {village.name}
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
              <CommandEmpty>Geen wijken gevonden.</CommandEmpty>
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
