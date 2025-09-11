import React from 'react';
import { Home, Users, Plus, Bell, Briefcase, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { openPostComposer } from '@/lib/event-bus';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();

  const placeholder = (label: string) => {
    toast({ title: label, description: 'Coming soon' });
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50 safe-area-pb">
      <div className="mx-auto max-w-screen-sm">
        <div className="grid grid-cols-5 items-center py-2 px-2">
          <button
            className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] rounded-lg transition-colors"
            onClick={() => navigate('/')}
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 hidden">Home</span>
          </button>

          <button
            className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] rounded-lg transition-colors"
            onClick={() => placeholder('My Network')}
            aria-label="My Network"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1 hidden">Network</span>
          </button>

          <div className="flex items-center justify-center">
            <Button 
              size="lg" 
              className="rounded-full h-12 w-12 p-0 shadow-lg hover:shadow-xl transition-all min-h-[48px] min-w-[48px]" 
              onClick={() => openPostComposer()} 
              aria-label="Create Post"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          <button
            className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] rounded-lg transition-colors"
            onClick={() => placeholder('Notifications')}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs mt-1 hidden">Alerts</span>
          </button>

          <button
            className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] rounded-lg transition-colors"
            onClick={() => placeholder('Jobs')}
            aria-label="Jobs"
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs mt-1 hidden">Jobs</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
