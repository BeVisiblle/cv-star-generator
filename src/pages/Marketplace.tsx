import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Marketplace = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
        <p className="text-muted-foreground mb-4">
          Der Marketplace wird gerade überarbeitet, um die neuen Datenbank-Features zu unterstützen.
        </p>
        <Button onClick={() => navigate('/')}>
          Zurück zum CV Generator
        </Button>
      </Card>
    </div>
  );
};

export default Marketplace;