import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Profile = () => {
  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profil</h1>
        <p className="text-muted-foreground mb-4">
          Das Profil wird gerade überarbeitet, um die neuen Datenbank-Features zu unterstützen.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Zurück zum CV Generator
        </Button>
      </Card>
    </div>
  );
};

export default Profile;