"use client";

import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'af' | 'pt' | 'sw'>('en');

  const configId = process.env['NEXT_PUBLIC_HUME_CONFIG_ID'];
  
  return (
    <div
      className={
        "relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"
      }
    >
      <VoiceProvider
        onMessage={() => {
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = ref.current.scrollHeight;

              ref.current.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
        onClose={async (event) => {
          console.log('Conversation ended:', event);
          
          // Extract conversation transcript
          try {
            // Get messages from the conversation
            const messages = event?.messages || [];
            
            // Build transcript from messages
            let transcript = '';
            let description = '';
            
            messages.forEach((msg: any) => {
              const role = msg.type === 'user_message' ? 'Worker' : 'AI';
              const content = msg.message?.content || '';
              transcript += `${role}: ${content}\n`;
              
              // Collect user messages for description
              if (msg.type === 'user_message') {
                description += content + ' ';
              }
            });

            // Save to database
            const { data, error } = await supabase
              .from('labor_grievances')
              .insert([{
                language: selectedLanguage,
                transcript: transcript || 'Voice conversation (transcript pending)',
                description: description.trim() || 'Voice grievance - awaiting review',
                category: 'other', // Will be categorized later
                urgency: 'medium', // Will be assessed later
                status: 'new'
              }])
              .select()
              .single();

            if (error) {
              console.error('Database save error:', error);
              toast.error('Failed to save grievance');
            } else {
              toast.success(`Grievance saved! Ref: ${data.id.slice(0, 8)}`);
              console.log('Saved grievance:', data);
            }
          } catch (error) {
            console.error('Error processing conversation:', error);
            toast.error('Error processing conversation');
          }
        }}
        onError={(error) => {
          toast.error(error.message);
        }}
      >
        <Messages ref={ref} />
        <Controls />
        <StartCall 
          configId={configId} 
          accessToken={accessToken}
          onLanguageSelect={(lang) => setSelectedLanguage(lang)}
        />
      </VoiceProvider>
    </div>
  );
}
