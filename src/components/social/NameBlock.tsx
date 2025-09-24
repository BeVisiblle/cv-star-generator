import { Link } from "react-router-dom";

interface NameBlockProps {
  displayName: string;
  subline?: string | null;
  companySlug?: string | null;
  userId?: string;
}

export function NameBlock({ displayName, subline, companySlug, userId }: NameBlockProps) {
  const renderSubline = () => {
    if (!subline) return null;

    // Check if subline contains " @ " and we have a company slug
    if (companySlug && subline.includes(" @ ")) {
      const parts = subline.split(" @ ");
      if (parts.length === 2) {
        return (
          <span className="text-sm text-muted-foreground">
            {parts[0]} @ 
            <Link 
              to={`/company/${companySlug}`}
              className="text-primary hover:underline ml-1"
            >
              {parts[1]}
            </Link>
          </span>
        );
      }
    }

    return (
      <span className="text-sm text-muted-foreground">
        {subline}
      </span>
    );
  };

  return (
    <div className="flex flex-col">
      {userId ? (
        <Link 
          to={`/profile/${userId}`}
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          {displayName}
        </Link>
      ) : (
        <span className="font-medium text-foreground">{displayName}</span>
      )}
      {renderSubline()}
    </div>
  );
}