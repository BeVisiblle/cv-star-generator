import React from 'react';
import { Home, Users, Plus, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { openPostComposer } from '@/lib/event-bus';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export const BOTTOM_NAV_HEIGHT = 68; // Approximate height: py-1.5 + button heights

const BottomNav: React.FC = () => {
  const navigate = useNavigate();


  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50">
      <div className="mx-auto max-w-screen-sm">
        <div className="grid grid-cols-5 items-center py-1.5">
          <button
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground py-1 min-h-[44px]"
            onClick={() => navigate('/dashboard')}
            aria-label="Start"
          >
            <Home className="h-6 w-6" />
            <span className="text-[10px] font-medium">Start</span>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground py-1 min-h-[44px]"
            onClick={() => navigate('/community/contacts')}
            aria-label="Netzwerk"
          >
            <Users className="h-6 w-6" />
            <span className="text-[10px] font-medium">Netzwerk</span>
          </button>

          <div className="flex items-center justify-center">
            <Button size="lg" className="rounded-full h-12 w-12 p-0 shadow-md min-h-[48px] min-w-[48px]" onClick={() => openPostComposer()} aria-label="Neuer Beitrag">
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          <button
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground py-1 min-h-[44px]"
            onClick={() => navigate('/notifications')}
            aria-label="Mitteilungen"
          >
            <Bell className="h-6 w-6" />
            <span className="text-[10px] font-medium">Mitteilungen</span>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground py-1 min-h-[44px]"
            onClick={() => {
              const sidebar = document.querySelector('[data-sidebar="trigger"]') as HTMLElement;
              sidebar?.click();
            }}
            aria-label="Menü"
          >
            <Menu className="h-6 w-6" />
            <span className="text-[10px] font-medium">Menü</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
