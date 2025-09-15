import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
  className?: string;
}

// Neue Logo-Animation Komponente mit deinem "M" Logo
interface LogoSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LogoSpinner({ 
  size = 'md', 
  className = '',
  text = 'Lädt...'
}: LogoSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Statisches Logo - keine Animation */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definition des Blau-Gradients */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="30%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>

          {/* Das "M" Logo - statisch */}
          <g>
            {/* Linke Figur (linker Strich des M) */}
            <path
              d="M30 180 L30 40 Q30 20 50 20 L50 180"
              fill="url(#logoGradient)"
              stroke="#06B6D4"
              strokeWidth="1"
            />
            
            {/* Linker Kopf (Kreis) */}
            <circle
              cx="40"
              cy="30"
              r="12"
              fill="url(#logoGradient)"
              stroke="#06B6D4"
              strokeWidth="1"
            />

            {/* Rechte Figur (rechter Strich des M) */}
            <path
              d="M170 180 L170 40 Q170 20 150 20 L150 180"
              fill="url(#logoGradient)"
              stroke="#06B6D4"
              strokeWidth="1"
            />
            
            {/* Rechter Kopf (Kreis) */}
            <circle
              cx="160"
              cy="30"
              r="12"
              fill="url(#logoGradient)"
              stroke="#06B6D4"
              strokeWidth="1"
            />

            {/* Verbindende Linien (die Arme/das V des M) */}
            <path
              d="M50 20 L100 120 L150 20"
              fill="url(#logoGradient)"
              stroke="#06B6D4"
              strokeWidth="1"
            />

            {/* Verbindungslinie unten (wo sich die Figuren treffen) */}
            <path
              d="M50 180 L100 120 L150 180"
              fill="url(#logoGradient)"
              stroke="#06B6D4"
              strokeWidth="1"
            />
          </g>
        </svg>
      </div>

      {/* Loading Text */}
      <p className={`text-sm font-medium ${className.includes('text-white') ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
        {text}
      </p>

      {/* Blauer Ladebalken */}
      <div className={`w-32 h-1 ${className.includes('text-white') ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'} rounded-full overflow-hidden`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </div>
  );
}

// Einfache Logo-Spinner Variante - statisch mit Ladebalken
export function SimpleLogoSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Statisches Logo */}
      <div className="w-8 h-8">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="simpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>
          
          {/* Vereinfachtes M-Logo - statisch */}
          <path
            d="M20 80 L20 30 Q20 20 30 20 L30 80 M30 20 L50 50 L70 20 M70 20 Q80 20 80 30 L80 80"
            fill="url(#simpleGradient)"
            stroke="#06B6D4"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Kleiner Ladebalken */}
      <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </div>
  );
}

/**
 * Reusable loading skeleton for cards and lists
 * @param rows - Number of skeleton rows to show (default: 3)
 * @param showAvatar - Whether to show avatar placeholder (default: true)
 * @param className - Additional CSS classes
 */
export function LoadingSkeleton({ 
  rows = 3, 
  showAvatar = true, 
  className = '' 
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="rounded-xl border p-3">
          <div className="flex items-center gap-3">
            {showAvatar && <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />}
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}