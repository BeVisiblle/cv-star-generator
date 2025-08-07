import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCompany } from "@/hooks/useCompany";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";

export function CompanyHeader() {
  const { company } = useCompany();

  return (
    <header className="h-14 flex items-center justify-between border-b bg-background px-4">
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
        
        {company && (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={company.logo_url || ""} alt={company.name} />
              <AvatarFallback>
                {company.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{company.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {company && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Coins className="h-4 w-4" />
            <span>{company.active_tokens} Tokens</span>
          </Badge>
        )}
      </div>
    </header>
  );
}