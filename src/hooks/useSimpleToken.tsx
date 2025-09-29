import { useState } from 'react';
import { useAuth } from './useAuth';

export function useSimpleToken() {
  const { user } = useAuth();
  const [unlockedProfiles, setUnlockedProfiles] = useState<Set<string>>(new Set());
  const [tokenCount, setTokenCount] = useState(1000); // Simuliere Token-Anzahl

  const useToken = async (profileId: string) => {
    console.log('🔍 Using token for profile:', profileId);

    try {
      // SCHRITT 1: Token abziehen (simuliert)
      const newTokenCount = Math.max(0, tokenCount - 1);
      setTokenCount(newTokenCount);
      
      console.log('✅ Token abgezogen:', tokenCount, '->', newTokenCount);
      
      // SCHRITT 2: Profil als freigeschaltet markieren
      setUnlockedProfiles(prev => new Set([...prev, profileId]));
      
      return { success: true };
      
    } catch (err: any) {
      console.error('❌ Error using token:', err);
      return { success: false, error: err.message };
    }
  };

  const isProfileUnlocked = (profileId: string) => {
    return unlockedProfiles.has(profileId);
  };

  return {
    useToken,
    isProfileUnlocked,
    unlockedProfiles,
    setUnlockedProfiles,
    tokenCount
  };
}
