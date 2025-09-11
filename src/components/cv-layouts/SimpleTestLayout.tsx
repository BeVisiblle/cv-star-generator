import React from 'react';

interface CVData {
  vorname?: string;
  nachname?: string;
  telefon?: string;
  email?: string;
}

interface CVLayoutProps {
  data: CVData;
  className?: string;
}

const SimpleTestLayout: React.FC<CVLayoutProps> = ({ data, className = '' }) => {
  return (
    <div className={`max-w-4xl mx-auto bg-white shadow-lg ${className}`} data-cv-preview>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          {data.vorname} {data.nachname}
        </h1>
        <div className="space-y-2">
          <div>E-Mail: {data.email}</div>
          <div>Telefon: {data.telefon}</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTestLayout;
