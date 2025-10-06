import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Mail, Phone, Globe, User, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function CompanySignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [usePassword, setUsePassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [allowUpdates, setAllowUpdates] = useState(false);

  // Form state
  const [form, setForm] = useState({
    companyName: "",
    legalForm: "",
    industry: "",
    size: "",
    website: "",
    country: "",
    city: "",
    adminFirst: "",
    adminLast: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const isStep1Valid = () => {
    const required = ["companyName", "industry", "size", "country", "city", "adminFirst", "adminLast", "phone"] as const;
    const allFilled = required.every((k) => String(form[k]).trim().length > 0);
    return allFilled && agreeTerms;
  };

  const isStep2Valid = () => {
    const emailOk = /.+@.+\..+/.test(form.email);
    if (usePassword) {
      return (
        emailOk &&
        form.password.length >= 8 &&
        form.password === form.passwordConfirm
      );
    }
    return emailOk;
  };

  const onContinue = () => {
    if (step === 1 && isStep1Valid()) setStep(2);
  };

  const onBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async () => {
    if (!isStep2Valid()) return;

    // 🔐 TODO: Hook up your auth here
    // if (!usePassword) {
    //   await supabase.auth.signInWithOtp({ email: form.email, options: { emailRedirectTo: window.location.origin + "/company/onboarding" } });
    // } else {
    //   await supabase.auth.signUp({
    //     email: form.email,
    //     password: form.password,
    //     options: { data: { role: "company-admin", companyName: form.companyName } }
    //   });
    // }

    // 📦 TODO: Persist step‑1 company profile draft to your DB before/after auth
    // await saveCompanyDraft({ ...form, allowUpdates, agreeTerms })

    alert(`Check your inbox${usePassword ? " to verify your account" : " – we sent you a secure sign‑in link"}.`);
    
    // For now, redirect to onboarding
    navigate("/company/onboarding");
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-black/90" />
            <span className="font-semibold">Ausbildungsbasis – Unternehmen</span>
          </div>
          <div className="text-sm text-neutral-500">Bereits registriert? <a className="underline" href="/auth">Einloggen</a></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Left visual panel */}
          <Card className="rounded-2xl shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-full min-h-[560px] bg-gradient-to-br from-indigo-400 to-violet-500">
                <div className="absolute inset-0 p-10 text-white">
                  <div className="text-sm opacity-80">Ausbildungsbasis</div>
                  <h2 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight">Recruiting, das zu Ihnen passt.</h2>
                  <p className="mt-3 max-w-md text-white/85">
                    Erstellen Sie Ihr Unternehmensprofil, laden Sie Ihr Team ein und kontaktieren Sie passende Kandidat:innen direkt. 
                    Keine umständlichen Portale – ein klarer Prozess von Sichtbarkeit bis Einstellung.
                  </p>
                  <div className="absolute bottom-8 left-10 right-10 text-white/80 text-sm">
                    Folgen Sie uns auf Instagram · LinkedIn
                  </div>
                </div>
                {/* Illustration blob */}
                <div className="absolute -right-24 bottom-0 h-64 w-64 md:h-80 md:w-80 bg-white/15 rounded-full blur-2xl" />
              </div>
            </CardContent>
          </Card>

          {/* Right form panel */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Jetzt registrieren (Unternehmen)</CardTitle>
              <p className="text-sm text-neutral-500">2 Schritte · Ihre Angaben können später bearbeitet werden.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-sm">
                <ProgressDot active={step >= 1} label="Unternehmen" />
                <div className="h-px flex-1 bg-neutral-200" />
                <ProgressDot active={step >= 2} label="Bestätigung" />
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Firmenname" icon={<Building2 size={16} />}>
                      <Input className="pl-10" placeholder="z. B. Müller GmbH" value={form.companyName} onChange={update("companyName")} />
                    </Field>
                    <Field label="Rechtsform (optional)">
                      <Input placeholder="GmbH, AG, e. K." value={form.legalForm} onChange={update("legalForm")} />
                    </Field>
                    <Field label="Branche">
                      <Input placeholder="z. B. Handwerk, Pflege, IT" value={form.industry} onChange={update("industry")} />
                    </Field>
                    <Field label="Unternehmensgröße">
                      <Select onValueChange={(v) => setForm({ ...form, size: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-9">1–9</SelectItem>
                          <SelectItem value="10-49">10–49</SelectItem>
                          <SelectItem value="50-249">50–249</SelectItem>
                          <SelectItem value=">=250">≥ 250</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Website (optional)" icon={<Globe size={16} />}>
                      <Input className="pl-10" placeholder="https://" value={form.website} onChange={update("website")} />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Land">
                      <Input placeholder="Deutschland" value={form.country} onChange={update("country")} />
                    </Field>
                    <Field label="Stadt">
                      <Input placeholder="z. B. Frankfurt am Main" value={form.city} onChange={update("city")} />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Admin – Vorname" icon={<User size={16} />}>
                      <Input className="pl-10" placeholder="Vorname" value={form.adminFirst} onChange={update("adminFirst")} />
                    </Field>
                    <Field label="Admin – Nachname">
                      <Input placeholder="Nachname" value={form.adminLast} onChange={update("adminLast")} />
                    </Field>
                    <Field label="Telefon" icon={<Phone size={16} />}>
                      <Input className="pl-10" placeholder="z. B. +49 160 123456" value={form.phone} onChange={update("phone")} />
                    </Field>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 text-sm">
                      <Checkbox checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(!!v)} />
                      <span>
                        Ich akzeptiere die <a className="underline" href="/agb" target="_blank">AGB</a> und <a className="underline" href="/datenschutz" target="_blank">Datenschutzbestimmungen</a>.
                      </span>
                    </label>
                    <label className="flex items-start gap-3 text-sm text-neutral-700">
                      <Checkbox checked={allowUpdates} onCheckedChange={(v) => setAllowUpdates(!!v)} />
                      <span>Ich möchte Updates & Produktinfos erhalten (optional).</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
                    <Button disabled={!isStep1Valid()} onClick={onContinue}>
                      Weiter <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="rounded-xl border bg-neutral-50 p-4 text-sm text-neutral-700">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />
                      <p>
                        Fast geschafft! Bestätigen Sie Ihre geschäftliche E‑Mail, um den Account zu aktivieren
                        {usePassword ? " und ein Passwort zu setzen." : ". Wir senden einen sicheren Magic‑Link an Ihre E‑Mail."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Geschäftliche E‑Mail" icon={<Mail size={16} />}>
                      <Input className="pl-10" placeholder="name@firma.de" value={form.email} onChange={update("email")} />
                    </Field>
                    {usePassword && (
                      <Field label="Passwort" icon={<Lock size={16} />}>
                        <Input className="pl-10" type="password" placeholder="mind. 8 Zeichen" value={form.password} onChange={update("password")} />
                      </Field>
                    )}
                    {usePassword && (
                      <Field label="Passwort bestätigen">
                        <Input type="password" placeholder="Wiederholen" value={form.passwordConfirm} onChange={update("passwordConfirm")} />
                      </Field>
                    )}
                  </div>

                  <div className="text-sm text-neutral-600">
                    {usePassword ? (
                      <button className="underline" onClick={() => setUsePassword(false)}>Lieber ohne Passwort anmelden (Magic‑Link)</button>
                    ) : (
                      <button className="underline" onClick={() => setUsePassword(true)}>Ich möchte ein Passwort verwenden</button>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Zurück</Button>
                    <Button disabled={!isStep2Valid()} onClick={onSubmit}>
                      {usePassword ? "Konto erstellen" : "Magic‑Link senden"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function Field({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-neutral-700">{label}</Label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10 pointer-events-none">{icon}</div>}
        {children}
      </div>
    </div>
  );
}

function ProgressDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-full ${active ? "bg-violet-600" : "bg-neutral-300"}`} />
      <span className={`text-xs ${active ? "text-neutral-900" : "text-neutral-400"}`}>{label}</span>
    </div>
  );
}
