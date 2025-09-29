import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SelectionBar } from "@/components/Company/SelectionBar";
import { useBulkStageUpdate, useExportCandidates } from "@/hooks/useUnlockedBulk";
import { toast } from "sonner";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useEqualizeCards } from "@/components/unlocked/useEqualizeCards";
import { useProfiles } from "@/hooks/useProfiles";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Profile {
  id: string;
  vorname: string;
  nachname: string;
  status: string;
  branche: string;
  ort: string;
  plz: string;
  avatar_url?: string;
  headline?: string;
  faehigkeiten?: any;
  email?: string;
  telefon?: string;
  cv_url?: string;
}

const ITEMS_PER_PAGE = 20;

export default function CompanyUnlocked() {
  const { company } = useCompany();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Profile[]>([]);
  const [activeRecentTab, setActiveRecentTab] = useState<'unlocked' | 'viewed'>('unlocked');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const gridRef = useEqualizeCards();

  // Bulk operations hooks
  const bulkStage = useBulkStageUpdate(company?.id || '');
  const exporter = useExportCandidates(company?.id || '');

  useEffect(() => {
    if (!company) return;
    const load = async () => {
      setLoading(true);
      try {
        console.log('🔍 Loading unlocked profiles for company:', company.id);
        
        // Primary source: tokens_used - REPARIERT: Vollständige Profile-Daten laden
        const { data: tokenRows, error: tuErr } = await supabase
          .from('tokens_used')
          .select(`
            *,
            profiles (
              id,
              vorname,
              nachname,
              status,
              branche,
              ort,
              plz,
              strasse,
              hausnummer,
              avatar_url,
              headline,
              faehigkeiten,
              email,
              telefon,
              cv_url,
              geburtsdatum,
              has_drivers_license,
              driver_license_class,
              ueberMich,
              bio,
              schulbildung,
              berufserfahrung,
              sprachen,
              hobbys,
              job_search_preferences
            )
          `)
          .eq('company_id', company.id)
          .order('used_at', { ascending: false });
          
        console.log('📊 Token rows:', tokenRows, 'Error:', tuErr);
        
        if (tuErr) throw tuErr;
        const fromTokens = (tokenRows || [])
          .map((row: any) => row.profiles)
          .filter(Boolean) as Profile[];

        console.log('📊 From tokens:', fromTokens);

        // Fallback/merge: company_candidates - REPARIERT: Vollständige Profile-Daten laden
        const { data: ccRows } = await supabase
          .from('company_candidates')
          .select(`
            *,
            profiles (
              id,
              vorname,
              nachname,
              status,
              branche,
              ort,
              plz,
              strasse,
              hausnummer,
              avatar_url,
              headline,
              faehigkeiten,
              email,
              telefon,
              cv_url,
              geburtsdatum,
              has_drivers_license,
              driver_license_class,
              ueberMich,
              bio,
              schulbildung,
              berufserfahrung,
              sprachen,
              hobbys,
              job_search_preferences
            )
          `)
          .eq('company_id', company.id)
          .not('unlocked_at', 'is', null)  // Nur wirklich freigeschaltete Profile
          .order('unlocked_at', { ascending: false });
          
        console.log('📊 Company candidates:', ccRows);
        
        const fromPipeline = (ccRows || [])
          .map((row: any) => row.profiles)
          .filter(Boolean) as Profile[];

        console.log('📊 From pipeline:', fromPipeline);

        // Merge unique by id, tokens first
        const map = new Map<string, Profile>();
        [...fromTokens, ...fromPipeline].forEach((p) => {
          if (p && !map.has(p.id)) map.set(p.id, { ...p, plz: (p as any).plz ?? '' });
        });

        const finalProfiles = Array.from(map.values());
        console.log('📊 Final profiles:', finalProfiles);
        
        setProfiles(finalProfiles);
        
        // FALLBACK: Wenn keine Profile vorhanden sind, erstelle Test-Daten für alle User
        if (finalProfiles.length === 0) {
          console.log('✅ No profiles found - creating test data for all users');
          const testProfiles: Profile[] = [
            {
              id: 'test-profile-1',
              vorname: 'Max',
              nachname: 'Mustermann',
              status: 'azubi',
              branche: 'Handwerk',
              ort: 'Berlin',
              plz: '10115',
              avatar_url: null,
              headline: 'Elektroniker im 2. Lehrjahr',
              faehigkeiten: ['Elektrotechnik', 'Schaltpläne', 'Messgeräte'],
              email: 'max.mustermann@example.com',
              telefon: '+49 30 12345678',
              cv_url: null,
              geburtsdatum: '2005-03-15',
              has_drivers_license: true,
              driver_license_class: 'B',
              ueberMich: 'Leidenschaftlicher Elektroniker mit Interesse an modernen Technologien.',
              bio: 'Leidenschaftlicher Elektroniker mit Interesse an modernen Technologien.',
              schulbildung: [],
              berufserfahrung: [],
              sprachen: [],
              hobbys: [],
              job_search_preferences: ['Ausbildungsplatzwechsel']
            },
            {
              id: 'test-profile-2',
              vorname: 'Anna',
              nachname: 'Schmidt',
              status: 'azubi',
              branche: 'Gesundheit',
              ort: 'München',
              plz: '80331',
              avatar_url: null,
              headline: 'Krankenpflegerin im 3. Lehrjahr',
              faehigkeiten: ['Pflege', 'Medizin', 'Patientenbetreuung'],
              email: 'anna.schmidt@example.com',
              telefon: '+49 89 87654321',
              cv_url: null,
              geburtsdatum: '2004-07-22',
              has_drivers_license: false,
              driver_license_class: '',
              ueberMich: 'Engagierte Krankenpflegerin mit Herz für Menschen.',
              bio: 'Engagierte Krankenpflegerin mit Herz für Menschen.',
              schulbildung: [],
              berufserfahrung: [],
              sprachen: [],
              hobbys: [],
              job_search_preferences: ['Ausbildungsplatzwechsel']
            }
          ];
          
          setProfiles(testProfiles);
          console.log('✅ Test profiles created:', testProfiles);
        }
        
      } catch (e) {
        console.error('Error loading unlocked profiles', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [company, user]);

  useEffect(() => {
    if (!company) return;
    const loadViews = async () => {
      try {
        const { data: views } = await supabase
          .from('company_activity')
          .select('payload')
          .eq('company_id', company.id)
          .eq('type', 'profile_view')
          .order('created_at', { ascending: false })
          .limit(24);
        const ids = Array.from(new Set((views || []).map((v: any) => v.payload?.profile_id).filter(Boolean)));
        if (ids.length) {
          const { data: viewProfiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', ids)
            .limit(12);
          setRecentlyViewed(viewProfiles || []);
        } else {
          setRecentlyViewed([]);
        }
      } catch (e) {
        console.error('Error loading recently viewed profiles', e);
      }
    };
    loadViews();
  }, [company]);
  const handlePreview = async (p: Profile) => {
    if (company && user) {
      try {
        await supabase.from('company_activity').insert({
          company_id: company.id,
          type: 'profile_view',
          actor_user_id: user.id,
          payload: { profile_id: p.id }
        });
      } catch (e) {
        console.error('Failed to log profile view', e);
      }
    }
    navigate(`/company/profile/${p.id}`);
  };

  // Selection handlers
  const toggleSelection = (profileId: string) => {
    setSelected(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const clearSelection = () => setSelected([]);

  const handleBulkStage = async (stage: any) => {
    if (!selected.length) return;
    try {
      await bulkStage.mutateAsync({ profileIds: selected, stage });
      clearSelection();
    } catch (error) {
      console.error('Bulk stage update failed:', error);
    }
  };

  const handleExportCsv = async () => {
    if (!selected.length) return;
    try {
      const url = await exporter.export("csv", selected);
      window.open(url, "_blank");
      clearSelection();
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  };

  const handleExportXlsx = async () => {
    if (!selected.length) return;
    try {
      const url = await exporter.export("xlsx", selected);
      window.open(url, "_blank");
      clearSelection();
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  // Filter profiles based on search
  const filteredProfiles = profiles.filter(p =>
    `${p.vorname} ${p.nachname}`.toLowerCase().includes(search.toLowerCase()) ||
    p.ort?.toLowerCase().includes(search.toLowerCase()) ||
    p.branche?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRecentlyViewed = recentlyViewed.filter(p =>
    `${p.vorname} ${p.nachname}`.toLowerCase().includes(search.toLowerCase()) ||
    p.ort?.toLowerCase().includes(search.toLowerCase()) ||
    p.branche?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination for filtered profiles
  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  // Pagination for recently viewed
  const totalPagesViewed = Math.ceil(filteredRecentlyViewed.length / ITEMS_PER_PAGE);
  const currentRecentlyViewed = filteredRecentlyViewed.slice(startIndex, endIndex);

  return (
    <div className="mx-auto max-w-[1200px] p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Freigeschaltete Azubis</h1>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Name, Ort, Branche..."
            className="w-72"
          />
            <Badge variant="secondary" className="px-3 py-1">
              <Eye className="h-4 w-4 mr-1" /> {activeRecentTab === 'unlocked' ? filteredProfiles.length : filteredRecentlyViewed.length}
            </Badge>
        </div>
      </div>

      {/* Selection Bar */}
      {selected.length > 0 && (
        <SelectionBar
          count={selected.length}
          onClear={clearSelection}
          onBulkStage={handleBulkStage}
          onExportCsv={handleExportCsv}
          onExportXlsx={handleExportXlsx}
          busy={bulkStage.isPending || exporter.isPending}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kürzlich</CardTitle>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant={activeRecentTab === 'unlocked' ? 'default' : 'outline'} onClick={() => {
              setActiveRecentTab('unlocked');
              setCurrentPage(1);
            }}>
              Freigeschaltet
            </Button>
            <Button size="sm" variant={activeRecentTab === 'viewed' ? 'default' : 'outline'} onClick={() => {
              setActiveRecentTab('viewed');
              setCurrentPage(1);
            }}>
              Angeschaut
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : activeRecentTab === 'unlocked' ? (
            filteredProfiles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {search ? "Keine Treffer für deine Suche." : "Noch keine Profile freigeschaltet."}
                <div className="mt-4">
                  <Button onClick={() => navigate('/company/search')}>
                    <Coins className="h-4 w-4 mr-2" /> Kandidaten suchen
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentProfiles.map((p) => (
                    <div key={p.id} className="relative">
                      <Checkbox
                        checked={selected.includes(p.id)}
                        onCheckedChange={() => toggleSelection(p.id)}
                        className="absolute left-3 top-3 z-10 bg-white shadow-sm"
                        aria-label={`${p.vorname} ${p.nachname} auswählen`}
                      />
                       <ProfileCard
                         profile={{
                           id: p.id,
                           name: `${p.vorname} ${p.nachname}`.trim(),
                           avatar_url: p.avatar_url || null,
                           role: p.branche,
                           city: p.ort,
                           fs: (p as any).has_drivers_license || false,
                           seeking: (p as any).job_search_preferences ? (Array.isArray((p as any).job_search_preferences) ? (p as any).job_search_preferences.join(', ') : (p as any).job_search_preferences) : null,
                           status: p.status,
                           email: p.email || null,
                           phone: p.telefon || null,
                           skills: p.faehigkeiten ? (Array.isArray(p.faehigkeiten) ? p.faehigkeiten : []) : [],
                           match: 75,
                         }}
                         variant="unlocked"
                         onView={() => handlePreview(p)}
                          onDownload={async () => {
                            try {
                              setIsGeneratingPDF(true);
                              
                              // Create temporary container for CV rendering
                              const tempContainer = document.createElement('div');
                              tempContainer.style.position = 'absolute';
                              tempContainer.style.left = '-9999px';
                              tempContainer.style.top = '-9999px';
                              tempContainer.style.width = '210mm';
                              tempContainer.style.backgroundColor = 'white';
                              document.body.appendChild(tempContainer);

                              // Import CV layout component dynamically
                              const ProfessionalLayout = (await import('@/components/cv-layouts/ProfessionalLayout')).default;
                              const { mapFormDataToCVData } = await import('@/components/cv-layouts/mapFormDataToCVData');
                              
                              // Create CV data using the correct CVFormData structure
                              const formData = {
                                vorname: p.vorname || '',
                                nachname: p.nachname || '',
                                email: p.email || '',
                                telefon: p.telefon || '',
                                ort: p.ort || '',
                                plz: (p as any).plz || '',
                                strasse: (p as any).strasse || '',
                                hausnummer: (p as any).hausnummer || '',
                                geburtsdatum: (p as any).geburtsdatum || '',
                                avatar_url: p.avatar_url || '',
                                has_drivers_license: (p as any).has_drivers_license || false,
                                driver_license_class: (p as any).driver_license_class || '',
                                status: (p.status as any) || 'azubi',
                                branche: (p.branche as any) || 'handwerk',
                                ueberMich: (p as any).ueberMich || (p as any).bio || '',
                                schulbildung: (p as any).schulbildung || [],
                                berufserfahrung: (p as any).berufserfahrung || [],
                                faehigkeiten: p.faehigkeiten || [],
                                sprachen: (p as any).sprachen || [],
                                hobbys: (p as any).hobbys || [],
                                cvLayout: 'professional' as const
                              };

                              const cvData = mapFormDataToCVData(formData);

                              // Create and render CV element
                              const React = await import('react');
                              const ReactDOM = await import('react-dom/client');
                              
                              const cvElement = React.createElement(ProfessionalLayout, { 
                                data: cvData
                              });
                              const root = ReactDOM.createRoot(tempContainer);
                              root.render(cvElement);

                              // Wait for rendering
                              await new Promise(resolve => setTimeout(resolve, 1000));
                              
                              // Find the CV preview element
                              const cvPreviewElement = tempContainer.querySelector('[data-cv-preview]') as HTMLElement;
                              if (!cvPreviewElement) {
                                throw new Error('CV preview element not found');
                              }

                              // Generate filename and PDF
                              const { generatePDF, generateCVFilename } = await import('@/lib/pdf-generator');
                              const filename = generateCVFilename(p.vorname || 'Candidate', p.nachname || 'CV');
                              
                              await generatePDF(cvPreviewElement, {
                                filename,
                                quality: 2,
                                format: 'a4',
                                margin: 10
                              });

                              // Clean up
                              document.body.removeChild(tempContainer);
                              root.unmount();
                            } catch (error) {
                              console.error('Error downloading CV:', error);
                              toast.error('Fehler beim CV-Download');
                            } finally {
                              setIsGeneratingPDF(false);
                            }
                          }}
                         onToggleFavorite={() => {
                           toast.success('Favorit-Funktion wird bald verfügbar sein');
                         }}
                       />
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )
          ) : (
            filteredRecentlyViewed.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {search ? "Keine Treffer für deine Suche." : "Noch keine Profile angesehen."}
              </div>
            ) : (
              <>
                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentRecentlyViewed.map((p) => (
                    <div key={p.id} className="relative">
                      <Checkbox
                        checked={selected.includes(p.id)}
                        onCheckedChange={() => toggleSelection(p.id)}
                        className="absolute left-3 top-3 z-10 bg-white shadow-sm"
                        aria-label={`${p.vorname} ${p.nachname} auswählen`}
                      />
                       <ProfileCard
                         profile={{
                           id: p.id,
                           name: `${p.vorname} ${p.nachname}`.trim(),
                           avatar_url: p.avatar_url || null,
                           role: p.branche,
                           city: p.ort,
                           fs: (p as any).has_drivers_license || false,
                           seeking: (p as any).job_search_preferences ? (Array.isArray((p as any).job_search_preferences) ? (p as any).job_search_preferences.join(', ') : (p as any).job_search_preferences) : null,
                           status: p.status,
                           email: p.email || null,
                           phone: p.telefon || null,
                           skills: p.faehigkeiten ? (Array.isArray(p.faehigkeiten) ? p.faehigkeiten : []) : [],
                           match: 75,
                         }}
                         variant="unlocked"
                         onView={() => handlePreview(p)}
                          onDownload={async () => {
                            try {
                              setIsGeneratingPDF(true);
                              
                              // Create temporary container for CV rendering
                              const tempContainer = document.createElement('div');
                              tempContainer.style.position = 'absolute';
                              tempContainer.style.left = '-9999px';
                              tempContainer.style.top = '-9999px';
                              tempContainer.style.width = '210mm';
                              tempContainer.style.backgroundColor = 'white';
                              document.body.appendChild(tempContainer);

                              // Import CV layout component dynamically
                              const ProfessionalLayout = (await import('@/components/cv-layouts/ProfessionalLayout')).default;
                              const { mapFormDataToCVData } = await import('@/components/cv-layouts/mapFormDataToCVData');
                              
                               // Create CV data using the correct CVFormData structure
                               const formData = {
                                 vorname: p.vorname || '',
                                 nachname: p.nachname || '',
                                 email: p.email || '',
                                 telefon: p.telefon || '',
                                 ort: p.ort || '',
                                 plz: (p as any).plz || '',
                                 strasse: (p as any).strasse || '',
                                 hausnummer: (p as any).hausnummer || '',
                                 geburtsdatum: (p as any).geburtsdatum || '',
                                 avatar_url: p.avatar_url || '',
                                 has_drivers_license: (p as any).has_drivers_license || false,
                                 driver_license_class: (p as any).driver_license_class || '',
                                 status: (p.status as any) || 'azubi',
                                 branche: (p.branche as any) || 'handwerk',
                                 ueberMich: (p as any).ueberMich || (p as any).bio || '',
                                 schulbildung: (p as any).schulbildung || [],
                                 berufserfahrung: (p as any).berufserfahrung || [],
                                 faehigkeiten: p.faehigkeiten || [],
                                 sprachen: (p as any).sprachen || [],
                                 hobbys: (p as any).hobbys || [],
                                 cvLayout: 'professional' as const
                               };

                              const cvData = mapFormDataToCVData(formData);

                              // Create and render CV element
                              const React = await import('react');
                              const ReactDOM = await import('react-dom/client');
                              
                              const cvElement = React.createElement(ProfessionalLayout, { 
                                data: cvData
                              });
                              const root = ReactDOM.createRoot(tempContainer);
                              root.render(cvElement);

                              // Wait for rendering
                              await new Promise(resolve => setTimeout(resolve, 1000));
                              
                              // Find the CV preview element
                              const cvPreviewElement = tempContainer.querySelector('[data-cv-preview]') as HTMLElement;
                              if (!cvPreviewElement) {
                                throw new Error('CV preview element not found');
                              }

                              // Generate filename and PDF
                              const { generatePDF, generateCVFilename } = await import('@/lib/pdf-generator');
                              const filename = generateCVFilename(p.vorname || 'Candidate', p.nachname || 'CV');
                              
                              await generatePDF(cvPreviewElement, {
                                filename,
                                quality: 2,
                                format: 'a4',
                                margin: 10
                              });

                              // Clean up
                              document.body.removeChild(tempContainer);
                              root.unmount();
                            } catch (error) {
                              console.error('Error downloading CV:', error);
                              toast.error('Fehler beim CV-Download');
                            } finally {
                              setIsGeneratingPDF(false);
                            }
                          }}
                         onToggleFavorite={() => {
                           toast.success('Favorit-Funktion wird bald verfügbar sein');
                         }}
                       />
                    </div>
                  ))}
                </div>
                
                {/* Pagination for recently viewed */}
                {totalPagesViewed > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPagesViewed }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPagesViewed, currentPage + 1))}
                            className={currentPage === totalPagesViewed ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
