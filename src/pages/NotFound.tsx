import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import ComingSoon from "@/components/coming-soon/ComingSoon";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <ComingSoon 
          title="Diese Seite ist noch nicht verfügbar"
          description="Die von Ihnen gesuchte Seite befindet sich derzeit noch in der Entwicklung. Wir arbeiten daran, sie so schnell wie möglich bereitzustellen."
          image="/images/step1-hero.jpg"
        />
      </div>
    </div>
  );
};

export default NotFound;
