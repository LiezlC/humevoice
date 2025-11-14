"use client";

import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import { Phone, Globe, Check, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Language as SupabaseLanguage } from "@/utils/supabase";

// Local type for available languages in this component
type Language = 'en' | 'pt';

interface UITranslations {
  [key: string]: {
    title: string;
    subtitle: string;
    startButton: string;
    connecting: string;
  };
}

const uiTranslations: UITranslations = {
  en: {
    title: "Select Your Language",
    subtitle: "Choose the language for your conversation",
    startButton: "Start Conversation",
    connecting: "Connecting..."
  },
  pt: {
    title: "Selecione o Seu Idioma",
    subtitle: "Escolha o idioma para a sua conversa",
    startButton: "Iniciar Conversa",
    connecting: "Conectando..."
  }
};

export default function StartCall({
  accessToken,
  onLanguageSelect
}: {
  accessToken: string;
  onLanguageSelect?: (language: SupabaseLanguage) => void;
}) {
  const { status, connect } = useVoice();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);

  const languageOptions = [
    { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
    { code: 'pt' as Language, label: 'Português', flag: '🇵🇹' }
  ];

  const configIds = {
    en: '989fee36-dddf-459f-b2bf-e90644d3aadf',
    pt: 'f1ff7e4d-ea13-4d3f-a1fb-2f3d36580aae'
  };

  const handleStartCall = async () => {
    console.log('Starting call with language:', selectedLanguage);

    // Notify parent component of language selection
    if (onLanguageSelect) {
      onLanguageSelect(selectedLanguage as SupabaseLanguage);
    }

    try {
      await connect({
        auth: { type: "accessToken", value: accessToken },
        configId: configIds[selectedLanguage]
      });

      setShowLanguageSelector(false);
      console.log('Connected successfully with config:', configIds[selectedLanguage]);
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const currentTranslations = uiTranslations[selectedLanguage];

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div 
          className="fixed inset-0 p-4 flex items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="max-w-md w-full space-y-6">
            {showLanguageSelector ? (
              <>
                <div className="absolute top-4 right-4">
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="size-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </div>
                <div className="text-center space-y-2">
                  <Globe className="size-12 mx-auto text-primary" />
                  <h2 className="text-2xl font-bold">{currentTranslations.title}</h2>
                  <p className="text-muted-foreground">
                    {currentTranslations.subtitle}
                  </p>
                </div>

                <div className="flex gap-3">
                  {languageOptions.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.code ? "default" : "outline"}
                      className="flex-1 h-auto py-4 flex flex-col items-center gap-2 relative"
                      onClick={() => {
                        console.log('Language selected:', lang.code);
                        setSelectedLanguage(lang.code);
                      }}
                    >
                      {selectedLanguage === lang.code && (
                        <Check className="absolute top-2 right-2 size-4" />
                      )}
                      <span className="text-3xl">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.label}</span>
                    </Button>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleStartCall}
                >
                  <Phone className="size-4 mr-2" />
                  {currentTranslations.startButton}
                </Button>
              </>
            ) : (
              <div className="text-center">
                <div className="animate-pulse">
                  <Phone className="size-12 mx-auto text-primary mb-4" />
                  <p className="text-lg">{currentTranslations.connecting}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
