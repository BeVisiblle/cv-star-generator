import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        <div>
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/59fd3c9b-c2d3-4613-b2c1-1366f349e1e9.png" 
              alt="Ausbildungsbasis Logo" 
              className="h-8 w-8 object-contain" 
              width="32" 
              height="32"
              loading="lazy"
            />
            <span className="text-lg font-semibold">Ausbildungsbasis</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Die smarte Brücke zwischen Schülern, Azubis und Fachkräften und Unternehmen – 
            Austausch untereinander, einem AI-Matching und einer Datenbank mit vollständigen Profilen.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <img 
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
              alt="App Store" 
              className="h-10 w-auto" 
            />
            <img 
              src="https://developer.android.com/images/brand/de_generic_rgb_wo_45.png" 
              alt="Google Play" 
              className="h-10 w-auto" 
            />
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <div className="font-semibold text-foreground">Navigation</div>
          <ul className="mt-3 space-y-2">
            <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/produkt" className="hover:text-foreground">Produkt</Link></li>
            <li><Link to="/kontakt" className="hover:text-foreground">Kontakt</Link></li>
          </ul>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <div className="font-semibold text-foreground">Unternehmen</div>
          <ul className="mt-3 space-y-2">
            <li><Link to="/unternehmen" className="hover:text-foreground">Unternehmen</Link></li>
            <li><Link to="/unternehmen/onboarding" className="hover:text-foreground">Registrierung</Link></li>
            <li><Link to="/ueber-uns" className="hover:text-foreground">Über uns</Link></li>
          </ul>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <div className="font-semibold text-foreground">Rechtliches</div>
          <ul className="mt-3 space-y-2">
            <li><Link to="/impressum" className="hover:text-foreground">Impressum</Link></li>
            <li><Link to="/datenschutz" className="hover:text-foreground">Datenschutz</Link></li>
            <li><Link to="/agb" className="hover:text-foreground">AGB</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="px-4 pb-8 mx-auto max-w-7xl text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ausbildungsbasis. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}