import React from "react";

type Bullet = { text: string };
export type Experience = {
  role: string;                  // z.B. "IT-Projektmanager"
  company: string;               // "Weissenberg Group"
  location?: string;             // "München"
  start_fmt: string;             // "01/2019"
  end_fmt: string;               // "heute" | "12/2023"
  bullets?: Bullet[];
};

export type Education = {
  degree: string;                // "Bachelor of Arts Politikwissenschaft ..."
  institution: string;           // "Goethe Universität Frankfurt"
  field?: string;                // optional: "Politikwissenschaft und Germanistik"
  location?: string;             // "Frankfurt am Main"
  start_fmt: string;             // "2005"
  end_fmt: string;               // "2011"
};

export type Signature = {
  place_date?: string;           // "München, 20.04.2021"
  name?: string;                 // falls abweichend
};

export type OliviaMainData = {
  name: string;                  // "Olivia Schneider"
  jobTitle: string;              // Pflichtfeld: "Kaufmännischer Leiter"
  aboutMe?: string;              // Über mich – Fließtext
  experience?: Experience[];
  education?: Education[];
  signature?: Signature;
};

const COLORS = {
  accent:  "#7A6F66",
  heading: "#222222",
  muted:   "#666666",
  rule:    "#E2DED7",
  pillBg:  "#F2EFEA",
};

const RSection = ({ label }: { label: string }) => (
  <div className="mt-1 mb-1">
    <div className="text-[16px] font-semibold" style={{ color: COLORS.accent }}>
      {label.toUpperCase()}
    </div>
    <div style={{ height: 1, background: COLORS.rule, marginTop: 4 }} />
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-block mt-2 px-3 py-1 rounded"
    style={{ background: COLORS.pillBg, color: COLORS.accent, fontWeight: 600, letterSpacing: "0.04em" }}
  >
    {String(children).toUpperCase()}
  </span>
);

export default function OliviaMain({ data }: { data: OliviaMainData }) {
  const { name, jobTitle, aboutMe, experience = [], education = [], signature } = data;
  return (
    <main className="flex flex-col h-full">
      {/* Hauptinhalt */}
      <div className="flex-1">
        {/* Name */}
        <div className="text-[32px] font-bold" style={{ color: COLORS.heading }}>
          {name || "Vorname Nachname"}
        </div>

        {/* Jobbezeichnung (Pflicht) */}
        <Pill>{jobTitle || "Jobbezeichnung erforderlich"}</Pill>
        {!jobTitle && (
          <div className="mt-1 text-[12px]" style={{ color: "#b91c1c" }}>
            * Bitte Jobbezeichnung angeben – sie erscheint hier und im PDF.
          </div>
        )}

        {/* Über mich (oberhalb der Berufserfahrung) */}
        {aboutMe && (
          <>
            <RSection label="Berufsbezeichnung" />
            <p className="text-[13px] leading-[21px]" style={{ color: COLORS.heading }}>
              {aboutMe}
            </p>
          </>
        )}

               {/* Berufserfahrung */}
               {experience.length > 0 && (
                 <>
                   <RSection label="Berufserfahrung" />
                   <div className="space-y-1">
              {experience
                .sort((a, b) => {
                  // Sortiere nach end_fmt - "bis heute" kommt zuerst
                  if (a.end_fmt === "bis heute" || a.end_fmt === "heute") return -1;
                  if (b.end_fmt === "bis heute" || b.end_fmt === "heute") return 1;
                  return 0;
                })
                .map((e, i) => (
                <div key={i}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="text-[15px] font-semibold" style={{ color: COLORS.heading }}>
                        {e.role.toUpperCase()}
                      </div>
                      <div className="text-[12px]" style={{ color: COLORS.muted }}>
                        {e.company}
                        {e.location ? ` | ${e.location}` : ""}
                      </div>
                    </div>
                    <div className="text-[12px] whitespace-nowrap" style={{ color: COLORS.muted }}>
                      {e.start_fmt} — {e.end_fmt === "Ende" ? "bis heute" : e.end_fmt}
                    </div>
                  </div>
                  {e.bullets?.length ? (
                    <ul className="list-disc pl-5 text-[13px] leading-5 mt-1" style={{ color: COLORS.heading }}>
                      {e.bullets.map((b, j) => <li key={j}>{b.text}</li>)}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        )}

               {/* Ausbildung */}
               {education.length > 0 && (
                 <>
                   <RSection label="Ausbildung" />
                   <div className="space-y-1">
              {education.map((ed, i) => (
                <div key={i}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-[13.5px]" style={{ color: COLORS.heading }}>
                        {ed.degree.toUpperCase()}
                      </div>
                      <div className="font-semibold text-[13.5px]" style={{ color: COLORS.heading }}>
                        {ed.institution}
                        {ed.location ? `, ${ed.location}` : ""}
                      </div>
                    </div>
                    <div className="text-[12px] whitespace-nowrap" style={{ color: COLORS.muted }}>
                      {ed.start_fmt} — {ed.end_fmt}
                    </div>
                  </div>
                  {ed.field && (
                    <div className="text-[12.5px] mt-1" style={{ color: COLORS.heading }}>
                      {ed.field}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

     {/* Signatur - mittiger und höher */}
{(signature?.place_date || signature?.name) && (
  <div className="mt-8 text-center">
    {signature?.place_date && (
      <div className="text-[12px]" style={{ color: COLORS.muted }}>
        {signature.place_date}
      </div>
    )}
    <div className="italic text-[13px]" style={{ color: COLORS.heading }}>
      {signature?.name || name}
    </div>
  </div>
)}
    </main>
  );
}