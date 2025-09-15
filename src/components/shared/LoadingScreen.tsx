import { LogoSpinner } from './LoadingSkeleton';

interface LoadingScreenProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ 
  text = 'Lädt...', 
  size = 'lg', 
  className = '',
  fullScreen = true 
}: LoadingScreenProps) {
  const containerClasses = fullScreen 
    ? 'flex items-center justify-center min-h-screen' 
    : 'flex items-center justify-center py-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <LogoSpinner size={size} text={text} className={className} />
    </div>
  );
}

// Spezielle Varianten für häufige Anwendungsfälle
export function AuthLoadingScreen() {
  return <LoadingScreen text="Authentifizierung..." size="xl" />;
}

export function PageLoadingScreen() {
  return <LoadingScreen text="Seite wird geladen..." size="lg" />;
}

export function DataLoadingScreen() {
  return <LoadingScreen text="Daten werden geladen..." size="md" fullScreen={false} />;
}
