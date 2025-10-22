interface BranchCardProps {
  emoji: string;
  title: string;
  text: string;
}

export function BranchCard({ emoji, title, text }: BranchCardProps) {
  return (
    <div className="p-6 bg-card rounded-xl shadow-md border border-border transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-2 hover:border-primary/30 group">
      <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        {emoji}
      </div>
      <h3 className="text-2xl font-semibold mb-2 text-card-foreground transition-colors duration-200 group-hover:text-primary">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {text}
      </p>
    </div>
  );
}