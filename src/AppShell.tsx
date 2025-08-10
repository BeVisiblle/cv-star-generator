import App from './App';
import AppMobile from './mobile/AppMobile';

const FORCE_MOBILE = false;

export default function AppShell() {
  return (
    <>
      <div className={FORCE_MOBILE ? "hidden" : "hidden md:block"}>
        <App />
      </div>

      <div className={FORCE_MOBILE ? "block" : "block md:hidden"}>
        <AppMobile />
      </div>
    </>
  );
}
