import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TripPlannerApp from './TripPlannerApp';
import ThemeSwitch from './components/ThemeSwitch';

const LandingPage = lazy(() => import('./pages/LandingPage'));

/**
 * Root router — landing page at "/" and trip planner at "/app".
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <div className="theme-toggle-fixed">
        <ThemeSwitch />
      </div>

      <Routes>
        <Route
          path="/"
          element={(
            <Suspense fallback={<div className="min-h-screen bg-void" aria-hidden="true" />}>
              <LandingPage />
            </Suspense>
          )}
        />
        <Route path="/app/*" element={<TripPlannerApp />} />
      </Routes>
    </BrowserRouter>
  );
}
