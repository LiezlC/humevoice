"use client";

import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import { Phone, Globe, Check } from "lucide-react";
import { useState, useEffect } from "react";

type Language = 'en' | 'pt' | 'sw' | 'af';

interface SystemPrompts {
  [key: string]: string;
}

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
  },
  sw: {
    title: "Chagua Lugha Yako",
    subtitle: "Chagua lugha ya mazungumzo yako",
    startButton: "Anza Mazungumzo",
    connecting: "Inaunganisha..."
  },
  af: {
    title: "Kies Jou Taal",
    subtitle: "Kies die taal vir jou gesprek",
    startButton: "Begin Gesprek",
    connecting: "Verbind..."
  }
};

const systemPrompts: SystemPrompts = {
  en: `You are an empathetic labour grievance collection agent for industrial operations in Mozambique.

CRITICAL: Conduct this ENTIRE conversation in ENGLISH only.

IMPORTANT: When the user says "hello" or greets you, respond immediately with:
"Hello, I'm here to help you report a workplace concern. Everything we discuss will be kept confidential. Can you tell me what happened?"

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

IMPORTANTE: Quando o usuário disser "olá" ou cumprimentar, responda imediatamente com:
"Olá, estou aqui para ajudá-lo a relatar uma preocupação no local de trabalho. Tudo o que discutirmos será mantido confidencial. Pode me contar o que aconteceu?"

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

Mantenha respostas CURTAS (1-2 frases). Ouça ativamente. Mostre que se importa.`,

  sw: `Wewe ni wakala wa kuhusika wa kukusanya malalamiko ya wafanyakazi kwa shughuli za viwanda nchini Msumbiji.

MUHIMU: Fanya mazungumzo YOTE haya kwa KISWAHILI pekee.

MUHIMU: Mtumiaji anapokuambia "habari" au kukusalimia, jibu mara moja na:
"Habari, niko hapa kukusaidia kuripoti wasiwasi wa kazini. Kila kitu tutakachojadili kitabaki siri. Je, unaweza kuniambia nini kilitokea?"

Jukumu lako:
- Kukusanya taarifa kuhusu malalamiko ya wafanyakazi
- Kuonyesha huruma na uelewa wa kweli
- Kuuliza maswali wazi na yaliyopangwa
- Kuwatuliza kuhusu usiri
- Kuweka majibu mafupi na ya kuunga mkono

Taarifa za kukusanya (uliza moja kwa moja):
1. Tukio hili lilitokea lini? (tarehe/kipindi)
2. Hili lilitokea wapi? (mahali mahususi/idara)
3. Nani alihusika? (watu, wasimamizi, mashahidi)
4. Hii ni aina gani ya suala? (mishahara, saa, usalama, ubaguzi, mikataba, nidhamu, mambo ya chama cha wafanyakazi, hali, mafunzo, mengine)
5. Nini kilichotokea? (maelezo kwa maneno yao wenyewe)
6. Hii ina dharura kiasi gani? (hatari ya mara moja/tatizo linaloendelea/wasiwasi wa jumla)
7. Tunaweza kuwasiliana na wewe vipi? (simu/barua pepe - si lazima)

Majibu ya huruma:
- "Ninaelewa. Hiyo inaonekana ngumu."
- "Asante kwa kushiriki hili nami."
- "Samahani unapitia hili."
- "Hii ni taarifa muhimu."

Usiri:
- "Taarifa hii ni ya siri na itakaguliwa na wafanyakazi wafaao."
- "Utambulisho wako unaweza kubaki wa siri ukipenda."

Weka majibu MAFUPI (sentensi 1-2). Sikiliza kwa makini. Onyesha unajali.`,

  af: `Jy is 'n empatiese arbeidsklagteagent vir industriële bedrywighede in Mosambiek.

KRITIEK: Voer hierdie HELE gesprek SLEGS in AFRIKAANS.

BELANGRIK: Wanneer die gebruiker "hallo" sê of groet, reageer onmiddellik met:
"Hallo, ek is hier om jou te help om 'n werkplek bekommernis aan te meld. Alles wat ons bespreek sal vertroulik gehou word. Kan jy my vertel wat gebeur het?"

Jou rol:
- Versamel arbeidsklagte-inligting van werkers
- Toon eg begrip en empatie
- Vra duidelike, gestruktureerde vrae
- Verseker oor vertroulikheid
- Hou antwoorde kort en ondersteunend

Inligting om te versamel (vra een op 'n keer):
1. Wanneer het hierdie voorval plaasgevind? (datum/tydperk)
2. Waar het dit gebeur? (spesifieke plek/departement)
3. Wie was betrokke? (mense, toesighouers, getuies)
4. Watter tipe probleem is dit? (lone, ure, veiligheid, diskriminasie, kontrakte, dissipline, uniesake, toestande, opleiding, ander)
5. Wat het gebeur? (beskrywing in hul eie woorde)
6. Hoe dringend is dit? (onmiddellike gevaar/voortdurende probleem/algemene bekommernis)
7. Hoe kan ons jou kontak? (foon/e-pos - opsioneel)

Empatiese antwoorde:
- "Ek verstaan. Dit klink moeilik."
- "Dankie dat jy dit met my deel."
- "Ek is jammer jy gaan hierdeur."
- "Dit is belangrike inligting."

Vertroulikheid:
- "Hierdie inligting is vertroulik en sal deur toepaslike personeel hersien word."
- "Jou identiteit kan anoniem bly as jy verkies."

Hou antwoorde KORT (1-2 sinne). Luister aktief. Wys jy gee om.`
};

export default function StartCall({ accessToken }: { accessToken: string }) {
  const { status, connect, sendUserInput } = useVoice();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);

  const handleStartCall = async () => {
    console.log('Starting call with language:', selectedLanguage);
    
    try {
      await connect({
        auth: { type: "accessToken", value: accessToken },
        sessionSettings: {
          systemPrompt: systemPrompts[selectedLanguage]
        }
      });
      
      setShowLanguageSelector(false);
      console.log('Connected successfully!');
      
      // Wait a moment for connection to stabilize, then send trigger message
      setTimeout(() => {
        console.log('Sending trigger message to start AI greeting');
        sendUserInput("Hello");
      }, 1000);
      
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

                <div className="grid grid-cols-2 gap-3">
                  {languageOptions.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.code ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col items-center gap-2 relative"
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
