interface FeatureProps {
  icon: string;
  title: string;
  desc: string;
}

export function Feature({ icon, title, desc }: FeatureProps) {
  return (
    <div className="p-6 bg-card rounded-xl shadow-md border border-border">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-xl font-semibold mb-1 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}