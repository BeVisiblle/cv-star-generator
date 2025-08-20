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
        'cv-root cv-a4 mx-auto bg-card text-foreground rounded-md shadow-sm border border-border overflow-hidden',
        'max-w-full',
        className,
      )}
      aria-label="Lebenslauf Vorschau – A4"
    >
      <header className="cv-header cv-card border-b border-border">
        {content.avatarUrl && (
          <img
            src={content.avatarUrl}
            alt={`${content.fullName || 'Profil'} – Profilbild`}
            className="cv-header-img"
          />
        )}
        <div className="cv-header-meta">
          <h1 className="cv-title font-semibold">{content.fullName || 'Vorname Nachname'}</h1>
          {content.headline && (
            <p className="cv-subtitle text-muted-foreground">{content.headline}</p>
          )}
        </div>
      </header>

      <main className="cv-grid md:grid-cols-3 gap-6 px-8 py-6">
        <section className="cv-section md:col-span-1 space-y-4">
          {(content.contact?.email || content.contact?.phone || content.contact?.location) && (
            <div className="cv-card">
              <h2 className="cv-section-title text-base font-medium mb-2">Kontakt</h2>
              <ul className="cv-p text-muted-foreground space-y-1">
                {content.contact.email && <li>{content.contact.email}</li>}
                {content.contact.phone && <li>{content.contact.phone}</li>}
                {content.contact.location && <li>{content.contact.location}</li>}
              </ul>
            </div>
          )}

          {content.skills?.length > 0 && (
            <div className="cv-card">
              <h2 className="cv-section-title text-base font-medium mb-2">Fähigkeiten</h2>
              <div className="flex flex-wrap gap-2">
                {content.skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs rounded-md bg-muted text-foreground/90">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {content.languages?.length > 0 && (
            <div className="cv-card">
              <h2 className="cv-section-title text-base font-medium mb-2">Sprachen</h2>
              <ul className="cv-p text-muted-foreground space-y-1">
                {content.languages.map((l, i) => (
                  <li key={i}>{l.name}{l.level ? ` (${l.level})` : ''}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="cv-section md:col-span-2 space-y-6">
          {content.about && (
            <div className="cv-card">
              <h2 className="cv-section-title text-base font-medium mb-2">Profil</h2>
              <p className="cv-p leading-6 text-foreground/90">{content.about}</p>
            </div>
          )}

          {content.experience?.length > 0 && (
            <div className="cv-card">
              <h2 className="cv-section-title text-base font-medium mb-2">Berufserfahrung</h2>
              <div className="space-y-4">
                {content.experience.map((e, idx) => (
                  <article key={idx} className="cv-card">
                    <div className="font-medium cv-p">
                      {e.role || 'Position'}{e.company ? ` · ${e.company}` : ''}
                    </div>
                    {(e.startDate || e.endDate) && (
                      <div className="text-sm text-muted-foreground">
                        {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                      </div>
                    )}
                    {e.description && (
                      <p className="cv-p leading-6 mt-1">{e.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {content.education?.length > 0 && (
            <div className="cv-card">
              <h2 className="cv-section-title text-base font-medium mb-2">Ausbildung</h2>
              <div className="space-y-4">
                {content.education.map((ed, idx) => (
                  <article key={idx} className="cv-card">
                    <div className="font-medium cv-p">
                      {ed.degree || 'Abschluss'}{ed.school ? ` · ${ed.school}` : ''}
                    </div>
                    {(ed.startDate || ed.endDate) && (
                      <div className="text-sm text-muted-foreground">
                        {[ed.startDate, ed.endDate].filter(Boolean).join(' – ')}
                      </div>
                    )}
                    {ed.description && (
                      <p className="cv-p leading-6 mt-1">{ed.description}</p>
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
