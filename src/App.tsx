import { useEffect, useState } from 'react';
import { Sprout } from 'lucide-react';
import { AboutView } from './components/AboutView';
import { AdminPortal } from './components/AdminPortal';
import { ContactView } from './components/ContactView';
import { HomeView } from './components/HomeView';
import { NavLayout, type NavTab } from './components/NavLayout';
import { StudentView } from './components/StudentView';
import { TeacherView } from './components/TeacherView';
import type { RoutineData } from './types/routine';

const THEME_STORAGE_KEY = 'agri_routine_theme';

export function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() =>
    window.location.pathname.startsWith('/admin')
  );

  // Dark Mode is the default
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light') return false;
    return true;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const onPopState = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let active = true;
    const loadRoutine = async () => {
      try {
        setLoading(true);
        const res = await fetch('/data/routine.json');
        if (!res.ok) {
          throw new Error(`Failed to load routine (${res.status})`);
        }
        const data = (await res.json()) as RoutineData;
        if (active) {
          setRoutine(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load routine data.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadRoutine();
    return () => {
      active = false;
    };
  }, []);

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E1012] print:bg-white text-[#0F172A] dark:text-[#F3F4F6] print:text-black transition-colors">
      <div className={!isAdminRoute ? 'md:pl-32 pb-24 md:pb-8 print:pl-0 print:pb-0' : 'pb-12 print:pb-0'}>
        <main className="max-w-2xl mx-auto px-4 py-8 print:max-w-none print:p-0">
          {isAdminRoute ? (
            <AdminPortal onBackHome={navigateHome} />
          ) : loading ? (
            <div className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-10 text-center space-y-3">
              <Sprout className="w-8 h-8 text-[#15803D] dark:text-[#10B981] mx-auto animate-pulse" />
              <p className="text-base font-semibold text-[#64748B] dark:text-[#9CA3AF]">
                Loading Agricultural Science routine...
              </p>
            </div>
          ) : error || !routine ? (
            <div className="rounded-2xl bg-white dark:bg-[#16191D] border border-red-500/30 p-6 text-center space-y-2">
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                Could not load schedule
              </p>
              <p className="text-base text-[#64748B] dark:text-[#9CA3AF]">
                {error ?? 'Missing routine data.'}
              </p>
            </div>
          ) : activeTab === 'home' ? (
            <HomeView
              semester={routine.semester}
              version={routine.version}
              isDark={isDark}
              onToggleDark={() => setIsDark((d) => !d)}
            />
          ) : activeTab === 'student' ? (
            <StudentView
              routine={routine}
              isDark={isDark}
              onToggleDark={() => setIsDark((d) => !d)}
            />
          ) : activeTab === 'teacher' ? (
            <TeacherView
              routine={routine}
              isDark={isDark}
              onToggleDark={() => setIsDark((d) => !d)}
            />
          ) : activeTab === 'about' ? (
            <AboutView
              semester={routine.semester}
              version={routine.version}
              effectiveDate={routine.effective_date}
              isDark={isDark}
              onToggleDark={() => setIsDark((d) => !d)}
            />
          ) : (
            <ContactView
              isDark={isDark}
              onToggleDark={() => setIsDark((d) => !d)}
            />
          )}
        </main>
      </div>

      {!isAdminRoute && (
        <NavLayout activeTab={activeTab} onChangeTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;
