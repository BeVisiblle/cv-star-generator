import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, GraduationCap, BookOpen, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { GroupCardProps } from '@/types/groups';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const typeIcons = {
  course: GraduationCap,
  exam: BookOpen,
  profession: Briefcase,
};

const typeLabels = {
  course: 'Kurs',
  exam: 'Prüfung',
  profession: 'Beruf',
};

const visibilityLabels = {
  public: 'Öffentlich',
  private: 'Privat',
  hidden: 'Versteckt',
};

const visibilityColors = {
  public: 'bg-green-100 text-green-800',
  private: 'bg-yellow-100 text-yellow-800',
  hidden: 'bg-gray-100 text-gray-800',
};

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onJoin,
  onLeave,
  showActions = true,
}) => {
  const TypeIcon = typeIcons[group.type];
  const isMember = group.member_count && group.member_count > 0;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TypeIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{group.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {group.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className={visibilityColors[group.visibility]}>
              {visibilityLabels[group.visibility]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {typeLabels[group.type]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="space-y-3">
          {/* Group Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {group.school && (
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                <span className="truncate">{group.school}</span>
              </div>
            )}
            {group.course_code && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{group.course_code}</span>
              </div>
            )}
            {group.region && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{group.region}</span>
              </div>
            )}
          </div>

          {/* Member Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.member_count || 0} Mitglieder</span>
          </div>

          {/* Last Activity */}
          {group.last_activity && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Aktiv vor {formatDistanceToNow(new Date(group.last_activity), { 
                  addSuffix: true, 
                  locale: de 
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Button asChild variant="outline" className="flex-1">
              <Link to={`/groups/${group.id}`}>
                Ansehen
              </Link>
            </Button>
            {isMember ? (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onLeave?.(group.id)}
              >
                Verlassen
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={() => onJoin?.(group.id)}
              >
                Beitreten
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
