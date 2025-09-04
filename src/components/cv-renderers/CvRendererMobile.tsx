import React from 'react';
import { CVContent } from './CVContent';
import '@/styles/cv-responsive.css';
import '@/styles/cv-print.css';
import { cn } from '@/lib/utils';

interface Props {
  content: CVContent;
  className?: string;
}

export const CvRendererMobile: React.FC<Props> = ({ content, className }) => {
  return (
    <article
      data-cv-preview
      data-variant="a4"
      className={cn(
        'cv-mobile mx-auto bg-card text-foreground rounded-lg shadow-sm border border-border overflow-hidden',
        'max-w-full',
        // Print styles - use A4 format for mobile CV when printing
        'print:bg-white print:text-black print:shadow-none print:border-0 print:rounded-none print:overflow-visible',
        className,
      )}
      aria-label="Lebenslauf Vorschau – Mobil"
    >
      <header className="px-4 py-4 flex items-center gap-4 border-b border-border print:px-8 print:pt-8 print:pb-6 print:gap-6 print:break-inside-avoid">
        {content.avatarUrl && (
          <img
            src={content.avatarUrl}
            alt={`${content.fullName || 'Profil'} – Profilbild`}
            className="h-12 w-12 rounded-full object-cover shrink-0 print:h-16 print:w-16"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate print:text-xl print:whitespace-normal print:overflow-visible">{content.fullName || 'Vorname Nachname'}</h1>
          {content.headline && (
            <p className="text-xs text-muted-foreground truncate print:text-xs print:whitespace-normal print:overflow-visible">{content.headline}</p>
          )}
        </div>
      </header>

      <main className="px-4 py-3 space-y-3 print:px-8 print:py-6 print:grid print:grid-cols-1 print:md:grid-cols-3 print:gap-6 print:block">
        {/* Left Sidebar - Contact, Skills, Languages */}
        <section className="cv-section print:md:col-span-1 print:space-y-4 print:break-inside-avoid">
          {/* Kontakt */}
          {(content.contact?.email || content.contact?.phone || content.contact?.location || content.driversLicenseClass) && (
            <div className="print:break-inside-avoid">
              <h2 className="text-sm font-medium mb-2 print:text-xs">Kontakt</h2>
              <ul className="text-xs text-muted-foreground space-y-1 print:text-[11px]">
                {content.contact?.email && <li>{content.contact.email}</li>}
                {content.contact?.phone && <li>{content.contact.phone}</li>}
                {content.contact?.location && <li>{content.contact.location}</li>}
                {content.driversLicenseClass && <li>Führerschein {content.driversLicenseClass}</li>}
              </ul>
            </div>
          )}

          {/* Skills */}
          {content.skills?.length > 0 && (
            <div className="print:break-inside-avoid">
              <h2 className="text-sm font-medium mb-2 print:text-xs">Fähigkeiten</h2>
              <div className="flex flex-wrap gap-1.5 print:gap-2">
                {content.skills.map((s, i) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-md bg-muted text-foreground/90 print:text-[11px] print:px-2.5">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sprachen */}
          {content.languages?.length > 0 && (
            <div className="print:break-inside-avoid">
              <h2 className="text-sm font-medium mb-2 print:text-xs">Sprachen</h2>
              <ul className="text-xs text-muted-foreground space-y-1 print:text-[11px]">
                {content.languages.map((l, i) => (
                  <li key={i}>{l.name}{l.level ? ` (${l.level})` : ''}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Right Main Content - About, Experience, Education */}
        <section className="cv-section print:md:col-span-2 print:space-y-6 print:break-inside-avoid">
          {/* Über mich */}
          {content.about && (
            <div className="print:break-inside-avoid">
              <h2 className="text-sm font-medium mb-2 print:text-xs">Profil</h2>
              <p className="text-[13px] leading-5 text-foreground/90 print:text-[12px] print:leading-5">
                {content.about}
              </p>
            </div>
          )}

          {/* Berufserfahrung */}
          {content.experience?.length > 0 && (
            <div className="print:break-inside-avoid">
              <h2 className="text-sm font-medium mb-2 print:text-xs">Berufserfahrung</h2>
              <div className="space-y-2 print:space-y-4">
                {content.experience.map((e, idx) => (
                  <article key={idx} className="text-[13px] print:text-[12px] print:break-inside-avoid">
                    <div className="font-medium">
                      {e.role || 'Position'}{e.company ? ` · ${e.company}` : ''}
                    </div>
                    {(e.startDate || e.endDate) && (
                      <div className="text-xs text-muted-foreground print:text-[11px]">
                        {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                      </div>
                    )}
                    {e.description && (
                      <p className="text-[13px] leading-5 mt-1 print:text-[12px] print:leading-5">{e.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Ausbildung */}
          {content.education?.length > 0 && (
            <div className="print:break-inside-avoid">
              <h2 className="text-sm font-medium mb-2 print:text-xs">Ausbildung</h2>
              <div className="space-y-2 print:space-y-4">
                {content.education.map((ed, idx) => (
                  <article key={idx} className="text-[13px] print:text-[12px] print:break-inside-avoid">
                    <div className="font-medium">
                      {ed.degree || 'Abschluss'}{ed.school ? ` · ${ed.school}` : ''}
                    </div>
                    {(ed.startDate || ed.endDate) && (
                      <div className="text-xs text-muted-foreground print:text-[11px]">
                        {[ed.startDate, ed.endDate].filter(Boolean).join(' – ')}
                      </div>
                    )}
                    {ed.description && (
                      <p className="text-[13px] leading-5 mt-1 print:text-[12px] print:leading-5">{ed.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </article>
  );
};
