type Props = { title: string; subtitle?: string; img?: string; onClick?: () => void };

export default function MobileCard({ title, subtitle, img, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl shadow bg-card text-card-foreground overflow-hidden active:scale-[0.99] transition border border-border focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {img && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3">
        <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{subtitle}</p>}
      </div>
    </button>
  );
}
