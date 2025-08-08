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
      data-variant="mobile"
      className={cn(
        'cv-mobile mx-auto bg-card text-foreground rounded-lg shadow-sm border border-border overflow-hidden',
        'max-w-full',
        className,
      )}
      aria-label="Lebenslauf Vorschau – Mobil"
    >
      <header className="px-4 py-4 flex items-center gap-4 border-b border-border">
        {content.avatarUrl && (
          <img
            src={content.avatarUrl}
            alt={`${content.fullName || 'Profil'} – Profilbild`}
            className="h-12 w-12 rounded-full object-cover shrink-0"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate">{content.fullName || 'Vorname Nachname'}</h1>
          {content.headline && (
            <p className="text-xs text-muted-foreground truncate">{content.headline}</p>
          )}
        </div>
      </header>

      <main className="px-4 py-3 space-y-3">
        {/* Kontakt */}
        {(content.contact?.email || content.contact?.phone || content.contact?.location) && (
          <section className="cv-section">
            <h2 className="text-sm font-medium mb-2">Kontakt</h2>
            <ul className="text-xs text-muted-foreground space-y-1">
              {content.contact.email && <li>{content.contact.email}</li>}
              {content.contact.phone && <li>{content.contact.phone}</li>}
              {content.contact.location && <li>{content.contact.location}</li>}
            </ul>
          </section>
        )}

        {/* Über mich */}
        {content.about && (
          <section className="cv-section">
            <h2 className="text-sm font-medium mb-2">Über mich</h2>
            <p className="text-[13px] leading-5 text-foreground/90">
              {content.about}
            </p>
          </section>
        )}

        {/* Berufserfahrung */}
        {content.experience?.length > 0 && (
          <section className="cv-section">
            <h2 className="text-sm font-medium mb-2">Berufserfahrung</h2>
            <div className="space-y-2">
              {content.experience.map((e, idx) => (
                <article key={idx} className="text-[13px]">
                  <div className="font-medium">
                    {e.role || 'Position'}{e.company ? ` · ${e.company}` : ''}
                  </div>
                  {(e.startDate || e.endDate) && (
                    <div className="text-xs text-muted-foreground">
                      {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                    </div>
                  )}
                  {e.description && (
                    <p className="text-[13px] leading-5 mt-1">{e.description}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Ausbildung */}
        {content.education?.length > 0 && (
          <section className="cv-section">
            <h2 className="text-sm font-medium mb-2">Ausbildung</h2>
            <div className="space-y-2">
              {content.education.map((ed, idx) => (
                <article key={idx} className="text-[13px]">
                  <div className="font-medium">
                    {ed.degree || 'Abschluss'}{ed.school ? ` · ${ed.school}` : ''}
                  </div>
                  {(ed.startDate || ed.endDate) && (
                    <div className="text-xs text-muted-foreground">
                      {[ed.startDate, ed.endDate].filter(Boolean).join(' – ')}
                    </div>
                  )}
                  {ed.description && (
                    <p className="text-[13px] leading-5 mt-1">{ed.description}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {content.skills?.length > 0 && (
          <section className="cv-section">
            <h2 className="text-sm font-medium mb-2">Fähigkeiten</h2>
            <div className="flex flex-wrap gap-1.5">
              {content.skills.map((s, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-md bg-muted text-foreground/90">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Sprachen */}
        {content.languages?.length > 0 && (
          <section className="cv-section">
            <h2 className="text-sm font-medium mb-2">Sprachen</h2>
            <ul className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
              {content.languages.map((l, i) => (
                <li key={i}>{l.name}{l.level ? ` (${l.level})` : ''}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </article>
  );
};
