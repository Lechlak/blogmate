import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface WordPressConfig {
  siteUrl: string;
  username: string;
  appPassword: string;
}

interface AppContextType {
  session: Session | null;
  wordpressConfig: WordPressConfig;
  setWordpressConfig: (config: WordPressConfig) => void;
  clearSettings: () => void;
}

const defaultContext: AppContextType = {
  session: null,
  wordpressConfig: {
    siteUrl: '',
    username: '',
    appPassword: '',
  },
  setWordpressConfig: () => {},
  clearSettings: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [wordpressConfig, setWordpressConfig] = useState<WordPressConfig>({
    siteUrl: '',
    username: '',
    appPassword: '',
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Load settings from Supabase when session changes
    const loadSettings = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('wordpress_config')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error loading settings:', error);
          return;
        }

        if (data?.wordpress_config) {
          setWordpressConfig(data.wordpress_config);
        }
      }
    };

    loadSettings();
  }, [session]);

  const updateWordPressConfig = async (config: WordPressConfig) => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        wordpress_config: config,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving settings:', error);
      throw error;
    }

    setWordpressConfig(config);
  };

  const clearSettings = async () => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('user_settings')
      .update({
        wordpress_config: {},
      })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error clearing settings:', error);
      throw error;
    }

    setWordpressConfig({
      siteUrl: '',
      username: '',
      appPassword: '',
    });
  };

  return (
    <AppContext.Provider
      value={{
        session,
        wordpressConfig,
        setWordpressConfig: updateWordPressConfig,
        clearSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};