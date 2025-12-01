"use client";

import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import { Phone, Globe, Check, BarChart3, Shield, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Language as SupabaseLanguage } from "@/utils/supabase";

// Local type for available languages in this component
type Language = 'en' | 'pt';

interface UITranslations {
  [key: string]: {
    title: string;
    subtitle: string;
    heading: string;
    description: string;
    startButton: string;
    connecting: string;
    trustBadge: string;
    privacyBadge: string;
  };
}

const uiTranslations: UITranslations = {
  en: {
    title: "GrieVoice Demo",
    subtitle: "Industrial Relations AI Agent",
    heading: "Submit Your Grievance Confidently",
    description: "Welcome to our service portal. Industrial relations information and grievances with AI-powered voice assistance.",
    startButton: "Start Conversation",
    connecting: "Connecting...",
    trustBadge: "Trust & Safety",
    privacyBadge: "Certified Private"
  },
  pt: {
    title: "GrieVoice Demo",
    subtitle: "Agente de IA de Relações Industriais",
    heading: "Envie a Sua Queixa com Confiança",
    description: "Bem-vindo ao nosso portal de serviços. Informações sobre relações industriais e queixas com assistência de voz alimentada por IA.",
    startButton: "Iniciar Conversa",
    connecting: "Conectando...",
    trustBadge: "Confiança e Segurança",
    privacyBadge: "Certificado Privado"
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
          className="fixed inset-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #3e2723 0%, #0d9488 50%, #fef3c7 100%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dashboard Button */}
          <div className="absolute top-6 right-6">
            <Link href="/dashboard">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-900 shadow-lg"
              >
                <BarChart3 className="size-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Light Mode Toggle (matching the reference image) */}
          <div className="absolute top-6 right-36">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <Globe className="size-4 mr-2" />
              Light mode
            </Button>
          </div>

          <div className="w-full max-w-lg px-4">
            {showLanguageSelector ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-white text-3xl font-bold mb-2">
                    {currentTranslations.title}
                  </h1>
                  <p className="text-white/90 text-sm">
                    {currentTranslations.subtitle}
                  </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                  {/* Illustration placeholder - you can add an actual illustration here */}
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-32 bg-gradient-to-br from-amber-50 to-teal-100 rounded-full flex items-center justify-center">
                      <Phone className="size-16 text-teal-600" />
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentTranslations.heading}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {currentTranslations.description}
                    </p>
                  </div>

                  {/* Language Selection */}
                  <div className="flex gap-3">
                    {languageOptions.map((lang) => (
                      <Button
                        key={lang.code}
                        variant={selectedLanguage === lang.code ? "default" : "outline"}
                        className={`flex-1 h-auto py-4 flex flex-col items-center gap-2 relative transition-all ${
                          selectedLanguage === lang.code
                            ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600'
                            : 'border-2 border-gray-200 hover:border-teal-300 bg-white'
                        }`}
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

                  {/* Start Button */}
                  <Button
                    size="lg"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg"
                    onClick={handleStartCall}
                  >
                    <Phone className="size-5 mr-2" />
                    {currentTranslations.startButton}
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="flex justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Shield className="size-5 text-white" />
                    <span className="text-white text-sm font-medium">
                      {currentTranslations.trustBadge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Lock className="size-5 text-white" />
                    <span className="text-white text-sm font-medium">
                      {currentTranslations.privacyBadge}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="text-center mt-6">
                  <p className="text-white/80 text-xs">
                    Contact: help@mozambiquelabour.com
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-12">
                <div className="text-center">
                  <div className="animate-pulse">
                    <Phone className="size-16 mx-auto text-teal-600 mb-6" />
                    <p className="text-xl font-semibold text-gray-900">
                      {currentTranslations.connecting}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
