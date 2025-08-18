import { Button } from "@/components/ui/button";

function ProductShowcaseSection() {
  return (
    <section className="bg-black py-24">
      <div className="container mx-auto px-6">
        
        {/* User Product Showcase */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Für Azubis, Schüler & Fachkräfte
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 rounded-full p-3 flex-shrink-0">
                    <span className="text-white text-xl">📄</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">CV Editor</h3>
                    <p className="text-white/70 text-lg">Erstelle professionelle Lebensläufe mit unseren KI-gestützten Templates und exportiere sie als PDF</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-600 rounded-full p-3 flex-shrink-0">
                    <span className="text-white text-xl">📱</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">QR-Code Profil</h3>
                    <p className="text-white/70 text-lg">Teile dein Profil einfach über QR-Code und vernetze dich spontan auf Events</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 rounded-full p-3 flex-shrink-0">
                    <span className="text-white text-xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Community</h3>
                    <p className="text-white/70 text-lg">Vernetze dich mit anderen Bewerbern und tausche Erfahrungen aus</p>
                  </div>
                </div>
              </div>
              <Button className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-full">
                Kostenfrei starten
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl p-8 border border-white/10">
                <div className="bg-white rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Mein CV</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Online</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-100 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-100 h-4 rounded w-1/2"></div>
                    <div className="bg-gray-100 h-4 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-white text-sm">Profile Views</p>
                    <p className="text-white font-bold">127</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">💼</div>
                    <p className="text-white text-sm">Job Matches</p>
                    <p className="text-white font-bold">23</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Product Showcase */}
        <div>
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="relative order-2 lg:order-1">
              <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-3xl p-8 border border-white/10">
                <div className="bg-white rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Kandidatensuche</h3>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Live</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="bg-gray-100 h-3 rounded w-2/3 mb-1"></div>
                        <div className="bg-gray-100 h-2 rounded w-1/2"></div>
                      </div>
                      <Button className="bg-orange-600 text-white px-4 py-2 text-sm">
                        Kontakt
                      </Button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="bg-gray-100 h-3 rounded w-3/4 mb-1"></div>
                        <div className="bg-gray-100 h-2 rounded w-1/3"></div>
                      </div>
                      <Button className="bg-orange-600 text-white px-4 py-2 text-sm">
                        Kontakt
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="text-white text-sm">Token verfügbar</p>
                    <p className="text-white font-bold">45</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">📈</div>
                    <p className="text-white text-sm">Erfolgsquote</p>
                    <p className="text-white font-bold">89%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8 order-1 lg:order-2">
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Für Unternehmen
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-600 rounded-full p-3 flex-shrink-0">
                    <span className="text-white text-xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Kandidatensuche</h3>
                    <p className="text-white/70 text-lg">Finde gezielt die besten Talente mit unserem intelligenten Matching-System</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-red-600 rounded-full p-3 flex-shrink-0">
                    <span className="text-white text-xl">🪙</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Token-System</h3>
                    <p className="text-white/70 text-lg">Bezahle nur für erfolgreiche Kontakte - faire und transparente Abrechnung</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-600 rounded-full p-3 flex-shrink-0">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Analytics</h3>
                    <p className="text-white/70 text-lg">Detaillierte Einblicke in deine Recruiting-Performance und Erfolgsraten</p>
                  </div>
                </div>
              </div>
              <Button className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-full">
                Demo starten
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default ProductShowcaseSection;