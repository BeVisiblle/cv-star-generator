import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface AuthorLineProps {
  avatarUrl?: string | null;
  name: string;
  headline?: string | null;
  company?: {
    name: string;
    logo: string | null;
    href: string;
  } | null;
  showCompany?: boolean;
}

export function AuthorLine({ 
  avatarUrl, 
  name, 
  headline, 
  company, 
  showCompany = true 
}: AuthorLineProps) {
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarUrl || undefined} alt={name} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-foreground truncate">{name}</h3>
          {company && showCompany && (
            <a 
              href={company.href} 
              className="inline-flex items-center gap-1 hover:bg-muted/50 transition-colors rounded-md px-2 py-1"
            >
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                {company.logo ? (
                  <img src={company.logo} alt="" className="w-3 h-3 rounded-sm" />
                ) : (
                  <Building2 className="w-3 h-3" />
                )}
                {company.name}
              </Badge>
            </a>
          )}
        </div>
        {headline && (
          <p className="text-sm text-muted-foreground truncate">{headline}</p>
        )}
      </div>
    </div>
  );
}