export default function MobileGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 md:grid-cols-2 md:gap-4">
      {children}
    </div>
  );
}
