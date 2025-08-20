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
        'cv-root cv-mobile mx-auto bg-card text-foreground rounded-lg shadow-sm border border-border overflow-hidden',
        'max-w-full',
        className,
      )}
      aria-label="Lebenslauf Vorschau – Mobil"
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

      <main className="px-4 py-3 space-y-3">
        {/* Kontakt */}
        {(content.contact?.email || content.contact?.phone || content.contact?.location) && (
          <div className="cv-card">
            <h2 className="cv-section-title text-sm font-medium mb-2">Kontakt</h2>
            <ul className="cv-p text-muted-foreground space-y-1">
              {content.contact.email && <li>{content.contact.email}</li>}
              {content.contact.phone && <li>{content.contact.phone}</li>}
              {content.contact.location && <li>{content.contact.location}</li>}
              {content.driversLicenseClass && <li>Führerschein {content.driversLicenseClass}</li>}
            </ul>
          </div>
        )}

        {/* Über mich */}
        {content.about && (
          <div className="cv-card">
            <h2 className="cv-section-title text-sm font-medium mb-2">Über mich</h2>
            <p className="cv-p leading-5 text-foreground/90">
              {content.about}
            </p>
          </div>
        )}

        {/* Berufserfahrung */}
        {content.experience?.length > 0 && (
          <div className="cv-card">
            <h2 className="cv-section-title text-sm font-medium mb-2">Berufserfahrung</h2>
            <div className="space-y-2">
              {content.experience.map((e, idx) => (
                <article key={idx} className="cv-card">
                  <div className="font-medium cv-p">
                    {e.role || 'Position'}{e.company ? ` · ${e.company}` : ''}
                  </div>
                  {(e.startDate || e.endDate) && (
                    <div className="text-xs text-muted-foreground">
                      {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                    </div>
                  )}
                  {e.description && (
                    <p className="cv-p leading-5 mt-1">{e.description}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Ausbildung */}
        {content.education?.length > 0 && (
          <div className="cv-card">
            <h2 className="cv-section-title text-sm font-medium mb-2">Ausbildung</h2>
            <div className="space-y-2">
              {content.education.map((ed, idx) => (
                <article key={idx} className="cv-card">
                  <div className="font-medium cv-p">
                    {ed.degree || 'Abschluss'}{ed.school ? ` · ${ed.school}` : ''}
                  </div>
                  {(ed.startDate || ed.endDate) && (
                    <div className="text-xs text-muted-foreground">
                      {[ed.startDate, ed.endDate].filter(Boolean).join(' – ')}
                    </div>
                  )}
                  {ed.description && (
                    <p className="cv-p leading-5 mt-1">{ed.description}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {content.skills?.length > 0 && (
          <div className="cv-card">
            <h2 className="cv-section-title text-sm font-medium mb-2">Fähigkeiten</h2>
            <div className="flex flex-wrap gap-1.5">
              {content.skills.map((s, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-md bg-muted text-foreground/90">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sprachen */}
        {content.languages?.length > 0 && (
          <div className="cv-card">
            <h2 className="cv-section-title text-sm font-medium mb-2">Sprachen</h2>
            <ul className="cv-p text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
              {content.languages.map((l, i) => (
                <li key={i}>{l.name}{l.level ? ` (${l.level})` : ''}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </article>
  );
};
