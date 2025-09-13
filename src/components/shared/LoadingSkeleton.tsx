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
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Logo Animation - Dein "M" Logo */}
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full relative">
          {/* Das "M" Logo mit zwei Figuren */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotateY: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
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
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Das "M" mit den beiden Figuren */}
              <motion.g
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                {/* Linke Figur (linker Strich des M) */}
                <motion.path
                  d="M30 180 L30 40 Q30 20 50 20 L50 180"
                  fill="url(#logoGradient)"
                  stroke="#06B6D4"
                  strokeWidth="1"
                  filter="url(#glow)"
                  animate={{
                    fillOpacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Linker Kopf (Kreis) */}
                <motion.circle
                  cx="40"
                  cy="30"
                  r="12"
                  fill="url(#logoGradient)"
                  stroke="#06B6D4"
                  strokeWidth="1"
                  filter="url(#glow)"
                  animate={{
                    scale: [1, 1.1, 1],
                    fillOpacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Rechte Figur (rechter Strich des M) */}
                <motion.path
                  d="M170 180 L170 40 Q170 20 150 20 L150 180"
                  fill="url(#logoGradient)"
                  stroke="#06B6D4"
                  strokeWidth="1"
                  filter="url(#glow)"
                  animate={{
                    fillOpacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
                
                {/* Rechter Kopf (Kreis) */}
                <motion.circle
                  cx="160"
                  cy="30"
                  r="12"
                  fill="url(#logoGradient)"
                  stroke="#06B6D4"
                  strokeWidth="1"
                  filter="url(#glow)"
                  animate={{
                    scale: [1, 1.1, 1],
                    fillOpacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                />

                {/* Verbindende Linien (die Arme/das V des M) */}
                <motion.path
                  d="M50 20 L100 120 L150 20"
                  fill="url(#logoGradient)"
                  stroke="#06B6D4"
                  strokeWidth="1"
                  filter="url(#glow)"
                  animate={{
                    fillOpacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />

                {/* Verbindungslinie unten (wo sich die Figuren treffen) */}
                <motion.path
                  d="M50 180 L100 120 L150 180"
                  fill="url(#logoGradient)"
                  stroke="#06B6D4"
                  strokeWidth="1"
                  filter="url(#glow)"
                  animate={{
                    fillOpacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8
                  }}
                />
              </motion.g>
            </svg>
          </motion.div>
          
          {/* Pulsierende Ringe um das Logo */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          
          <motion.div
            className="absolute inset-0 rounded-full border border-blue-300/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5
            }}
          />
        </div>
      </motion.div>

      {/* Loading Text */}
      <motion.p
        className="text-sm font-medium text-gray-600 dark:text-gray-400"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {text}
      </motion.p>
    </div>
  );
}

// Einfache Logo-Spinner Variante
export function SimpleLogoSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="w-8 h-8 relative"
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
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
          
          {/* Vereinfachtes M-Logo */}
          <motion.path
            d="M20 80 L20 30 Q20 20 30 20 L30 80 M30 20 L50 50 L70 20 M70 20 Q80 20 80 30 L80 80"
            fill="url(#simpleGradient)"
            stroke="#06B6D4"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          />
        </svg>
      </motion.div>
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