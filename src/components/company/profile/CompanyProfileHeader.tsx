import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Camera, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyProfileHeaderProps {
  company: {
    id: string;
    name: string;
    logo_url?: string | null;
    header_image?: string | null;
    description?: string | null;
    main_location?: string | null;
    industry?: string | null;
  };
  isOwner: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onCoverUpload?: () => void;
  onLogoUpload?: () => void;
}

export function CompanyProfileHeader({ 
  company, 
  isOwner, 
  isFollowing = false,
  onFollow,
  onCoverUpload,
  onLogoUpload
}: CompanyProfileHeaderProps) {
  return (
    <>
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 lg:h-80 w-full">
        <img 
          src={company.header_image || "/placeholder.svg"} 
          alt={`${company.name} Cover`}
          className="w-full h-full object-cover"
        />
        {isOwner && onCoverUpload && (
          <Button 
            variant="secondary" 
            size="sm"
            className="absolute top-4 right-4"
            onClick={onCoverUpload}
          >
            <Camera className="h-4 w-4 mr-2" />
            Cover ändern
          </Button>
        )}
      </div>
      
      {/* Logo & Info Section */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative">
        <div className="flex flex-col items-center">
          {/* Logo (overlapping) */}
          <div className="relative">
            <Avatar className="h-32 w-32 ring-4 ring-background shadow-lg">
              <AvatarImage src={company.logo_url || undefined} />
              <AvatarFallback className="text-3xl">{company.name[0]}</AvatarFallback>
            </Avatar>
            {isOwner && onLogoUpload && (
              <Button 
                variant="secondary" 
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full h-10 w-10"
                onClick={onLogoUpload}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Company Name */}
          <h1 className="text-3xl font-bold mt-4 text-center">
            {company.name}
          </h1>
          
          {/* Tagline / Summary */}
          <p className="text-muted-foreground text-center mt-2 max-w-2xl">
            {company.description?.slice(0, 150) || "Innovative Lösungen für die Zukunft"}
          </p>
          
          {/* Location & Industry */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            {company.main_location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {company.main_location}
              </div>
            )}
            {company.industry && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {company.industry}
              </div>
            )}
          </div>
          
          {/* Follow Button (for non-owners) */}
          {!isOwner && onFollow && (
            <Button onClick={onFollow} className="mt-4" variant={isFollowing ? 'secondary' : 'default'}>
              {isFollowing ? (
                'Gefolgt'
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Folgen
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
