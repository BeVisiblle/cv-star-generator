import React from 'react';

interface InViewProps {
  children: React.ReactNode;
  rootMargin?: string;
  once?: boolean;
  placeholder?: React.ReactNode;
  className?: string;
  animation?: "fade" | "fade-scale" | "slide-up" | "none";
  delay?: number;
}

export const InView: React.FC<InViewProps> = ({
  children,
  rootMargin = '100px',
  once = true,
  placeholder = null,
  className,
  animation = "fade-scale",
  delay = 0,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setTimeout(() => {
            setVisible(true);
          }, delay);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { root: null, rootMargin, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once, delay]);

  const animationClass = animation !== "none" && visible ? {
    "fade": "animate-fade-in",
    "fade-scale": "animate-fade-scale-in",
    "slide-up": "animate-slide-up"
  }[animation] : "";

  return (
    <div 
      ref={ref} 
      className={className}
      style={{ 
        opacity: animation !== "none" && !visible ? 0 : undefined,
        transition: animation === "none" ? undefined : "opacity 0.4s ease-out"
      }}
    >
      <div className={animationClass}>
        {visible ? children : placeholder}
      </div>
    </div>
  );
};

export default InView;
