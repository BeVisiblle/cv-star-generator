import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ComingSoonProps {
  title: string;
  description?: string;
  image?: string; // public path, e.g. /images/step1-hero.jpg
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = "Dieses Feature ist bald verfügbar. Wir benachrichtigen dich gerne, sobald es live ist.",
  image = "/images/step1-hero.jpg",
}) => {
  const notify = () =>
    toast({
      title: "Benachrichtigung aktiviert",
      description: "Wir informieren dich, sobald dieses Feature live ist.",
    });

  return (
    <section className="relative w-full min-h-[60vh] rounded-lg overflow-hidden bg-muted">
      {/* Background mockup */}
      <img
        src={image}
        alt={`${title} Mockup Hintergrund`}
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        loading="lazy"
      />

      {/* Diagonal overlay text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="rotate-[-20deg] text-6xl md:text-8xl font-extrabold tracking-widest text-accent/40 select-none">
          BALD VERFÜGBAR
        </div>
      </div>

      {/* Foreground content */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col items-start gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-prose">{description}</p>
        <div className="mt-2">
          <Button onClick={notify}>Benachrichtigen, wenn verfügbar</Button>
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
