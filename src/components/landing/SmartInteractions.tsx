import React from 'react';

export default function SmartInteractions() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Intelligente Interaktionen
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Entdecke neue Möglichkeiten, dich zu vernetzen und mit anderen zu interagieren
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: "🤝",
            title: "Netzwerk aufbauen",
            description: "Verbinde dich mit Gleichgesinnten und erweitere dein professionelles Netzwerk"
          },
          {
            icon: "💬",
            title: "Wissen teilen",
            description: "Tausche Erfahrungen aus und lerne von anderen Fachleuten"
          },
          {
            icon: "🎯",
            title: "Matching-System",
            description: "Finde passende Jobs und Unternehmen basierend auf deinem Profil"
          }
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-card rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
