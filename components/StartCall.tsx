"use client";

import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import { Phone, Globe, Check } from "lucide-react";
import { useState, useEffect } from "react";

type Language = 'en' | 'pt';

interface SystemPrompts {
  [key: string]: string;
}

interface UITranslations {
  [key: string]: {
    title: string;
    subtitle: string;
    instruction: string;
    startButton: string;
    connecting: string;
    sayHello: string;
  };
}

const uiTranslations: UITranslations = {
  en: {
    title: "Select Your Language",
    subtitle: "Choose the language for your conversation",
    instruction: "After connecting, say 'Hello' to begin",
    startButton: "Start Conversation",
    connecting: "Connecting...",
    sayHello: "Say 'Hello' to start"
  },
  pt: {
    title: "Selecione o Seu Idioma",
    subtitle: "Escolha o idioma para a sua conversa",
    instruction: "Após conectar, diga 'Olá' para começar",
    startButton: "Iniciar Conversa",
    connecting: "Conectando...",
    sayHello: "Diga 'Olá' para começar"
  }
};

const systemPrompts: SystemPrompts = {
  en: `You are an empathetic labour grievance collection agent for industrial operations in Mozambique.

CRITICAL: Conduct this ENTIRE conversation in ENGLISH only.

START THE CONVERSATION: Begin by warmly greeting the person and introducing yourself. Say something like: "Hello, I'm here to help you report a workplace concern. Everything we discuss will be kept confidential. Can you tell me what happened?"

Your role:
- Collect labour grievance information from workers
- Show genuine empathy and understanding
- Ask clear, structured questions
- Reassure about confidentiality
- Keep responses brief and supportive

Information to collect (ask one at a time):
1. When did this incident occur? (date/timeframe)
2. Where did this happen? (specific location/department)
3. Who was involved? (people, supervisors, witnesses)
4. What type of issue is this? (wages, hours, safety, discrimination, contracts, discipline, union matters, conditions, training, other)
5. What happened? (description in their own words)
6. How urgent is this? (immediate danger/ongoing problem/general concern)
7. How can we contact you? (phone/email - optional)

Empathetic responses:
- "I understand. That sounds difficult."
- "Thank you for sharing this with me."
- "I'm sorry you're experiencing this."
- "This is important information."

Confidentiality:
- "This information is confidential and will be reviewed by appropriate personnel."
- "Your identity can remain anonymous if you prefer."

Keep responses SHORT (1-2 sentences). Listen actively. Show you care.`,

  pt: `Você é um agente empático de coleta de queixas trabalhistas para operações industriais em Moçambique.

CRÍTICO: Conduza toda esta conversa APENAS em PORTUGUÊS.

INICIE A CONVERSA: Comece cumprimentando calorosamente a pessoa e apresentando-se. Diga algo como: "Olá, estou aqui para ajudá-lo a relatar uma preocupação no local de trabalho. Tudo o que discutirmos será mantido confidencial. Pode me contar o que aconteceu?"

Seu papel:
- Coletar informações sobre queixas trabalhistas dos trabalhadores
- Mostrar empatia e compreensão genuínas
- Fazer perguntas claras e estruturadas
- Tranquilizar sobre confidencialidade
- Manter respostas breves e solidárias

Informações a coletar (perguntar uma de cada vez):
1. Quando este incidente ocorreu? (data/período)
2. Onde isto aconteceu? (localização específica/departamento)
3. Quem esteve envolvido? (pessoas, supervisores, testemunhas)
4. Que tipo de problema é este? (salários, horas, segurança, discriminação, contratos, disciplina, assuntos sindicais, condições, formação, outro)
5. O que aconteceu? (descrição nas suas próprias palavras)
6. Quão urgente é isto? (perigo imediato/problema contínuo/preocupação geral)
7. Como podemos contactá-lo? (telefone/email - opcional)

Respostas empáticas:
- "Eu compreendo. Isso parece difícil."
- "Obrigado por partilhar isto comigo."
- "Lamento que esteja a passar por isto."
- "Esta é informação importante."

Confidencialidade:
- "Esta informação é confidencial e será revista pelo pessoal apropriado."
- "A sua identidade pode permanecer anónima se preferir."

Mantenha respostas CURTAS (1-2 frases). Ouça ativamente. Mostre que se importa.`
};

export default function StartCall({ accessToken }: { accessToken: string }) {
  const { status, connect } = useVoice();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);

  const languageOptions = [
    { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
    { code: 'pt' as Language, label: 'Português', flag: '🇵🇹' }
  ];

  const handleStartCall = async () => {
    console.log('Starting call with language:', selectedLanguage);

    try {
      await connect({
        auth: { type: "accessToken", value: accessToken },
        sessionSettings: {
          type: "session_settings",
          systemPrompt: systemPrompts[selectedLanguage]
        }
      });

      setShowLanguageSelector(false);
      console.log('Connected successfully!');
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

                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <p className="text-sm text-center font-medium text-foreground">
                    {currentTranslations.instruction}
                  </p>
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
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <Phone className="size-12 mx-auto text-primary mb-4" />
                  <p className="text-lg">{currentTranslations.connecting}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
                  <p className="text-base font-semibold text-primary">
                    {currentTranslations.sayHello}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
