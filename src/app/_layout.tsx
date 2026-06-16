import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useFrenciaFonts } from '@/design';
import { supabase } from '@/lib/supabase';
// PREVIEW TEMPORAL: arranca directo en el flujo de auth para verlo.
import HomeScreen from './home';
import LoginScreen from './login';
import OnboardingScreen from './onboarding';
import ProfileScreen from './profile';
import RegisterScreen from './register';
import SetupWizardScreen from './setup-wizard';

const PREVIEW_AUTH = true;

type AuthView = 'login' | 'register' | 'setup' | 'onboarding' | 'home' | 'profile';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFrenciaFonts();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // No bloquear para siempre si una fuente falla en cargar (web): renderizar igual.
  if (!fontsLoaded && !fontError) return null;

  // Tras el login decide si faltan datos del perfil (primer ingreso) y
  // manda al onboarding, o si ya esta completo va directo al home.
  async function resolveAfterLogin(name?: string) {
    setUserName(name);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthView('home');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('edad, sexo, altura, peso, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

    const incompleto =
      !profile ||
      profile.edad == null ||
      profile.sexo == null ||
      profile.altura == null ||
      profile.peso == null;

    // Primer ingreso con datos faltantes: wizard paso a paso.
    setAuthView(incompleto ? 'setup' : 'home');
  }

  function renderAuth() {
    if (authView === 'home') {
      return (
        <HomeScreen
          userName={userName}
          avatarUrl={avatarUrl}
          onOpenProfile={() => setAuthView('profile')}
        />
      );
    }
    if (authView === 'profile') {
      return (
        <ProfileScreen
          userName={userName}
          avatarUrl={avatarUrl}
          onClose={() => setAuthView('home')}
          onEditProfile={() => setAuthView('onboarding')}
          onAvatarChange={setAvatarUrl}
        />
      );
    }
    if (authView === 'setup') {
      return (
        <SetupWizardScreen userName={userName} onComplete={() => setAuthView('home')} />
      );
    }
    if (authView === 'onboarding') {
      // Edicion del perfil: vuelve a la vista de perfil al guardar o cancelar.
      return (
        <OnboardingScreen
          userName={userName}
          onComplete={() => setAuthView('profile')}
          onCancel={() => setAuthView('profile')}
        />
      );
    }
    if (authView === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthView('register')}
        onLoginSuccess={resolveAfterLogin}
      />
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {PREVIEW_AUTH ? renderAuth() : <AppTabs />}
    </ThemeProvider>
  );
}
