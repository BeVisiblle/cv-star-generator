import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface HeroProps {
  headlines: string[];
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  note?: string;
}

export default function Hero({ headlines, subtitle, primaryCta, secondaryCta, note }: HeroProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % headlines.length), 3500);
    return () => clearInterval(t);
  }, [headlines.length]);

  return (
    <section className="py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="min-h-[64px]">
            <AnimatePresence mode="wait">
              <motion.h1
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="text-3xl md:text-5xl font-extrabold leading-tight"
              >
                {headlines[idx]}
              </motion.h1>
            </AnimatePresence>
          </div>
          <p className="mt-4 text-muted-foreground max-w-prose">{subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href={primaryCta.href} aria-label={primaryCta.label}>{primaryCta.label}</a>
            </Button>
            {secondaryCta && (
              <Button asChild size="lg" variant="outline">
                <a href={secondaryCta.href} aria-label={secondaryCta.label}>{secondaryCta.label}</a>
              </Button>
            )}
          </div>
          {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
        </div>
        <div className="rounded-xl border bg-muted/30 aspect-[4/3] w-full" aria-hidden>
          {/* Placeholder für UI‑Mockup – kann später ersetzt werden */}
        </div>
      </div>
    </section>
  );
}
