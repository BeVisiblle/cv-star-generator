import React from 'react';
import { CVContent } from './CVContent';
import { CvRendererA4 } from './CvRendererA4';
import { CvRendererMobile } from './CvRendererMobile';
import { cn } from '@/lib/utils';
import '@/styles/cv-responsive.css';
import '@/styles/cv-print.css';

interface CVExportWrapperProps {
  content: CVContent;
  variant: 'desktop' | 'mobile';
  className?: string;
}

export const CVExportWrapper: React.FC<CVExportWrapperProps> = ({ 
  content, 
  variant, 
  className 
}) => {
  if (variant === 'mobile') {
    return (
      <div className={cn('cv-root cv-narrow', className)}>
        <CvRendererMobile content={content} />
      </div>
    );
  }

  return (
    <div className={cn('cv-root cv-a4', className)}>
      <CvRendererA4 content={content} />
    </div>
  );
};