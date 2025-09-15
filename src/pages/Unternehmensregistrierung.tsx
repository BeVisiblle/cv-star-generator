import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import CompanyOnboarding from '@/pages/Company/Onboarding';

const Unternehmensregistrierung = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <Header variant="business" />
      
      {/* Main Content - Company Onboarding with black background */}
      <main className="bg-black text-white pt-8 pb-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Unternehmensprofil erstellen
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Erstellen Sie Ihr Firmenprofil und finden Sie passende Kandidaten in wenigen Minuten.
            </p>
          </div>
          
          {/* Embed the onboarding component with dark styling */}
          <div className="bg-zinc-900 rounded-2xl p-6 shadow-2xl">
            <CompanyOnboarding />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Unternehmensregistrierung;