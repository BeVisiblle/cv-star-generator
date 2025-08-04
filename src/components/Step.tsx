interface StepProps {
  number: string;
  text: string;
}

export function Step({ number, text }: StepProps) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-2 text-primary">{number}</div>
      <p className="text-foreground">{text}</p>
    </div>
  );
}