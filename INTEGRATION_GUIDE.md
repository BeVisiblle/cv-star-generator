# Bewerbungs-Management Integration

## Firma-Seite (Job Detail → Kandidaten Tab)

### 1. ApplicationActionsMenu verwenden

Um die Aktions-Buttons in der Kandidaten-Liste einzubinden:

```tsx
import { ApplicationActionsMenu } from "@/components/jobs/ApplicationActionsMenu";

// In der Kandidaten-Card oder Liste:
<ApplicationActionsMenu
  applicationId={application.id}
  status={application.status}
  candidateName={candidate.full_name || "Kandidat"}
  onViewProfile={() => {
    // Optional: Profil-Modal öffnen
    setSelectedCandidate(candidate);
    setProfileModalOpen(true);
  }}
/>
```

### 2. Verfügbare Aktionen je nach Status

- **Status "new"**: 
  - ✅ Profil freischalten
  - ✅ Zu Gespräch einladen
  - ❌ Absagen

- **Status "unlocked"**:
  - ✅ Zu Gespräch einladen
  - ❌ Absagen

- **Status "interview_scheduled"**:
  - ✅ Zusage erteilen
  - ❌ Absagen

- **Status "accepted"/"rejected"**:
  - Keine weiteren Aktionen

### 3. Beispiel-Integration in JobCandidatesTab

```tsx
// In src/components/jobs/tabs/JobCandidatesTab.tsx

import { ApplicationActionsMenu } from "@/components/jobs/ApplicationActionsMenu";

// Im Render der Kandidaten-Card:
<Card key={app.id}>
  <CardContent className="p-4">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold">{app.candidate?.full_name}</h3>
        <p className="text-sm text-muted-foreground">{app.job?.title}</p>
        <Badge variant={getStatusVariant(app.status)}>
          {getStatusLabel(app.status)}
        </Badge>
      </div>
      
      {/* Actions Menu */}
      <ApplicationActionsMenu
        applicationId={app.id}
        status={app.status}
        candidateName={app.candidate?.full_name || "Kandidat"}
        onViewProfile={() => handleViewProfile(app)}
      />
    </div>
  </CardContent>
</Card>
```

## Kandidaten-Seite (Meine Karriere → Bewerbungen)

Die Kandidaten sehen automatisch:

### Status-Anzeigen mit Informationen

1. **Freigeschaltet** (status: "unlocked"):
   - Blaue Info-Box
   - "Profil wurde freigeschaltet"
   - Datum der Freischaltung

2. **Zu Gespräch eingeladen** (status: "interview_scheduled"):
   - Lila Info-Box
   - "Sie wurden zu einem Gespräch eingeladen"
   - Hinweis auf E-Mail-Details

3. **Zusage erhalten** (status: "accepted"):
   - Grüne Info-Box
   - "Glückwunsch! Sie haben eine Zusage erhalten"

4. **Abgelehnt** (status: "rejected"):
   - Rote Info-Box (wenn reason_short vorhanden)
   - Zeigt den Ablehnungsgrund

## Datenbank-Schema

Die folgenden Felder werden in der `applications` Tabelle verwendet:

```sql
- status: application_status (ENUM: new, unlocked, interview_scheduled, accepted, rejected, withdrawn)
- unlocked_at: timestamp (wird gesetzt beim Freischalten)
- reason_short: text (optional, für Ablehnungsgrund)
```

## Status-Übergänge

```
new → unlocked → interview_scheduled → accepted
                                      ↘ rejected
```

Alle Status können auch direkt zu "rejected" wechseln.
