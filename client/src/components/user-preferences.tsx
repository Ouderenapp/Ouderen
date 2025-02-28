import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { queryClient } from "@/lib/queryClient";

const CATEGORIES = [
  { id: 'sport', label: 'Sport' },
  { id: 'cultuur', label: 'Cultuur' },
  { id: 'educatie', label: 'Educatie' },
  { id: 'sociaal', label: 'Sociaal' },
  { id: 'creatief', label: 'Creatief' },
  { id: 'gezondheid', label: 'Gezondheid' },
  { id: 'overig', label: 'Overig' }
];

export function UserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    user?.preferences?.categories || []
  );

  const updatePreferencesMutation = useMutation({
    mutationFn: async (categories: string[]) => {
      const response = await fetch(`/api/users/${user?.id}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories,
          interests: user?.preferences?.interests || [],
          mobilityNeeds: user?.preferences?.mobilityNeeds || false,
          preferredTimes: user?.preferences?.preferredTimes || []
        })
      });
      
      if (!response.ok) {
        throw new Error('Kon voorkeuren niet bijwerken');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/recommended`] });
      toast({ title: "Voorkeuren bijgewerkt" });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon voorkeuren niet bijwerken",
        variant: "destructive"
      });
    }
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked 
        ? [...prev, category]
        : prev.filter(c => c !== category)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferencesMutation.mutate(selectedCategories);
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Mijn Voorkeuren</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="font-medium">Interessegebieden</label>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <label htmlFor={category.id}>{category.label}</label>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={updatePreferencesMutation.isPending}>
          {updatePreferencesMutation.isPending ? "Bezig..." : "Voorkeuren opslaan"}
        </Button>
      </form>
    </div>
  );
}
