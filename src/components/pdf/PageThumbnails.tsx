import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PageThumbnailsProps } from '@/types/groups';
import { useFilePages } from '@/hooks/useFiles';

export const PageThumbnails: React.FC<PageThumbnailsProps> = ({
  file,
  currentPage,
  onPageSelect,
}) => {
  const { data: pages = [], isLoading } = useFilePages(file.id);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {pages.map((page) => (
        <Card
          key={page.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            page.page_number === currentPage
              ? 'ring-2 ring-primary bg-primary/5'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onPageSelect(page.page_number)}
        >
          <CardContent className="p-2">
            <div className="aspect-[3/4] bg-gray-100 rounded flex items-center justify-center">
              {page.thumb_path ? (
                <img
                  src={page.thumb_path}
                  alt={`Seite ${page.page_number}`}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-xs font-medium">
                    Seite {page.page_number}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Vorschau wird geladen...
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs font-medium text-gray-700">
                Seite {page.page_number}
              </div>
              {page.text && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {page.text.substring(0, 50)}...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
