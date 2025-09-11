import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Eye, Target, Zap } from 'lucide-react';
import { CV_LAYOUTS, LayoutInfo } from './LayoutRegistry';

interface LayoutSelectorProps {
  selectedLayout: number;
  onLayoutSelect: (layoutId: number) => void;
  onPreview?: (layoutId: number) => void;
  className?: string;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  selectedLayout,
  onLayoutSelect,
  onPreview,
  className = ''
}) => {
  const [previewLayout, setPreviewLayout] = useState<number | null>(null);

  const handlePreview = (layoutId: number) => {
    setPreviewLayout(layoutId);
    onPreview?.(layoutId);
  };

  const getLayoutIcon = (layout: LayoutInfo) => {
    switch (layout.key) {
      case 'handwerk-classic':
        return '🔧';
      case 'pflege-clear':
        return '🏥';
      case 'azubi-start':
        return '🎓';
      case 'service-sales':
        return '💼';
      case 'logistik-production':
        return '🚛';
      case 'ats-compact':
        return '📄';
      default:
        return '📋';
    }
  };

  const getLayoutColor = (layout: LayoutInfo) => {
    switch (layout.key) {
      case 'handwerk-classic':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'pflege-clear':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'azubi-start':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'service-sales':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'logistik-production':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'ats-compact':
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Wähle dein CV-Layout
        </h2>
        <p className="text-gray-600">
          Professionelle, branchenspezifische Layouts für optimale Bewerbungserfolge
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CV_LAYOUTS.map((layout) => (
          <Card
            key={layout.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedLayout === layout.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-md'
            } ${getLayoutColor(layout)}`}
            onClick={() => onLayoutSelect(layout.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getLayoutIcon(layout)}</span>
                  <CardTitle className="text-lg">{layout.name}</CardTitle>
                </div>
                {selectedLayout === layout.id && (
                  <Check className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <CardDescription className="text-sm">
                {layout.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Target Audience */}
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-2">
                  <Target className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Zielgruppe:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {layout.targetAudience.map((audience, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  <Zap className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Features:</span>
                </div>
                <div className="space-y-1">
                  {layout.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      • {feature}
                    </div>
                  ))}
                  {layout.features.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{layout.features.length - 3} weitere
                    </div>
                  )}
                </div>
              </div>

              {/* Layout Type & ATS */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={layout.layout === 'single' ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {layout.layout === 'single' ? 'Einspaltig' : 
                     layout.layout === 'two-column' ? 'Zweispaltig' : 'Timeline'}
                  </Badge>
                  {layout.atsCompatible && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      ATS-Safe
                    </Badge>
                  )}
                </div>
              </div>

              {/* Preview Button */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(layout.id);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Vorschau
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Layout Preview Modal would go here */}
      {previewLayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Vorschau: {CV_LAYOUTS.find(l => l.id === previewLayout)?.name}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewLayout(null)}
                >
                  Schließen
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Layout-Vorschau wird hier angezeigt</p>
                <p className="text-sm">Implementierung der Live-Vorschau folgt</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutSelector;
