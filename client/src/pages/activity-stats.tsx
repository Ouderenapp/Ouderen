import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Activity, Registration, Center } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { nl } from "date-fns/locale";

export default function ActivityStatsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Haal eerst het buurthuis op voor de ingelogde admin
  const { data: center, isLoading: isLoadingCenter } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
    enabled: !!user?.id && user?.role === 'center_admin',
  });

  // Haal alle activiteiten op van dit buurthuis
  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: [`/api/activities`, { centerId: center?.id }],
    enabled: !!center?.id && !!user?.id && user?.role === 'center_admin',
  });

  // Haal alle registraties op voor deze activiteiten
  const { data: registrations, isLoading: isLoadingRegistrations } = useQuery<Registration[]>({
    queryKey: [`/api/activities/registrations`],
    enabled: !!activities?.length,
  });

  if (isLoadingActivities || isLoadingRegistrations || isLoadingCenter) {
    return (
      <div className="space-y-8">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'center_admin') {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Geen toegang</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Deze pagina is alleen toegankelijk voor buurthuisbeheerders.
        </p>
      </div>
    );
  }

  // Bereken statistieken
  const totalActivities = activities?.length || 0;
  const totalRegistrations = registrations?.length || 0;
  const averageParticipants = totalActivities > 0 ? totalRegistrations / totalActivities : 0;

  // Bereken bezettingsgraad per activiteit
  const occupancyData = activities?.map(activity => {
    const registrationsForActivity = registrations?.filter(r => r.activityId === activity.id).length || 0;
    return {
      name: activity.name,
      bezetting: (registrationsForActivity / activity.capacity) * 100
    };
  }) || [];

  // Bereken activiteiten per maand
  const monthlyData = activities?.reduce((acc: any[], activity) => {
    const month = format(parseISO(activity.date.toString()), 'MMMM', { locale: nl });
    const existingMonth = acc.find(m => m.month === month);
    if (existingMonth) {
      existingMonth.aantal += 1;
    } else {
      acc.push({ month, aantal: 1 });
    }
    return acc;
  }, []) || [];

  // Kleuren voor de grafieken
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Activiteitenstatistieken</h1>

      {/* Overzicht kaarten */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="text-lg font-medium">Totaal Activiteiten</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalActivities}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-medium">Totaal Inschrijvingen</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalRegistrations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-medium">Gemiddeld Aantal Deelnemers</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageParticipants.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bezettingsgraad grafiek */}
      <Card>
        <CardHeader className="text-xl font-bold">Bezettingsgraad per Activiteit</CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Bezetting (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="bezetting" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activiteiten per maand */}
      <Card>
        <CardHeader className="text-xl font-bold">Activiteiten per Maand</CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={monthlyData}
                  dataKey="aantal"
                  nameKey="month"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}