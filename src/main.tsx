import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MobileViewportOptimizer } from './components/ui/mobile-viewport.tsx'

createRoot(document.getElementById("root")!).render(
  <>
    <MobileViewportOptimizer />
    <App />
  </>
);
