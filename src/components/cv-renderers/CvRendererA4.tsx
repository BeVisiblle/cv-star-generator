import React from 'react';
import { CVContent } from './CVContent';
import '@/styles/cv-responsive.css';
import '@/styles/cv-print.css';
import { cn } from '@/lib/utils';

interface Props {
  content: CVContent;
  className?: string;
}

export const CvRendererA4: React.FC<Props> = ({ content, className }) => {
  return (
    <article
      data-cv-preview
      data-variant="a4"
      className={cn(
        'cv-a4 mx-auto bg-card text-foreground rounded-md shadow-sm border border-border overflow-hidden',
        'max-w-full',
        className,
      )}
      aria-label="Lebenslauf Vorschau – A4"
    >
      <header className="px-8 pt-8 pb-6 flex items-center gap-6 border-b border-border print:break-inside-avoid">
        {content.avatarUrl && (
          <img
            src={content.avatarUrl}
            alt={`${content.fullName || 'Profil'} – Profilbild`}
            className="h-20 w-20 rounded-full object-cover shrink-0 print:h-16 print:w-16"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold truncate print:text-xl print:whitespace-normal print:overflow-visible">{content.fullName || 'Vorname Nachname'}</h1>
          {content.headline && (
            <p className="text-sm text-muted-foreground truncate print:text-xs print:whitespace-normal print:overflow-visible">{content.headline}</p>
          )}
        </div>
      </header>

      <main className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 print:block">
        <section className="cv-section md:col-span-1 space-y-4">
          {(content.contact?.email || content.contact?.phone || content.contact?.location) && (
            <div>
              <h2 className="text-base font-medium mb-2 print:text-sm">Kontakt</h2>
              <ul className="text-sm text-muted-foreground space-y-1 print:text-xs">
                {content.contact.email && <li>{content.contact.email}</li>}
                {content.contact.phone && <li>{content.contact.phone}</li>}
                {content.contact.location && <li>{content.contact.location}</li>}
              </ul>
            </div>
          )}

          {content.skills?.length > 0 && (
            <div>
              <h2 className="text-base font-medium mb-2 print:text-sm">Fähigkeiten</h2>
              <div className="flex flex-wrap gap-2">
                {content.skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs rounded-md bg-muted text-foreground/90 print:text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {content.languages?.length > 0 && (
            <div>
              <h2 className="text-base font-medium mb-2 print:text-sm">Sprachen</h2>
              <ul className="text-sm text-muted-foreground space-y-1 print:text-xs">
                {content.languages.map((l, i) => (
                  <li key={i}>{l.name}{l.level ? ` (${l.level})` : ''}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="cv-section md:col-span-2 space-y-6">
          {content.about && (
            <div>
              <h2 className="text-base font-medium mb-2 print:text-sm">Profil</h2>
              <p className="text-[15px] leading-6 text-foreground/90 print:text-[13px] print:leading-5">{content.about}</p>
            </div>
          )}

          {content.experience?.length > 0 && (
            <div>
              <h2 className="text-base font-medium mb-2 print:text-sm">Berufserfahrung</h2>
              <div className="space-y-4">
                {content.experience.map((e, idx) => (
                  <article key={idx}>
                    <div className="font-medium text-[15px] print:text-[13px]">
                      {e.role || 'Position'}{e.company ? ` · ${e.company}` : ''}
                    </div>
                    {(e.startDate || e.endDate) && (
                      <div className="text-sm text-muted-foreground print:text-xs">
                        {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                      </div>
                    )}
                    {e.description && (
                      <p className="text-[15px] leading-6 mt-1 print:text-[13px] print:leading-5">{e.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {content.education?.length > 0 && (
            <div>
              <h2 className="text-base font-medium mb-2 print:text-sm">Ausbildung</h2>
              <div className="space-y-4">
                {content.education.map((ed, idx) => (
                  <article key={idx}>
                    <div className="font-medium text-[15px] print:text-[13px]">
                      {ed.degree || 'Abschluss'}{ed.school ? ` · ${ed.school}` : ''}
                    </div>
                    {(ed.startDate || ed.endDate) && (
                      <div className="text-sm text-muted-foreground print:text-xs">
                        {[ed.startDate, ed.endDate].filter(Boolean).join(' – ')}
                      </div>
                    )}
                    {ed.description && (
                      <p className="text-[15px] leading-6 mt-1 print:text-[13px] print:leading-5">{ed.description}</p>
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
