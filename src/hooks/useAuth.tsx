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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load profile when user is authenticated - no setTimeout to avoid timing vulnerabilities
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      console.debug('Loading profile');
      
      // Use secure profile loading - users can only access their own full profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.debug('Profile query completed');

      if (error) {
        console.error('Error loading profile:', error);
        console.error('Error details:', error.details, error.hint, error.code);
        setProfile(null);
      } else {
        setProfile(profile);
        console.debug('Profile loaded');
        
        // Log profile access for security audit
        try {
          await supabase.rpc('log_security_event', {
            p_action: 'profile_access',
            p_resource_type: 'profile',
            p_resource_id: userId
          });
        } catch (auditError) {
          console.warn('Failed to log security event:', auditError);
        }
      }
    } catch (error) {
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