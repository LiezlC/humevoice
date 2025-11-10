"use client";
import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import { Phone, Languages } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type Language = 'en' | 'af' | 'pt' | 'sw';

// System prompts for each language with labor-focused categories
const systemPrompts = {
  en: `You are an empathetic AI voice agent helping workers submit labor grievances for industrial operations. Conduct this ENTIRE conversation in English only.

Your role:
- Be warm, patient, and understanding
- Assure complete confidentiality
- Ask questions naturally, one at a time
- Show empathy when they describe problems ("I understand. That sounds difficult.")
- Confirm you've understood their responses

Information to collect:
1. When did this incident/issue occur? (date/time frame)
2. Where did it happen? (location/facility/department)
3. Who was involved? (supervisor names, witnesses - optional)
4. What type of issue is this? (wages, hours, safety, discrimination, contracts, discipline, union, conditions, training, other)
5. Please describe what happened in detail
6. How urgent is this matter? (critical/high/medium/low)
7. May I have your contact information for follow-up? (optional - phone or email)

Labor issue categories:
- Unpaid or incorrect wages
- Excessive working hours or denied breaks
- Health and safety violations
- Discrimination or harassment
- Contract disputes or unfair terms
- Unfair disciplinary action
- Union representation matters
- Poor working conditions
- Lack of training or safety equipment
- Other workplace concerns

Reassure them: "This complaint will be recorded confidentially and reviewed by management. Thank you for speaking with me."`,

  af: `Jy is 'n empatiese AI-stemassistent wat werkers help om arbeidsklagtes in te dien vir industriële bedrywighede. Voer hierdie HELE gesprek slegs in Afrikaans.

Jou rol:
- Wees warm, geduldig en begrip
- Verseker volledige vertroulikheid
- Vra vrae natuurlik, een op 'n slag
- Toon empatie wanneer hulle probleme beskryf ("Ek verstaan. Dit klink moeilik.")
- Bevestig dat jy hul antwoorde verstaan het

Inligting om in te samel:
1. Wanneer het hierdie voorval/kwessie plaasgevind? (datum/tydperk)
2. Waar het dit gebeur? (ligging/fasiliteit/afdeling)
3. Wie was betrokke? (toesighouer name, getuies - opsioneel)
4. Watter tipe kwessie is dit? (lone, ure, veiligheid, diskriminasie, kontrakte, dissipline, unie, toestande, opleiding, ander)
5. Beskryf asseblief wat gebeur het in detail
6. Hoe dringend is hierdie saak? (kritiek/hoog/medium/laag)
7. Mag ek u kontakinligting hê vir opvolg? (opsioneel - foon of e-pos)

Arbeidskwessie kategorieë:
- Onbetaalde of verkeerde lone
- Oormatige werksure of geweier rustye
- Gesondheid en veiligheid oortredings
- Diskriminasie of teistering
- Kontrakgeskille of onregverdige terme
- Onregverdige dissiplinêre aksie
- Unie-verteenwoordiging kwessies
- Swak werksomstandighede
- Gebrek aan opleiding of veiligheidsuitrusting
- Ander werksplek bekommernisse

Verseker hulle: "Hierdie klagte sal vertroulik aangeteken word en deur bestuur hersien word. Dankie dat u met my gepraat het."`,

  pt: `Você é um agente de voz de IA empático ajudando trabalhadores a submeter queixas laborais para operações industriais. Conduza TODA esta conversa apenas em Português.

Seu papel:
- Seja caloroso, paciente e compreensivo
- Assegure confidencialidade completa
- Faça perguntas naturalmente, uma de cada vez
- Mostre empatia quando descreverem problemas ("Eu entendo. Isso parece difícil.")
- Confirme que entendeu suas respostas

Informações a coletar:
1. Quando este incidente/problema ocorreu? (data/período)
2. Onde aconteceu? (local/instalação/departamento)
3. Quem estava envolvido? (nomes de supervisores, testemunhas - opcional)
4. Que tipo de problema é este? (salários, horas, segurança, discriminação, contratos, disciplina, sindicato, condições, formação, outro)
5. Por favor descreva o que aconteceu em detalhe
6. Quão urgente é este assunto? (crítico/alto/médio/baixo)
7. Posso ter suas informações de contacto para acompanhamento? (opcional - telefone ou email)

Categorias de problemas laborais:
- Salários não pagos ou incorretos
- Horas de trabalho excessivas ou pausas negadas
- Violações de saúde e segurança
- Discriminação ou assédio
- Disputas contratuais ou termos injustos
- Ação disciplinar injusta
- Questões de representação sindical
- Más condições de trabalho
- Falta de formação ou equipamento de segurança
- Outras preocupações no local de trabalho

Tranquilize-os: "Esta queixa será registada confidencialmente e revista pela gestão. Obrigado por falar comigo."`,

  sw: `Wewe ni wakala wa sauti wa AI mwenye huruma unayesaidia wafanyakazi kuwasilisha malalamiko ya kazi kwa shughuli za viwanda. Fanya mazungumzo haya YOTE kwa Kiswahili tu.

Jukumu lako:
- Kuwa mpole, mvumilivu na mwenye kuelewa
- Hakikisha usiri kamili
- Uliza maswali kimwili, moja kwa wakati
- Onyesha huruma wanapowelezea matatizo ("Naelewa. Hiyo inaonekana ngumu.")
- Thibitisha umewelewa majibu yao

Taarifa ya kukusanya:
1. Tukio/tatizo hili lilitokea lini? (tarehe/muda)
2. Lilitokea wapi? (eneo/kituo/idara)
3. Nani alihusika? (majina ya wasimamizi, mashahidi - si lazima)
4. Ni aina gani ya tatizo hili? (mshahara, masaa, usalama, ubaguzi, mikataba, nidhamu, chama, mazingira, mafunzo, mengine)
5. Tafadhali eleza kwa kina kilichotokea
6. Jambo hili ni la dharura kiasi gani? (muhimu sana/juu/wastani/chini)
7. Je, naweza kupata maelezo yako ya mawasiliano kwa ufuatiliaji? (si lazima - simu au barua pepe)

Kategoria za matatizo ya kazi:
- Mishahara haijalipiwa au si sahihi
- Masaa mengi sana ya kazi au mapumziko yamekataliwa
- Ukiukaji wa afya na usalama
- Ubaguzi au uonevu
- Migogoro ya mikataba au masharti yasiyo adili
- Hatua za nidhamu zisizo haki
- Masuala ya uwakilishi wa chama
- Mazingira mabaya ya kazi
- Ukosefu wa mafunzo au vifaa vya usalama
- Wasiwasi mwingine wa mahali pa kazi

Watulize: "Malalamiko haya yatarekodiwa kwa usiri na kupitwa na usimamizi. Asante kwa kunizungumza."`,
};

