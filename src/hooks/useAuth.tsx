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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load profile when user is authenticated
        if (session?.user && !abortController.signal.aborted) {
          setTimeout(() => {
            if (!abortController.signal.aborted) {
              loadProfile(session.user.id);
            }
          }, 500);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && !abortController.signal.aborted) {
        loadProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
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

      if (error && error.message !== 'AbortError: Fetch is aborted') {
        console.error('Error loading profile:', error);
        setProfile(null);
      } else if (!error) {
        setProfile(profile);
      }
    } catch (error: any) {
      // Ignore AbortError - it's expected when component unmounts
      if (error?.name !== 'AbortError' && error?.message !== 'Fetch is aborted') {
        console.error('Unexpected error loading profile:', error);
        setProfile(null);
      }
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