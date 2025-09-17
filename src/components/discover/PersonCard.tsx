import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, UserPlus, Bell, MapPin, Briefcase, Users, CheckCircle } from 'lucide-react';

interface PersonCardProps {
  person: {
    id: string;
    name: string;
    profileImage?: string;
    title?: string;
    company?: string;
    isVerified?: boolean;
    industry?: string;
    location?: string;
    bio?: string;
    mutualConnections?: number;
    connections?: string[];
    isConnected?: boolean;
    isFollowing?: boolean;
  };
  onConnect?: (personId: string) => void;
  onMessage?: (personId: string) => void;
  onFollow?: (personId: string) => void;
  onViewProfile?: (personId: string) => void;
}

export function PersonCard({ 
  person, 
  onConnect, 
  onMessage, 
  onFollow, 
  onViewProfile 
}: PersonCardProps) {
  const initials = person.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        {/* Profile Section */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-md">
            <AvatarImage src={person.profileImage} alt={person.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {person.name}
              </h3>
              {person.isVerified && (
                <CheckCircle className="h-5 w-5 text-blue-600" />
              )}
            </div>
            
            {/* Title and Company */}
            <div className="mb-2">
              {person.title && person.company ? (
                <p className="text-sm font-medium text-gray-700">
                  {person.title} @ {person.company}
                </p>
              ) : person.title ? (
                <p className="text-sm font-medium text-gray-700">
                  {person.title}
                </p>
              ) : null}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {person.industry && (
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                  {person.industry}
                </Badge>
              )}
              {person.isVerified && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {person.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {person.bio}
          </p>
        )}

        {/* Location */}
        {person.location && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {person.location}
          </div>
        )}

        {/* Mutual Connections */}
        {person.mutualConnections && person.mutualConnections > 0 && (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {person.mutualConnections} gemeinsame Kontakte
              </span>
            </div>
            {person.connections && person.connections.length > 0 && (
              <div className="flex -space-x-2 mt-2">
                {person.connections.slice(0, 3).map((connection, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                    title={connection}
                  >
                    {connection[0]}
                  </div>
                ))}
                {person.connections.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                    +{person.connections.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {person.isConnected ? (
            <Button 
              onClick={() => onMessage?.(person.id)}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Nachricht
            </Button>
          ) : (
            <Button 
              onClick={() => onConnect?.(person.id)}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Vernetzen
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMessage?.(person.id)}
            className="flex-shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFollow?.(person.id)}
            className="flex-shrink-0"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        {/* View Profile Link */}
        <div className="mt-3 text-center">
          <button
            onClick={() => onViewProfile?.(person.id)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Profil ansehen →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
