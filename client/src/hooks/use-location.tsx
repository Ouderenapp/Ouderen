
import { useState, useCallback } from 'react';
import { useDebounce } from './use-debounce';

interface LocationResult {
  id: string;
  display_name: string;
  village?: string;
  neighborhood?: string;
}

export function useLocation() {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // OpenStreetMap Nominatim API
      const countryCode = "nl"; // Nederland als standaard
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&countrycodes=${countryCode}&format=json&addressdetails=1&limit=5`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BuurtActiviteitenApp'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const formattedResults = data.map((item: any) => {
        const address = item.address || {};
        
        return {
          id: item.place_id,
          display_name: item.display_name,
          village: address.village || address.town || address.city || '',
          neighborhood: address.neighbourhood || address.suburb || ''
        };
      });
      
      setResults(formattedResults);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError(err instanceof Error ? err.message : "Er is een onbekende fout opgetreden");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useDebounce(searchLocations, 500);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  return {
    query,
    results,
    isLoading,
    error,
    handleChange,
    searchLocations
  };
}
