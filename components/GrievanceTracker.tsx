"use client";

import { useVoice } from "@humeai/voice-react";
import { useEffect, useRef, useState } from "react";
import { saveLaborGrievance, type Language } from "@/utils/supabase";

interface GrievanceTrackerProps {
  language: Language;
}

export default function GrievanceTracker({ language }: GrievanceTrackerProps) {
  const { messages, status, sendToolMessage } = useVoice();
  const [grievanceId, setGrievanceId] = useState<string | null>(null);
  const conversationIdRef = useRef<string>(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const hasConnectedRef = useRef(false);
  const hasSavedRef = useRef(false);
  const savedMessagesRef = useRef<any[]>([]);
  const processedToolCallsRef = useRef<Set<string>>(new Set());

  // Save initial record when conversation starts
  useEffect(() => {
    if (status.value === "connected" && !hasConnectedRef.current) {
      hasConnectedRef.current = true;

      console.log("📝 Creating grievance record with language:", language);

      // Create initial grievance record
      saveLaborGrievance({
        conversation_id: conversationIdRef.current,
        language: language,
        description: "Conversation in progress...",
        status: "new"
      })
        .then((data) => {
          if (data && data[0]) {
            setGrievanceId(data[0].id);
            console.log("✅ Grievance record created successfully:", data[0].id);
            console.log("Created at:", data[0].created_at);
          } else {
            console.error("❌ No data returned from Supabase");
          }
        })
        .catch((error) => {
          console.error("❌ Failed to create initial grievance:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
        });
    }
  }, [status.value, language]);

  // Capture messages while connected (before they get cleared)
  useEffect(() => {
    if (status.value === "connected" && messages.length > 0) {
      savedMessagesRef.current = [...messages];
      console.log("💾 Captured", messages.length, "messages");
    }
  }, [messages, status.value]);

  // Save conversation when it ends
  useEffect(() => {
    if (status.value === "disconnected" && hasConnectedRef.current && !hasSavedRef.current && savedMessagesRef.current.length > 0) {
      hasSavedRef.current = true;

      console.log("💬 Saving conversation with", savedMessagesRef.current.length, "messages");

      // Build full transcript from saved messages
      const transcript = savedMessagesRef.current
        .filter((msg) => msg.type === "user_message" || msg.type === "assistant_message")
        .map((msg) => {
          const role = msg.message.role === "user" ? "User" : "Agent";
          return `${role}: ${msg.message.content}`;
        })
        .join("\n\n");

      console.log("📝 Transcript length:", transcript.length, "characters");
      console.log("📝 First 200 chars:", transcript.substring(0, 200));

      // Extract grievance data from messages
      const grievanceData = extractGrievanceData(savedMessagesRef.current, transcript);
      console.log("📊 Extracted data:", grievanceData);

      // Translate to English if not English
      const saveGrievance = async () => {
        let transcriptEn = transcript;

        // Only translate non-English conversations
        if (language !== 'en') {
          try {
            console.log("🌐 Requesting translation for", language);
            const response = await fetch('/api/translate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: transcript,
                sourceLanguage: language
              })
            });

            if (!response.ok) {
              throw new Error(`Translation API returned ${response.status}`);
            }

            const data = await response.json();
            transcriptEn = data.translatedText;
            console.log("✅ Translation completed for", language);
          } catch (error) {
            console.error("❌ Translation error:", error);
            transcriptEn = `[Translation failed]\n\n${transcript}`;
          }
        }

        // Update the grievance record
        if (grievanceId) {
          const updateData = {
            transcript: transcript,
            transcript_en: transcriptEn,
            ...grievanceData
          };

          console.log("💾 Updating database with:", {
            grievanceId,
            transcriptLength: transcript.length,
            transcript_enLength: transcriptEn.length,
            ...grievanceData
          });

          const { updateLaborGrievance } = await import("@/utils/supabase");
          const result = await updateLaborGrievance(grievanceId, updateData);
          console.log("✅ Database update result:", result);

          // Trigger field extraction API to populate detailed fields
          console.log("🤖 Triggering AI field extraction...");
          try {
            const extractResponse = await fetch('/api/extract-fields', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                grievanceId: grievanceId
              })
            });

            if (extractResponse.ok) {
              const extractResult = await extractResponse.json();
              if (extractResult.skipped) {
                console.log("⊘ Field extraction skipped (already processed)");
              } else {
                console.log("✅ Field extraction completed:", extractResult.extracted);
              }
            } else {
              const errorData = await extractResponse.json();
              console.error("❌ Field extraction API error:", errorData);
            }
          } catch (extractError) {
            console.error("❌ Field extraction request failed:", extractError);
            // Don't throw - we still have the basic transcript saved
          }
        }
      };

      saveGrievance().catch((error) => {
        console.error("❌ Failed to save grievance:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
      });
    }
  }, [status.value, messages, grievanceId, language]);

  // Debug logging
  useEffect(() => {
    console.log("GrievanceTracker status:", {
      status: status.value,
      hasConnected: hasConnectedRef.current,
      hasSaved: hasSavedRef.current,
      grievanceId: grievanceId,
      messageCount: messages.length,
      savedMessageCount: savedMessagesRef.current.length
    });
  }, [status.value, messages.length, grievanceId]);

  // Handle tool calls from EVI in real-time
  useEffect(() => {
    // Only process tool calls if we have a grievance ID and are connected
    if (!grievanceId || status.value !== "connected") {
      return;
    }

    // Look for tool call messages
    const toolCallMessages = messages.filter(
      (msg: any) => msg.type === "tool_call" && !processedToolCallsRef.current.has(msg.toolCallId)
    );

    if (toolCallMessages.length === 0) {
      return;
    }

    // Process each tool call
    toolCallMessages.forEach(async (toolMsg: any) => {
      // Debug: log the entire message structure
      console.log("🔍 Raw tool message:", JSON.stringify(toolMsg, null, 2));

      const { toolCallId, toolName, parameters } = toolMsg;

      // Mark as processed immediately to avoid duplicates
      processedToolCallsRef.current.add(toolCallId);

      console.log("🔧 Tool call received:", toolName, parameters);

      try {
        // Map tool names to database field names
        const toolToFieldMap: { [key: string]: string } = {
          save_submitter_name: 'submitter_name',
          save_contact_info: 'submitter_contact',
          save_incident_date: 'incident_date',
          save_incident_location: 'incident_location',
          save_people_involved: 'people_involved',
          save_category: 'category',
          save_urgency: 'urgency',
          save_description: 'description'
        };

        const fieldName = toolToFieldMap[toolName];

        if (!fieldName) {
          throw new Error(`Unknown tool: ${toolName}`);
        }

        // Extract the field value from parameters
        const fieldValue = parameters.name ||
                          parameters.contact ||
                          parameters.date ||
                          parameters.location ||
                          parameters.people ||
                          parameters.category ||
                          parameters.urgency ||
                          parameters.description;

        if (!fieldValue) {
          throw new Error('No field value provided in parameters');
        }

        // Save to database via API
        const response = await fetch('/api/save-field', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grievanceId: grievanceId,
            fieldName: fieldName,
            fieldValue: fieldValue
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to save field');
        }

        console.log(`✅ Tool call success: ${toolName} -> ${fieldName} = ${fieldValue}`);

        // Send success response back to EVI
        if (sendToolMessage) {
          sendToolMessage({
            type: 'tool_response',
            toolCallId: toolCallId,
            content: `Successfully saved ${fieldName}: ${fieldValue}`
          });
        }

      } catch (error: any) {
        console.error(`❌ Tool call error for ${toolName}:`, error);

        // Send error response back to EVI
        if (sendToolMessage) {
          sendToolMessage({
            type: 'tool_error',
            toolCallId: toolCallId,
            error: error.message || 'Failed to save field',
            content: `Could not save the information. Please continue with the conversation.`
          });
        }
      }
    });

  }, [messages, grievanceId, status.value, sendToolMessage]);

  return null; // This component doesn't render anything
}

// Helper function to extract basic structured data from conversation
// Note: Detailed field extraction is now handled by AI via /api/extract-fields
function extractGrievanceData(messages: any[], transcript: string) {
  const textContent = transcript.toLowerCase();
  const data: any = {};

  // Extract urgency based on keywords (simple heuristic)
  if (textContent.includes("urgent") || textContent.includes("immediate") || textContent.includes("danger")) {
    data.urgency = "high";
  } else if (textContent.includes("critical") || textContent.includes("emergency")) {
    data.urgency = "critical";
  } else {
    data.urgency = "medium"; // Default to medium
  }

  // Extract basic description from first substantial user message
  const userMessages = messages.filter(
    (msg) => msg.type === "user_message" && msg.message.content.length > 20
  );

  if (userMessages.length > 0) {
    // Use the longest user message as temporary description
    const longestMessage = userMessages.reduce((longest, current) =>
      current.message.content.length > longest.message.content.length ? current : longest
    );
    data.description = longestMessage.message.content;
  } else {
    data.description = "Conversation in progress - see transcript";
  }

  return data;
}
