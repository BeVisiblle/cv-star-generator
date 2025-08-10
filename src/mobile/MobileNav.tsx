export default function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border px-6 py-3 flex items-center justify-between md:hidden pb-[calc(env(safe-area-inset-bottom)+12px)]"
      aria-label="Mobile Navigation"
    >
      <button className="text-sm text-foreground">Home</button>
      <button className="text-sm text-foreground">Suche</button>
      <button className="text-sm text-foreground">Profil</button>
    </nav>
  );
}
