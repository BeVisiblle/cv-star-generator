import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/cv-print.css'
import { MobileViewportOptimizer } from './components/ui/mobile-viewport.tsx'
import { OverflowGuard } from './components/guards/OverflowGuard'
import { DevViewportPresets } from './components/dev/DevViewportPresets'
import { CVFormProvider } from '@/contexts/CVFormContext'

createRoot(document.getElementById("root")!).render(
  <CVFormProvider>
    <MobileViewportOptimizer />
    <OverflowGuard />
    <DevViewportPresets />
    <App />
  </CVFormProvider>
);

