import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  variant: "talent" | "business";
}

export default function Header({ variant }: HeaderProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const RightCtas = () => (
    <div className="hidden md:flex items-center gap-2">
      <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
      {variant === "talent" ? (
        <>
          <Button asChild size="sm">
            <Link to="/onboarding">Profil erstellen – kostenlos</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/unternehmen">Für Unternehmen</Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild size="sm">
            <Link to="/unternehmen/onboarding">Unternehmen-Account erstellen</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/produkt#demo">Demo ansehen</Link>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <header className={cn("sticky top-0 z-30 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60")}
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/lovable-uploads/59fd3c9b-c2d3-4613-b2c1-1366f349e1e9.png" alt="Ausbildungsbasis Logo" className="h-8 w-8" />
            <span className="font-semibold">Ausbildungsbasis</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link 
              to="/features" 
              className={cn("hover:text-foreground", isActive("/features") && "text-foreground font-medium")}
            >
              Features
            </Link>
            <Link 
              to="/produkt" 
              className={cn("hover:text-foreground", isActive("/produkt") && "text-foreground font-medium")}
            >
              Produkt
            </Link>
            <Link 
              to="/unternehmen" 
              className={cn("hover:text-foreground", isActive("/unternehmen") && "text-foreground font-medium")}
            >
              Unternehmen
            </Link>
            <Link 
              to="/kontakt" 
              className={cn("hover:text-foreground", isActive("/kontakt") && "text-foreground font-medium")}
            >
              Kontakt
            </Link>
          </nav>
        </div>

        <RightCtas />

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menü öffnen">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-80">
              <div className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/features" 
                  className={cn("text-foreground", isActive("/features") && "font-medium")}
                >
                  Features
                </Link>
                <Link 
                  to="/produkt" 
                  className={cn("text-foreground", isActive("/produkt") && "font-medium")}
                >
                  Produkt
                </Link>
                <Link 
                  to="/unternehmen" 
                  className={cn("text-foreground", isActive("/unternehmen") && "font-medium")}
                >
                  Unternehmen
                </Link>
                <Link 
                  to="/kontakt" 
                  className={cn("text-foreground", isActive("/kontakt") && "font-medium")}
                >
                  Kontakt
                </Link>
                <hr className="my-2" />
                <Link to="/auth" className="text-foreground">Login</Link>
                {variant === "talent" ? (
                  <>
                    <Button asChild>
                      <Link to="/onboarding">Profil erstellen – kostenlos</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/unternehmen">Für Unternehmen</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild>
                      <Link to="/unternehmen/onboarding">Unternehmen-Account erstellen</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/produkt#demo">Demo ansehen</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}