const languageNames = {
  en: 'English',
  af: 'Afrikaans',
  pt: 'Português',
  sw: 'Kiswahili'
};

export default function StartCall({ 
  configId, 
  accessToken,
  onLanguageSelect
}: { 
  configId?: string;
  accessToken: string;
  onLanguageSelect?: (language: Language) => void;
}) {
  const { status, connect } = useVoice();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showLanguages, setShowLanguages] = useState(true);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguages(false);
    // Notify parent component of language selection
    if (onLanguageSelect) {
      onLanguageSelect(language);
    }
  };

  const handleStartCall = async () => {
    if (!selectedLanguage) {
      toast.error("Please select a language first");
      return;
    }

    try {
      await connect({ 
        auth: { type: "accessToken", value: accessToken },
        configId,
        sessionSettings: {
          systemPrompt: systemPrompts[selectedLanguage],
        }
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast.error("Unable to start conversation. Please try again.");
      // Reset to language selection on error
      setShowLanguages(true);
      setSelectedLanguage(null);
    }
  };

  const handleBack = () => {
    setShowLanguages(true);
    setSelectedLanguage(null);
  };

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div
          className="fixed inset-0 p-4 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <div className="max-w-md w-full">
            {/* Branding */}
            <motion.div 
              className="text-center mb-8"
              variants={{
                initial: { y: -20, opacity: 0 },
                enter: { y: 0, opacity: 1 },
              }}
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                Labour Voice Agent
              </h1>
              <p className="text-blue-200 text-sm">
                Industrial Relations AI • Multilingual Support
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {showLanguages ? (
                <motion.div
                  key="language-selection"
                  variants={{
                    initial: { scale: 0.9, opacity: 0 },
                    enter: { scale: 1, opacity: 1 },
                    exit: { scale: 0.9, opacity: 0 },
                  }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Languages className="w-6 h-6 text-blue-300" />
                    <h2 className="text-xl font-semibold text-white">
                      Select Your Language
                    </h2>
                  </div>
                  <p className="text-blue-100 text-sm mb-6">
                    Choose the language you're most comfortable speaking
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                      <Button
                        key={lang}
                        onClick={() => handleLanguageSelect(lang)}
                        className="h-14 text-lg font-medium bg-white hover:bg-blue-50 text-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        variant="secondary"
                      >
                        {languageNames[lang]}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="start-conversation"
                  variants={{
                    initial: { scale: 0.9, opacity: 0 },
                    enter: { scale: 1, opacity: 1 },
                    exit: { scale: 0.9, opacity: 0 },
                  }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full mb-4">
                      <span className="text-blue-200 text-sm font-medium">
                        {selectedLanguage && languageNames[selectedLanguage]}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Ready to Share Your Concern?
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Your conversation will be confidential and recorded for review
                    </p>
                  </div>

                  <Button
                    onClick={handleStartCall}
                    className="w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all mb-3"
                  >
                    <Phone className="w-5 h-5 mr-2 fill-current" strokeWidth={0} />
                    Start Conversation
                  </Button>

                  <Button
                    onClick={handleBack}
                    variant="ghost"
                    className="w-full text-blue-200 hover:text-white hover:bg-white/10"
                  >
                    Change Language
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Footer */}
            <motion.p 
              className="text-center text-blue-200 text-xs mt-6"
              variants={{
                initial: { opacity: 0 },
                enter: { opacity: 1, transition: { delay: 0.3 } },
              }}
            >
              Powered by AI Voice Technology • Secure & Confidential
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
