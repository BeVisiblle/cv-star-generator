import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Industry {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_soft: boolean;
}

interface DocumentType {
  slug: string;
  name: string;
}

interface Requirement {
  skill_id: string;
  level_required: number;
  must_have: boolean;
  is_soft: boolean;
}

interface LanguageReq {
  lang: string;
  min_cefr: string;
  must_have: boolean;
}

interface DocReq {
  document_slug: string;
  must_have: boolean;
  nice_to_have: boolean;
}

function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-muted">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-1 text-muted-foreground hover:text-foreground">
          ×
        </button>
      )}
    </span>
  );
}

export default function JobAdBuilder() {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { toast } = useToast();
  const [tab, setTab] = useState('basis');
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);

  const [form, setForm] = useState({
    id: '',
    company_id: company?.id || '',
    industry_id: '',
    title: '',
    job_family: '',
    job_role: '',
    seniority: 'ausbildung',
    contract_type: 'ausbildung',
    work_pattern: 'vor_ort',
    shifts: [] as string[],
    postal_code: '',
    location_lat: '',
    location_lng: '',
    start_window_earliest: '',
    start_window_latest: '',
    compensation_min: '',
    compensation_max: '',
    comp_unit: 'ausbildungsjahr',
    training_offered: { einarbeitung_weeks: 4, mentor_program: true },
    upskilling_paths: [] as string[],
    company_fit_tags: [] as string[],
    requirements: [] as Requirement[],
    language_requirements: [{ lang: 'DE', min_cefr: 'B1', must_have: true }] as LanguageReq[],
    certs_required: [] as any[],
    documents: [] as DocReq[],
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (company?.id) {
      set('company_id', company.id);
    }
  }, [company]);

  // Load reference data
  useEffect(() => {
    (async () => {
      const { data: ind } = await supabase.from('industry').select('id,name').order('name');
      const { data: sk } = await supabase.from('skill').select('id,name,slug,category,is_soft');
      const { data: dt } = await supabase.from('document_type').select('slug,name');
      setIndustries(ind || []);
      setSkills(sk || []);
      setDocTypes(dt || []);
    })();
  }, []);

  // Preset: skills & docs je Branche
  const industryPreset = useMemo(
    () => ({
      skills: (industryId: string) => {
        const selectedIndustryName = industries.find((i) => i.id === industryId)?.name?.toLowerCase();
        return skills
          .filter((s) => s.category === selectedIndustryName && !s.is_soft)
          .slice(0, 12)
          .map((s) => ({ skill_id: s.id, level_required: 1, must_have: false, is_soft: false }));
      },
      documents: (industryId: string) => {
        const indName = industries.find((i) => i.id === industryId)?.name?.toLowerCase() || '';
        if (indName.includes('pflege'))
          return [
            { document_slug: 'lebenslauf', must_have: true, nice_to_have: false },
            { document_slug: 'gesundheitszeugnis', must_have: false, nice_to_have: true },
          ];
        if (indName.includes('logistik'))
          return [
            { document_slug: 'lebenslauf', must_have: true, nice_to_have: false },
            { document_slug: 'fuehrerschein_B', must_have: false, nice_to_have: true },
          ];
        return [{ document_slug: 'lebenslauf', must_have: true, nice_to_have: false }];
      },
    }),
    [industries, skills]
  );

  function applyIndustryPreset(id: string) {
    const r = industryPreset.skills(id);
    const d = industryPreset.documents(id);
    set('requirements', r);
    set('documents', d);
  }

  function addRequirement(skill: Skill | undefined) {
    if (!skill) return;
    if (form.requirements.some((r) => r.skill_id === skill.id)) return;
    set('requirements', [
      ...form.requirements,
      { skill_id: skill.id, level_required: 1, must_have: false, is_soft: !!skill.is_soft },
    ]);
  }

  function addDocument(slug: string) {
    if (!slug) return;
    if (form.documents.some((d) => d.document_slug === slug)) return;
    set('documents', [...form.documents, { document_slug: slug, must_have: false, nice_to_have: false }]);
  }

  function addUpskilling(item: string) {
    if (!item) return;
    set('upskilling_paths', [...form.upskilling_paths, item]);
  }

  function addTag(tag: string) {
    if (!tag) return;
    if (form.company_fit_tags.includes(tag)) return;
    set('company_fit_tags', [...form.company_fit_tags, tag]);
  }

  async function save(status: 'draft' | 'published' = 'draft') {
    if (!form.title || !form.job_role || !form.industry_id) {
      toast({ title: 'Fehler', description: 'Bitte Titel, Rolle und Branche ausfüllen.', variant: 'destructive' });
      return;
    }
    if (status === 'published' && (!form.location_lat || !form.location_lng)) {
      toast({
        title: 'Fehler',
        description: 'Für die Veröffentlichung werden Koordinaten benötigt.',
        variant: 'destructive',
      });
      return;
    }

    const payload = { ...form } as any;
    const { data, error } = await supabase.rpc('upsert_job_ad_with_requirements', { p_job: payload as any, p_status: status });
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      return;
    }
    set('id', data);
    toast({
      title: 'Erfolg',
      description: status === 'published' ? 'Anzeige veröffentlicht.' : 'Entwurf gespeichert.',
    });
    if (status === 'published') {
      navigate('/company/jobs');
    }
  }

  const selectedSkills = useMemo(() => {
    const map = new Map(skills.map((s) => [s.id, s]));
    return form.requirements.map((r) => ({ ...r, name: map.get(r.skill_id)?.name || 'Skill' }));
  }, [form.requirements, skills]);

  return (
    <div className="mx-auto max-w-5xl p-3 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/company/jobs')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-semibold">Stellenanzeige erstellen</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => save('draft')} className="hidden sm:flex">
            Entwurf
          </Button>
          <Button size="sm" onClick={() => save('published')}>
            Veröffentlichen
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basis">Basis</TabsTrigger>
          <TabsTrigger value="anforderungen">Anforderungen</TabsTrigger>
          <TabsTrigger value="vorschau">Vorschau</TabsTrigger>
        </TabsList>

        {/* BASIS */}
        <TabsContent value="basis">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">1) Grunddaten</h3>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid md:grid-cols-3 gap-3">
                <Select
                  value={form.industry_id}
                  onValueChange={(v) => {
                    set('industry_id', v);
                    applyIndustryPreset(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Branche wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Jobtitel"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
                <Input
                  placeholder="Rolle (z.B. Elektroniker:in)"
                  value={form.job_role}
                  onChange={(e) => set('job_role', e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                <Select value={form.seniority} onValueChange={(v) => set('seniority', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="schueler_praktikum">Schüler:in (Praktikum)</SelectItem>
                    <SelectItem value="ausbildung">Ausbildung</SelectItem>
                    <SelectItem value="junior_fachkraft">Junior Fachkraft</SelectItem>
                    <SelectItem value="fachkraft">Fachkraft</SelectItem>
                    <SelectItem value="meister">Meister</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.contract_type} onValueChange={(v) => set('contract_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vertragsart" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="praktikum">Praktikum</SelectItem>
                    <SelectItem value="ausbildung">Ausbildung</SelectItem>
                    <SelectItem value="befristet">Befristet</SelectItem>
                    <SelectItem value="unbefristet">Unbefristet</SelectItem>
                    <SelectItem value="teilzeit">Teilzeit</SelectItem>
                    <SelectItem value="vollzeit">Vollzeit</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.work_pattern} onValueChange={(v) => set('work_pattern', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Arbeitsmuster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vor_ort">Vor Ort</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="mobil">Mobil</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.comp_unit} onValueChange={(v) => set('comp_unit', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vergütung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ausbildungsjahr">Ausbildungsjahr</SelectItem>
                    <SelectItem value="monat">Monat</SelectItem>
                    <SelectItem value="stunde">Stunde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Input
                  placeholder="PLZ"
                  value={form.postal_code}
                  onChange={(e) => set('postal_code', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Start frühestens"
                    value={form.start_window_earliest}
                    onChange={(e) => set('start_window_earliest', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="Start spätestens"
                    value={form.start_window_latest}
                    onChange={(e) => set('start_window_latest', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Input
                  placeholder="Vergütung min"
                  value={form.compensation_min}
                  onChange={(e) => set('compensation_min', e.target.value)}
                />
                <Input
                  placeholder="Vergütung max"
                  value={form.compensation_max}
                  onChange={(e) => set('compensation_max', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANFORDERUNGEN */}
        <TabsContent value="anforderungen">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">2) Skills & Sprache</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Skills hinzufügen</label>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(id) => {
                        const skill = skills.find((s) => s.id === id);
                        addRequirement(skill);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Skill wählen" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-auto">
                        {skills.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => applyIndustryPreset(form.industry_id)}>
                      Preset
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSkills.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                        <span className="text-sm">{r.name}</span>
                        <select
                          className="text-sm bg-transparent"
                          value={r.level_required}
                          onChange={(e) => {
                            const nv = [...form.requirements];
                            nv[idx].level_required = parseInt(e.target.value);
                            set('requirements', nv);
                          }}
                        >
                          {[0, 1, 2, 3].map((l) => (
                            <option key={l} value={l}>
                              Lvl {l}
                            </option>
                          ))}
                        </select>
                        <label className="text-xs flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={r.must_have}
                            onChange={(e) => {
                              const nv = [...form.requirements];
                              nv[idx].must_have = e.target.checked;
                              set('requirements', nv);
                            }}
                          />{' '}
                          must
                        </label>
                        <button
                          className="text-muted-foreground text-sm hover:text-foreground"
                          onClick={() => {
                            const nv = [...form.requirements];
                            nv.splice(idx, 1);
                            set('requirements', nv);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Sprachanforderungen</label>
                  {form.language_requirements.map((lr, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <Input
                        className="w-20"
                        value={lr.lang}
                        onChange={(e) => {
                          const nv = [...form.language_requirements];
                          nv[i].lang = e.target.value.toUpperCase();
                          set('language_requirements', nv);
                        }}
                      />
                      <Select
                        value={lr.min_cefr}
                        onValueChange={(v) => {
                          const nv = [...form.language_requirements];
                          nv[i].min_cefr = v;
                          set('language_requirements', nv);
                        }}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((x) => (
                            <SelectItem key={x} value={x}>
                              {x}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <label className="text-sm flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={lr.must_have}
                          onChange={(e) => {
                            const nv = [...form.language_requirements];
                            nv[i].must_have = e.target.checked;
                            set('language_requirements', nv);
                          }}
                        />{' '}
                        must
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const nv = [...form.language_requirements];
                          nv.splice(i, 1);
                          set('language_requirements', nv);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      set('language_requirements', [
                        ...form.language_requirements,
                        { lang: 'DE', min_cefr: 'B1', must_have: true },
                      ])
                    }
                  >
                    Sprache hinzufügen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">3) Dokumente & Extras</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Dokumente</label>
                  <div className="flex gap-2">
                    <Select onValueChange={(slug) => addDocument(slug)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dokument wählen" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-auto">
                        {docTypes.map((d) => (
                          <SelectItem key={d.slug} value={d.slug}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.documents.map((d, i) => (
                      <div key={d.document_slug} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                        <span className="text-sm">{d.document_slug}</span>
                        <label className="text-xs flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!!d.must_have}
                            onChange={(e) => {
                              const nv = [...form.documents];
                              nv[i].must_have = e.target.checked;
                              if (e.target.checked) nv[i].nice_to_have = false;
                              set('documents', nv);
                            }}
                          />{' '}
                          must
                        </label>
                        <label className="text-xs flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!!d.nice_to_have}
                            onChange={(e) => {
                              const nv = [...form.documents];
                              nv[i].nice_to_have = e.target.checked;
                              if (e.target.checked) nv[i].must_have = false;
                              set('documents', nv);
                            }}
                          />{' '}
                          nice
                        </label>
                        <button
                          className="text-muted-foreground text-sm hover:text-foreground"
                          onClick={() => {
                            const nv = [...form.documents];
                            nv.splice(i, 1);
                            set('documents', nv);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Upskilling (z.B. Staplerschein in 2 Wochen)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addUpskilling(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.upskilling_paths.map((u, i) => (
                      <Chip
                        key={i}
                        label={u}
                        onRemove={() => {
                          const nv = [...form.upskilling_paths];
                          nv.splice(i, 1);
                          set('upskilling_paths', nv);
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Team Tag (z.B. familienbetrieb)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.company_fit_tags.map((t, i) => (
                      <Chip
                        key={i}
                        label={t}
                        onRemove={() => set('company_fit_tags', form.company_fit_tags.filter((x, ix) => ix !== i))}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* VORSCHAU */}
        <TabsContent value="vorschau">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Vorschau</h3>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="schueler">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="schueler">Schüler:in</TabsTrigger>
                  <TabsTrigger value="azubi">Azubi</TabsTrigger>
                  <TabsTrigger value="fachkraft">Fachkraft</TabsTrigger>
                </TabsList>
                <TabsContent value="schueler">
                  <Preview role="schueler" form={form} skills={selectedSkills} />
                </TabsContent>
                <TabsContent value="azubi">
                  <Preview role="azubi" form={form} skills={selectedSkills} />
                </TabsContent>
                <TabsContent value="fachkraft">
                  <Preview role="fachkraft" form={form} skills={selectedSkills} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Preview({
  role,
  form,
  skills,
}: {
  role: string;
  form: any;
  skills: Array<{ name: string; must_have: boolean }>;
}) {
  const title = form.title || 'Titel deiner Stelle';
  const bullets: { [key: string]: string[] } = {
    schueler: [
      'Das lernst du bei uns (Praxisnah & Schritt für Schritt).',
      'Dein Alltag: Team kennenlernen, erste Aufgaben, Feedback.',
      'Betreuung: feste Ansprechperson & Mentor:in.',
    ],
    azubi: [
      'Ausbildungsinhalte & Rotation durch Abteilungen.',
      'Übernahmechancen & Prüfungsvorbereitung.',
      'Schule & Betrieb: klare Struktur, fester Plan.',
    ],
    fachkraft: [
      'Deine Verantwortung im Team & Schnittstellen.',
      'Schichtmodell & Arbeitsmittel.',
      'Weiterbildung & Aufstiegspfade.',
    ],
  };

  return (
    <div className="p-4 space-y-3">
      <h4 className="text-xl font-semibold">{title}</h4>
      <div className="text-sm text-muted-foreground">
        {form.job_role} • {form.work_pattern} • {form.postal_code || 'PLZ'}
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.slice(0, 6).map((s, i) => (
          <Badge key={i} variant="secondary">
            {s.name}
            {s.must_have ? ' • must' : ''}
          </Badge>
        ))}
      </div>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {bullets[role]?.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <div className="text-sm text-muted-foreground">
        {form.documents?.length > 0 && (
          <>
            <div className="mt-3 font-medium">Bewerbungsunterlagen</div>
            <ul className="list-disc pl-5">
              {form.documents.map((d: DocReq, i: number) => (
                <li key={i}>
                  {d.document_slug} {d.must_have ? '(Pflicht)' : ''}{' '}
                  {d.nice_to_have && !d.must_have ? '(Optional – Bonus)' : ''}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
