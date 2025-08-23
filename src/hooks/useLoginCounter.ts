import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useLoginCounter() {
  const { user } = useAuth();
  const [loginCount, setLoginCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // For now, use a simple session-based counter until database migration is complete
    const sessionKey = `login_count_${user.id}`;
    const storedCount = parseInt(localStorage.getItem(sessionKey) || '0', 10);
    const newCount = storedCount + 1;
    
    localStorage.setItem(sessionKey, newCount.toString());
    setLoginCount(newCount);
    setLoading(false);
  }, [user?.id]);

  return { loginCount, loading };
}