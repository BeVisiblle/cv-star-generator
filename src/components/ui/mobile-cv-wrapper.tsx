import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MobileCVWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileCVWrapper: React.FC<MobileCVWrapperProps> = ({ children, className }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={cn(
      "cv-wrapper",
      isMobile && "cv-layout-mobile",
      className
    )}>
      <div className={cn(
        "cv-container",
        isMobile && "cv-content-mobile"
      )}>
        {children}
      </div>
    </div>
  );
};