import React from 'react';
import { Home, Users, Plus, MessageSquare, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { openPostComposer } from '@/lib/event-bus';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const BOTTOM_NAV_HEIGHT = 56; // Modern compact design (LinkedIn-style)

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-2xl border-t border-border/60 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] z-50 pb-safe">
      <div className="mx-auto max-w-screen-sm px-2">
        <div className="grid grid-cols-4 items-center gap-1 py-1.5">
          {/* Start */}
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-h-[48px] transition-colors duration-200",
              isActive('/dashboard')
                ? "text-foreground"
                : "text-muted-foreground/70 hover:text-muted-foreground"
            )}
            onClick={() => navigate('/dashboard')}
            aria-label="Start"
          >
            <Home className="h-6 w-6" />
            {isActive('/dashboard') && (
              <span className="w-1 h-1 rounded-full bg-foreground mt-0.5" />
            )}
            <span className="text-xs font-medium">Start</span>
          </button>

          {/* Netzwerk */}
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-h-[48px] transition-colors duration-200",
              isActive('/community/contacts')
                ? "text-foreground"
                : "text-muted-foreground/70 hover:text-muted-foreground"
            )}
            onClick={() => navigate('/community/contacts')}
            aria-label="Netzwerk"
          >
            <Users className="h-6 w-6" />
            {isActive('/community/contacts') && (
              <span className="w-1 h-1 rounded-full bg-foreground mt-0.5" />
            )}
            <span className="text-xs font-medium">Netzwerk</span>
          </button>

          {/* Plus Button - Elevated */}
          <div className="flex items-center justify-center">
            <Button 
              size="lg" 
              className="relative -top-2 rounded-full h-14 w-14 p-0 shadow-xl hover:scale-[1.05] active:scale-95 transition-transform duration-200 bg-gradient-to-br from-primary to-primary/80" 
              onClick={() => openPostComposer()} 
              aria-label="Neuer Beitrag"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </div>

          {/* Nachrichten */}
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-h-[48px] transition-colors duration-200",
              isActive('/community/messages')
                ? "text-foreground"
                : "text-muted-foreground/70 hover:text-muted-foreground"
            )}
            onClick={() => navigate('/community/messages')}
            aria-label="Nachrichten"
          >
            <MessageSquare className="h-6 w-6" />
            {isActive('/community/messages') && (
              <span className="w-1 h-1 rounded-full bg-foreground mt-0.5" />
            )}
            <span className="text-xs font-medium">Nachrichten</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
