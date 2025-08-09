import React from 'react';

interface InViewProps {
  children: React.ReactNode;
  rootMargin?: string;
  once?: boolean;
  placeholder?: React.ReactNode;
  className?: string;
}

export const InView: React.FC<InViewProps> = ({
  children,
  rootMargin = '200px',
  once = true,
  placeholder = null,
  className,
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
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return <div ref={ref} className={className}>{visible ? children : placeholder}</div>;
};

export default InView;
