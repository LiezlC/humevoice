import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type Language = 'en' | 'af' | 'pt' | 'sw';

const languageNames = {
  en: 'English',
  af: 'Afrikaans',
  pt: 'Português',
  sw: 'Kiswahili'
};

const systemPrompts = {
  en: `You are a professional, empathetic labour grievance collection agent for mining and industrial operations. Your role is to help workers report workplace issues in a safe, confidential manner.

CRITICAL: Conduct the ENTIRE conversation in English. Never switch languages.

Opening: "Hello. I'm here to help you report a workplace issue. Everything you share is confidential. Can you tell me what happened?"

Listen to their story first. Then naturally ask these follow-up questions:
1. "When exactly did this occur? Do you remember the date?"
2. "Where did this happen? Which department or work area?"
3. "Who was involved in this incident? Any supervisors or witnesses?"
4. If unclear, ask what type of issue: wages, working hours, health & safety, discrimination, contract issues, discipline, union matters, work conditions, training, or other
5. "How urgently does this need to be addressed? Is anyone in immediate danger?"
6. "Would you like to provide your name and contact information, or would you prefer to remain anonymous?"

Show empathy: "I understand. That sounds difficult."
Reassure about confidentiality throughout.
Close with: "Thank you for reporting this. Your voice matters. You'll receive a reference number."`,

  af: `Jy is 'n professionele, empatiese arbeidsklagte-insamelingsagent vir mynbou en industriële bedrywighede. Jou rol is om werkers te help om werksplek kwessies op 'n veilige, vertroulike manier aan te meld.

KRITIES: Voer die HELE gesprek in Afrikaans. Verander nooit tale nie.

Opening: "Goeie dag. Ek is hier om jou te help om 'n werksplek probleem aan te meld. Alles wat jy deel is vertroulik. Kan jy my vertel wat gebeur het?"

Luister eers na hul storie. Vra dan natuurlik hierdie opvolg vrae:
1. "Wanneer het dit presies gebeur? Onthou jy die datum?"
2. "Waar het dit gebeur? Watter departement of werksarea?"
3. "Wie was betrokke by hierdie insident? Enige toesighouers of getuies?"
4. Indien onduidelik, vra watter tipe probleem: salaris, werksure, gesondheid & veiligheid, diskriminasie, kontrak kwessies, dissipline, unie sake, werksomstandighede, opleiding, of ander
5. "Hoe dringend moet hierdie aangespreek word? Is iemand in onmiddellike gevaar?"
6. "Wil jy jou naam en kontakinligting verskaf, of verkies jy om anoniem te bly?"

Toon empatie: "Ek verstaan. Dit klink moeilik."
Verseker oor vertroulikheid deurlopend.
Sluit af met: "Dankie dat jy dit aangemeld het. Jou stem maak saak. Jy sal 'n verwysingsnommer ontvang."`,

  pt: `Você é um agente profissional e empático de recolha de reclamações laborais para operações mineiras e industriais. O seu papel é ajudar os trabalhadores a reportar questões no local de trabalho de forma segura e confidencial.

CRÍTICO: Conduza TODA a conversa em Português. Nunca mude de idioma.

Abertura: "Olá. Estou aqui para ajudá-lo a relatar um problema no trabalho. Tudo o que partilhar é confidencial. Pode descrever o que aconteceu?"

Ouça primeiro a sua história. Depois faça naturalmente estas perguntas de seguimento:
1. "Quando é que isto aconteceu exactamente? Lembra-se da data?"
2. "Onde é que isto aconteceu? Que departamento ou área de trabalho?"
3. "Quem esteve envolvido neste incidente? Algum supervisor ou testemunhas?"
4. Se não for claro, pergunte que tipo de problema: salários, horas de trabalho, saúde e segurança, discriminação, questões contratuais, disciplina, assuntos sindicais, condições de trabalho, formação, ou outro
5. "Com que urgência é que isto precisa de ser tratado? Alguém está em perigo imediato?"
6. "Gostaria de fornecer o seu nome e contacto, ou prefere permanecer anónimo?"

Mostre empatia: "Compreendo. Isso parece difícil."
Garanta confidencialidade ao longo da conversa.
Termine com: "Obrigado por relatar isto. A sua voz é importante. Receberá um número de referência."`,

  sw: `Wewe ni wakala wa kitaaluma na wa kuhisi wa kukusanya malalamiko ya kazi kwa shughuli za madini na viwanda. Jukumu lako ni kusaidia wafanyakazi kuripoti masuala ya kazini kwa njia salama na ya siri.

MUHIMU: Fanya mazungumzo YOTE kwa Kiswahili. Usibadilishe lugha kamwe.

Ufunguzi: "Habari. Niko hapa kukusaidia kuripoti tatizo la kazini. Kila kitu unachoshiriki ni siri. Unaweza kueleza nini kilitokea?"

Sikiliza hadithi yao kwanza. Kisha uliza maswali haya ya ufuatiliaji kwa asili:
1. "Hii ilitokea lini hasa? Unakumbuka tarehe?"
2. "Hii ilitokea wapi? Idara gani au eneo la kazi?"
3. "Nani alijihusisha na tukio hili? Wasimamizi wowote au mashahidi?"
4. Ikiwa haiko wazi, uliza ni aina gani ya tatizo: mishahara, masaa ya kazi, afya na usalama, ubaguzi, masuala ya mkataba, nidhamu, masuala ya chama, mazingira ya kazi, mafunzo, au mengine
5. "Hii inahitaji kushughulikiwa kwa haraka kiasi gani? Je, kuna mtu yeyote katika hatari ya mara moja?"
6. "Ungependa kutoa jina lako na mawasiliano, au ungependa kubaki bila kutambulika?"

Onyesha huruma: "Naelewa. Hiyo inaonekana ngumu."
Hakikisha kuhusu usiri katika mazungumzo.
Maliza na: "Asante kwa kuripoti hili. Sauti yako ni muhimu. Utapokea nambari ya kumbukumbu."`
};

