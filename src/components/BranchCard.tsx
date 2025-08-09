interface BranchCardProps {
  emoji: string;
  title: string;
  text: string;
}

export function BranchCard({ emoji, title, text }: BranchCardProps) {
  return (
    <div className="p-4 sm:p-5 md:p-6 bg-card rounded-xl shadow-md border border-border">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-2xl font-semibold mb-2 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}