import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export function Navigation() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4 font-medium">
          <Link href="/">
            <a className="text-lg font-bold">Samenwerken</a>
          </Link>

          <Link href="/">
            <a>Centra</a>
          </Link>

          {user && (
            <Link href="/profile">
              <a>Mijn profiel</a>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>

          {user ? (
            <Button variant="default" onClick={handleLogout}>
              Uitloggen
            </Button>
          ) : (
            <Link href="/login">
              <a>
                <Button variant="default">Inloggen</Button>
              </a>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}