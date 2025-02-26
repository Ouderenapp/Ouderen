
import { useState, useCallback } from "react";
import { useDebounce } from "./use-debounce";

interface LocationResult {
  name: string;
  type: "village" | "neighborhood";
  parent?: string;
}

export function useLocation() {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = useCallback(async (searchQuery: string, type: "village" | "neighborhood" = "village") => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simuleer locaties ophalen
      // In een echte app zou je hier een API aanroepen
      const mockLocations = {
        village: [
          { name: "Amsterdam", type: "village" },
          { name: "Rotterdam", type: "village" },
          { name: "Utrecht", type: "village" },
          { name: "Den Haag", type: "village" },
          { name: "Eindhoven", type: "village" },
          { name: "Tilburg", type: "village" },
          { name: "Groningen", type: "village" },
          { name: "Almere", type: "village" },
          { name: "Breda", type: "village" },
          { name: "Nijmegen", type: "village" },
        ],
        neighborhood: {
          "Amsterdam": [
            { name: "Centrum", type: "neighborhood", parent: "Amsterdam" },
            { name: "Noord", type: "neighborhood", parent: "Amsterdam" },
            { name: "Oost", type: "neighborhood", parent: "Amsterdam" },
            { name: "Zuid", type: "neighborhood", parent: "Amsterdam" },
            { name: "West", type: "neighborhood", parent: "Amsterdam" },
          ],
          "Rotterdam": [
            { name: "Centrum", type: "neighborhood", parent: "Rotterdam" },
            { name: "Noord", type: "neighborhood", parent: "Rotterdam" },
            { name: "Zuid", type: "neighborhood", parent: "Rotterdam" },
            { name: "West", type: "neighborhood", parent: "Rotterdam" },
            { name: "Oost", type: "neighborhood", parent: "Rotterdam" },
          ],
          "Utrecht": [
            { name: "Binnenstad", type: "neighborhood", parent: "Utrecht" },
            { name: "Oost", type: "neighborhood", parent: "Utrecht" },
            { name: "West", type: "neighborhood", parent: "Utrecht" },
            { name: "Zuid", type: "neighborhood", parent: "Utrecht" },
            { name: "Noordwest", type: "neighborhood", parent: "Utrecht" },
          ],
          "Den Haag": [
            { name: "Centrum", type: "neighborhood", parent: "Den Haag" },
            { name: "Scheveningen", type: "neighborhood", parent: "Den Haag" },
            { name: "Loosduinen", type: "neighborhood", parent: "Den Haag" },
            { name: "Laak", type: "neighborhood", parent: "Den Haag" },
            { name: "Escamp", type: "neighborhood", parent: "Den Haag" },
          ],
          "Eindhoven": [
            { name: "Centrum", type: "neighborhood", parent: "Eindhoven" },
            { name: "Strijp", type: "neighborhood", parent: "Eindhoven" },
            { name: "Tongelre", type: "neighborhood", parent: "Eindhoven" },
            { name: "Woensel", type: "neighborhood", parent: "Eindhoven" },
            { name: "Gestel", type: "neighborhood", parent: "Eindhoven" },
          ],
        }
      };

      // Simuleer een vertraging zoals bij een echte API-aanroep
      await new Promise(resolve => setTimeout(resolve, 300));

      if (type === "village") {
        const filteredVillages = mockLocations.village.filter(loc => 
          loc.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setResults(filteredVillages);
      } else if (type === "neighborhood" && searchQuery) {
        // Als het een buurt is, zoeken we in de buurten van het gekozen dorp
        const neighborhoods = mockLocations.neighborhood[searchQuery] || [];
        setResults(neighborhoods);
      }
    } catch (err) {
      console.error("Error searching locations:", err);
      setError("Fout bij het ophalen van locaties. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useDebounce(searchLocations, 300);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: "village" | "neighborhood" = "village") => {
    debouncedSearch(e.target.value, type);
  }, [debouncedSearch]);

  return {
    searchResults: results,
    isLoading,
    error,
    handleChange,
    searchLocations
  };
}
