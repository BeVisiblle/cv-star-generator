import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface ContactInfoCardProps {
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  email,
  phone,
  location,
  website
}) => {
  const hasAnyContact = email || phone || location || website;

  if (!hasAnyContact) return null;

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold">Kontaktinformationen</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a 
              href={`mailto:${email}`}
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {email}
            </a>
          </div>
        )}
        
        {phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a 
              href={`tel:${phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {phone}
            </a>
          </div>
        )}
        
        {location && (
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{location}</span>
          </div>
        )}
        
        {website && (
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a 
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {website}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
