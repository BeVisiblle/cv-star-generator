import MobileContainer from './MobileContainer';
import MobileGrid from './MobileGrid';
import MobileCard from './MobileCard';
import MobileNav from './MobileNav';

export default function AppMobile() {
  return (
    <MobileContainer>
      <header className="mb-3">
        <h1 className="text-xl font-bold">Übersicht</h1>
      </header>

      <MobileGrid>
        <MobileCard title="Deine Matches" subtitle="Aktualisiert heute" img="/images/step1.jpg" />
        <MobileCard title="Bewerbungen" subtitle="2 offen" img="/images/step2.jpg" />
        <MobileCard title="Profil" subtitle="Vervollständige 20%" img="/images/step3.jpg" />
        <MobileCard title="Mitteilungen" subtitle="3 neue" img="/images/step1-hero.jpg" />
      </MobileGrid>

      <MobileNav />
    </MobileContainer>
  );
}
