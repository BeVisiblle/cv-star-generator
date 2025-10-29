import React from 'react';
import { Home, Users, Plus, Bell, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { openPostComposer } from '@/lib/event-bus';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const BOTTOM_NAV_HEIGHT = 72; // Updated height for new design

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/90 to-background/80 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-50">
      <div className="mx-auto max-w-screen-sm px-2">
        <div className="grid grid-cols-5 items-center gap-1 py-2.5">
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-h-[56px] transition-all duration-300 ease-out",
              isActive('/dashboard')
                ? "bg-foreground text-background rounded-full px-5 py-2 shadow-lg scale-[1.02]"
                : "text-muted-foreground hover:bg-muted/40 hover:rounded-full px-3 py-2"
            )}
            onClick={() => navigate('/dashboard')}
            aria-label="Start"
          >
            <Home className="h-6 w-6" />
            <span className={cn(
              "text-[11px]",
              isActive('/dashboard') ? "font-semibold" : "font-medium"
            )}>
              Start
            </span>
          </button>

          <button
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-h-[56px] transition-all duration-300 ease-out",
              isActive('/community/contacts')
                ? "bg-foreground text-background rounded-full px-5 py-2 shadow-lg scale-[1.02]"
                : "text-muted-foreground hover:bg-muted/40 hover:rounded-full px-3 py-2"
            )}
            onClick={() => navigate('/community/contacts')}
            aria-label="Netzwerk"
          >
            <Users className="h-6 w-6" />
            <span className={cn(
              "text-[11px]",
              isActive('/community/contacts') ? "font-semibold" : "font-medium"
            )}>
              Netzwerk
            </span>
          </button>

          <div className="flex items-center justify-center">
            <Button 
              size="lg" 
              className="rounded-full h-14 w-14 p-0 shadow-lg hover:scale-[1.05] active:scale-95 transition-transform duration-200 min-h-[56px] min-w-[56px]" 
              onClick={() => openPostComposer()} 
              aria-label="Neuer Beitrag"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </div>

          <button
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-h-[56px] transition-all duration-300 ease-out",
              isActive('/notifications')
                ? "bg-foreground text-background rounded-full px-5 py-2 shadow-lg scale-[1.02]"
                : "text-muted-foreground hover:bg-muted/40 hover:rounded-full px-3 py-2"
            )}
            onClick={() => navigate('/notifications')}
            aria-label="Mitteilungen"
          >
            <Bell className="h-6 w-6" />
            <span className={cn(
              "text-[11px]",
              isActive('/notifications') ? "font-semibold" : "font-medium"
            )}>
              Mitteilungen
            </span>
          </button>

          <button
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-h-[56px] transition-all duration-300 ease-out",
              "text-muted-foreground hover:bg-muted/40 hover:rounded-full px-3 py-2"
            )}
            onClick={() => {
              const sidebar = document.querySelector('[data-sidebar="trigger"]') as HTMLElement;
              sidebar?.click();
            }}
            aria-label="Menü"
          >
            <Menu className="h-6 w-6" />
            <span className="text-[11px] font-medium">Menü</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
