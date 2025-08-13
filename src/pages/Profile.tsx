import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit3, MapPin, Mail, Phone, Briefcase, GraduationCap, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, isLoading } = useAuth();

  // Mock data for demonstration - replace with real data from profile
  const mockExperience = [
    {
      title: "Senior Software Developer",
      company: "Tech Company GmbH",
      period: "2022 - Present",
      location: "Berlin, Deutschland",
      description: "Entwicklung von Web-Applikationen mit React und TypeScript"
    },
    {
      title: "Frontend Developer",
      company: "Digital Agency",
      period: "2020 - 2022",
      location: "Hamburg, Deutschland",
      description: "UI/UX Entwicklung für verschiedene Kunden"
    }
  ];

  const mockEducation = [
    {
      degree: "Bachelor of Science Informatik",
      school: "Technische Universität Berlin",
      period: "2016 - 2020",
      grade: "1.8"
    }
  ];

  const mockSkills = [
    "React", "TypeScript", "JavaScript", "HTML/CSS", "Node.js", 
    "Python", "Git", "Agile", "Scrum", "UI/UX Design"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 py-6">
        <Card className="p-6 text-center rounded-xl shadow-md">
          <h1 className="text-lg font-semibold mb-4">Willkommen!</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Erstellen Sie jetzt Ihren ersten Lebenslauf, um von Unternehmen gefunden zu werden.
          </p>
          <Button onClick={() => navigate('/cv-generator')}>
            Jetzt Lebenslauf erstellen
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first profile layout with full-width cards */}
      <div className="px-4 py-6 space-y-4 max-w-md mx-auto sm:max-w-2xl">
        
        {/* Profile Header Card */}
        <Card className="rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url} alt={`${profile.vorname} ${profile.nachname}`} />
                <AvatarFallback className="text-lg">
                  {profile.vorname?.[0]}{profile.nachname?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {profile.vorname} {profile.nachname}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {profile.berufserfahrung?.[0]?.position || "Software Developer"}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {profile.ort || "Berlin, Deutschland"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Users className="h-4 w-4 mr-2" />
                Vernetzen
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Nachricht
              </Button>
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* About/Info Card */}
        <Card className="rounded-xl shadow-md">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-3">Über mich</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.uebermich || "Leidenschaftlicher Software-Entwickler mit über 5 Jahren Erfahrung in der Entwicklung von Web-Applikationen. Spezialisiert auf React, TypeScript und moderne Frontend-Technologien."}
            </p>
          </div>
        </Card>

        {/* Experience Card */}
        <Card className="rounded-xl shadow-md">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Berufserfahrung</h2>
            </div>
            <div className="space-y-4">
              {mockExperience.map((exp, index) => (
                <div key={index} className="border-l-2 border-border pl-4 pb-4 last:pb-0">
                  <h3 className="text-sm font-medium text-foreground">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground mb-2">{exp.period} • {exp.location}</p>
                  <p className="text-sm text-muted-foreground">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Education Card */}
        <Card className="rounded-xl shadow-md">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Ausbildung</h2>
            </div>
            <div className="space-y-4">
              {mockEducation.map((edu, index) => (
                <div key={index} className="border-l-2 border-border pl-4">
                  <h3 className="text-sm font-medium text-foreground">{edu.degree}</h3>
                  <p className="text-sm text-muted-foreground">{edu.school}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.period} • Note: {edu.grade}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Skills Card */}
        <Card className="rounded-xl shadow-md">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Fähigkeiten & Kenntnisse</h2>
            <div className="flex flex-wrap gap-2">
              {mockSkills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-3 py-1 rounded-full"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Contact Info Card */}
        <Card className="rounded-xl shadow-md">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Kontaktinformationen</h2>
            <div className="space-y-3">
              {profile.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{profile.email}</span>
                </div>
              )}
              {profile.telefon && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{profile.telefon}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {profile.ort || "Berlin, Deutschland"}
                </span>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Profile;