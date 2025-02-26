
import { useState } from "react";
import { useDebounce } from "./use-debounce";

interface LocationResult {
  id: string;
  name: string;
  type: "village" | "neighborhood" | "city" | "town" | "suburb";
  displayName: string;
}

export function useLocation() {
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = async (query: string, type: "village" | "neighborhood") => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // OpenStreetMap Nominatim API
      const countryCode = "nl"; // Nederland als standaard
      const url = `https://nominatim.openstreetmap.org/search?format=json&country=${countryCode}&q=${encodeURIComponent(query)}&addressdetails=1&limit=10`;
      
      const response = await fetch(url, {
        headers: {
          // Belangrijk om een User-Agent te specificeren voor OSM API
          "User-Agent": "BuurtactiviteitenApp/1.0"
        }
      });
      
      if (!response.ok) {
        throw new Error("Kon geen locaties ophalen");
      }
      
      const data = await response.json();
      
      // Filteren op basis van type (dorp of wijk)
      const filteredResults = data
        .filter((item: any) => {
          const address = item.address || {};
          if (type === "village") {
            return address.village || address.town || address.city || address.municipality;
          } else {
            return address.suburb || address.neighbourhood || address.residential || address.quarter;
          }
        })
        .map((item: any): LocationResult => {
          const address = item.address || {};
          
          let name = "";
          let locationType: LocationResult["type"] = "city";
          
          if (type === "village") {
            name = address.village || address.town || address.city || address.municipality || item.display_name.split(",")[0];
            locationType = address.village ? "village" : (address.town ? "town" : "city");
          } else {
            name = address.suburb || address.neighbourhood || address.residential || address.quarter || item.display_name.split(",")[0];
            locationType = "neighborhood";
          }
          
          return {
            id: item.place_id.toString(),
            name,
            type: locationType,
            displayName: item.display_name
          };
        });
      
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Fout bij ophalen locaties:", err);
      setError("Fout bij ophalen locaties. Probeer het later opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useDebounce(searchLocations, 300);

  return { searchResults, isLoading, error, searchLocations: debouncedSearch };
}
