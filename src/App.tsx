import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import { LoginPage } from './pages/LoginPage';
import { MainPage } from './pages/MainPage';

export default function App() {
  const { user, setUser } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!user) return <LoginPage />;
  return <MainPage />;
}
