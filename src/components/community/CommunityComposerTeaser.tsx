import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Calendar, FileText, BarChart3, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import CommunityComposer from './CommunityComposer';

interface CommunityComposerTeaserProps {
  onOpenComposer: () => void;
}

export default function CommunityComposerTeaser({ onOpenComposer }: CommunityComposerTeaserProps) {
  const { user } = useAuth();
  const { company } = useCompany();
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('text');

  const postTypes = [
    { 
      id: 'text', 
      label: 'Bild/Video', 
      icon: Image, 
      description: 'Teile Bilder oder Videos' 
    },
    { 
      id: 'event', 
      label: 'Event', 
      icon: Calendar, 
      description: 'Veranstaltung ankündigen' 
    },
    { 
      id: 'document', 
      label: 'Dokument', 
      icon: FileText, 
      description: 'Teile ein Dokument' 
    },
    { 
      id: 'poll', 
      label: 'Umfrage', 
      icon: BarChart3, 
      description: 'Erstelle eine Umfrage' 
    },
    { 
      id: 'job', 
      label: 'Job', 
      icon: Briefcase, 
      description: 'Stelle teilen' 
    },
  ];

  const handlePostTypeClick = (typeId: string) => {
    setActiveTab(typeId === 'text' ? 'media' : typeId);
    setComposerOpen(true);
  };

  return (
    <>
      <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              className="flex-1 justify-start text-muted-foreground hover:text-foreground"
              onClick={() => handlePostTypeClick('text')}
            >
              Was möchten Sie posten?
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {postTypes.map((type) => {
              const Icon = type.icon;
              const isDisabled = type.id === 'job' && !company;
              
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => handlePostTypeClick(type.id)}
                  disabled={isDisabled}
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <CommunityComposer 
        open={composerOpen} 
        onOpenChange={setComposerOpen}
        initialTab={activeTab}
      />
    </>
  );
}