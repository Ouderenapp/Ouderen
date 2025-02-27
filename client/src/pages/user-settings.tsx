export default function UserSettings() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const form = useForm<{
    displayName: string;
    phone: string;
    village: string;
    neighborhood: string;
    anonymousParticipation: boolean;
    notificationsEnabled: boolean;
    offersCarpooling: boolean;
    wantsCarpooling: boolean;
  }>({
    defaultValues: {
      displayName: user?.displayName || "",
      phone: user?.phone || "",
      village: user?.village || "",
      neighborhood: user?.neighborhood || "",
      anonymousParticipation: user?.anonymousParticipation || false,
      notificationsEnabled: user?.notificationsEnabled !== false,
      offersCarpooling: user?.offersCarpooling || false,
      wantsCarpooling: user?.wantsCarpooling || false,
    },
  });

  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      if (!user) return;
      return apiRequest.patch(`/api/users/${user.id}`, data);
    },
    onSuccess: (response) => {
      // Update local user state
      if (response?.data && setUser) {
        setUser(response.data);
      }
      toast({
        title: "Instellingen bijgewerkt",
        description: "Je gegevens zijn succesvol bijgewerkt.",
      });
    },
  });

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Niet ingelogd</h1>
          <p className="mt-2">Je moet ingelogd zijn om je instellingen te bekijken.</p>
          <div className="mt-4">
            <Link href="/auth" className="text-primary hover:underline">
              Ga naar inloggen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = (data: any) => {
    updateUser.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Profielinstellingen</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Persoonlijke gegevens</h2>

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefoonnummer</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dorp</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wijk</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold">Privacy en Voorkeuren</h2>

            <FormField
              control={form.control}
              name="anonymousParticipation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Anonieme deelname
                    </FormLabel>
                    <FormDescription>
                      Als je deze optie inschakelt, zal je naam niet zichtbaar zijn voor andere deelnemers aan activiteiten.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notificationsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Herinneringen en notificaties
                    </FormLabel>
                    <FormDescription>
                      Schakel herinneringen in voor aankomende activiteiten en andere belangrijke meldingen.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold">Carpool voorkeuren</h2>

            <FormField
              control={form.control}
              name="offersCarpooling"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("wantsCarpooling", false);
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Ik kan rijden (carpool aanbieden)
                    </FormLabel>
                    <FormDescription>
                      Je staat open om andere buurtbewoners mee te nemen naar activiteiten.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wantsCarpooling"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("offersCarpooling", false);
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Ik wil graag meerijden (carpool zoeken)
                    </FormLabel>
                    <FormDescription>
                      Je bent op zoek naar medereizigers om samen naar activiteiten te gaan.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={updateUser.isPending} className="mt-8">
            {updateUser.isPending ? "Bezig met opslaan..." : "Instellingen opslaan"}
          </Button>
        </form>
      </Form>
    </div>
  );
}