import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  variant: "talent" | "business";
}

export default function Header({ variant }: HeaderProps) {
  const RightCtas = () => (
    <div className="hidden md:flex items-center gap-2">
      <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
      {variant === "talent" ? (
        <>
          <Button asChild size="sm">
            <Link to="/cv-generator">Jetzt CV erstellen</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/unternehmen">Für Unternehmen</Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild size="sm">
            <Link to="/company/posts">Stelle posten</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/company/search">Kandidaten entdecken</Link>
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
            <Link to="/" className="hover:text-foreground">Start</Link>
            <Link to="/unternehmen" className="hover:text-foreground">Unternehmen</Link>
            <Link to="/preise" className="hover:text-foreground">Preise</Link>
            <Link to="/ueber-uns" className="hover:text-foreground">Über uns</Link>
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
                <Link to="/" className="text-foreground">Start</Link>
                <Link to="/unternehmen" className="text-foreground">Unternehmen</Link>
                <Link to="/preise" className="text-foreground">Preise</Link>
                <Link to="/ueber-uns" className="text-foreground">Über uns</Link>
                <hr className="my-2" />
                <Link to="/auth" className="text-foreground">Login</Link>
                {variant === "talent" ? (
                  <>
                    <Button asChild>
                      <Link to="/cv-generator">Jetzt CV erstellen</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/unternehmen">Für Unternehmen</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild>
                      <Link to="/company/posts">Stelle posten</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/company/search">Kandidaten entdecken</Link>
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