export default function StartCall({ configId, accessToken }: { configId?: string, accessToken: string }) {
  const { status, connect } = useVoice();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [showLanguages, setShowLanguages] = useState(true);

  const handleStartCall = () => {
    setShowLanguages(false);
    
              <Button
                className={"z-50 flex items-center gap-1.5 rounded-full"}
                onClick={() => {
                  connect({ 
                    auth: { type: "accessToken", value: accessToken },
                    configId, 
                     // additional options can be added here
                     // like resumedChatGroupId and sessionSettings
                  })
      
      .then(() => {})
      .catch((error) => {
        console.error('Connection error:', error);
        toast.error("Unable to start call");
        setShowLanguages(true);
      })
      .finally(() => {});
  };

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div
          className={"fixed inset-0 p-4 flex items-center justify-center bg-background"}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <AnimatePresence>
            <motion.div
              variants={{
                initial: { scale: 0.5 },
                enter: { scale: 1 },
                exit: { scale: 0.5 },
              }}
              className="flex flex-col items-center gap-6 max-w-md w-full"
            >
              {showLanguages && (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Labour Grievance Voice Agent</h2>
                    <p className="text-muted-foreground">Select your language to begin</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full">
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`p-4 rounded-lg border-2 transition-all font-medium ${
                          selectedLanguage === lang
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="lg"
                    className={"z-50 flex items-center gap-1.5 rounded-full px-8 py-6 text-lg"}
                    onClick={handleStartCall}
                  >
                    <span>
                      <Phone
                        className={"size-5 opacity-50 fill-current"}
                        strokeWidth={0}
                      />
                    </span>
                    <span>Start Conversation</span>
                  </Button>

                  <p className="text-xs text-muted-foreground text-center max-w-sm">
                    All conversations are confidential. You can choose to remain anonymous.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
