import React from 'react';
import { DiscoverSection } from '@/components/community/DiscoverSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Search, ArrowRight } from 'lucide-react';

export default function Discover() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Entdecke interessante Personen und Unternehmen
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Vernetze dich mit Menschen in deiner Branche und finde spannende Unternehmen
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => window.location.href = '/discover/people'}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Alle Personen</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/discover/companies'}
              className="flex items-center space-x-2"
            >
              <Building2 className="h-4 w-4" />
              <span>Alle Unternehmen</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/jobs'}
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Jobs suchen</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interessante Personen</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktive Unternehmen</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Offene Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">342</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discover Section */}
        <DiscoverSection />

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💡 Tipps für bessere Vernetzung</CardTitle>
            <CardDescription>
              So findest du die richtigen Kontakte und baust ein starkes Netzwerk auf
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Für Kandidaten:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Vervollständige dein Profil für bessere Empfehlungen</li>
                  <li>• Vernetze dich mit Personen in deiner Branche</li>
                  <li>• Folge interessanten Unternehmen für Job-Updates</li>
                  <li>• Nutze die "Für dich" Funktion für passende Jobs</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Für Unternehmen:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Erstelle ansprechende Stellenanzeigen</li>
                  <li>• Nutze AI-Matching für Top-Kandidaten</li>
                  <li>• Vernetze dich mit Talenten in deiner Branche</li>
                  <li>• Teile interessante Inhalte über dein Unternehmen</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
