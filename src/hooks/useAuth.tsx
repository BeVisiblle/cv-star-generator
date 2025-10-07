import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  profile: any | null;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  profile: null,
  refetchProfile: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    let abortController = new AbortController();
    let loadProfileTimeout: NodeJS.Timeout | null = null;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Clear any pending profile loads
        if (loadProfileTimeout) {
          clearTimeout(loadProfileTimeout);
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        // Load profile when user is authenticated
        if (session?.user) {
          loadProfileTimeout = setTimeout(() => {
            if (!abortController.signal.aborted) {
              loadProfile(session.user.id);
            }
          }, 100);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (abortController.signal.aborted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    }).catch((error) => {
      if (error?.name !== 'AbortError') {
        console.error('Session error:', error);
      }
      setIsLoading(false);
    });

    return () => {
      if (loadProfileTimeout) {
        clearTimeout(loadProfileTimeout);
      }
      abortController.abort();
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // Silently ignore abort errors
        if (error.message.includes('aborted') || error.message.includes('Fetch is aborted')) {
          return;
        }
        console.error('Error loading profile:', error);
        setProfile(null);
      } else {
        setProfile(profile);
      }
    } catch (error: any) {
      // Silently ignore abort errors
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        return;
      }
      console.error('Unexpected error loading profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchProfile = async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      profile,
      refetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};