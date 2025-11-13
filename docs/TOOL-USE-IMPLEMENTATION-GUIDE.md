# Hume EVI Tool Use Implementation Guide

This guide explains how to set up real-time field capture for your labor grievance system using Hume AI's tool use feature.

## Overview

**What we've built:**
- Real-time field saving during conversations (not just post-call)
- 8 tools that save individual fields as they're collected
- New API endpoint `/api/save-field` for real-time database updates
- Updated `GrievanceTracker` component with tool call handling
- Updated system prompts instructing agents when to use tools

## Architecture

```
Voice Call → EVI detects info → Calls tool → GrievanceTracker receives it
→ /api/save-field updates DB → Send response to EVI → Continue conversation
```

## Files Created/Modified

### New Files:
1. `/docs/hume-tool-schemas.json` - Tool definitions for Hume platform
2. `/app/api/save-field/route.ts` - API endpoint for real-time field saves
3. `/docs/system-prompt-with-tools-english.txt` - Updated English prompt
4. `/docs/system-prompt-with-tools-portuguese.txt` - Updated Portuguese prompt
5. `/docs/TOOL-USE-IMPLEMENTATION-GUIDE.md` - This file

### Modified Files:
1. `/components/GrievanceTracker.tsx` - Added tool call handler logic

## Setup Instructions

### Step 1: Configure Tools in Hume Platform

1. Go to [Hume AI Platform](https://platform.hume.ai)
2. Navigate to your EVI configurations
3. **For English config** (`989fee36-dddf-459f-b2bf-e90644d3aadf`):
   - Click "Edit Configuration"
   - Go to "Tools" section
   - Add each tool from `/docs/hume-tool-schemas.json`
   - Save configuration

4. **For Portuguese config** (`f1ff7e4d-ea13-4d3f-a1fb-2f3d36580aae`):
   - Repeat the same process

### Step 2: Configure Supplemental LLM

Tools require a supplemental LLM. You already have `ANTHROPIC_API_KEY` in your `.env.local`:

1. In each Hume configuration, go to "Language Model" section
2. Select "Anthropic Claude" as supplemental LLM
3. EVI will use your API key automatically

### Step 3: Update System Prompts

1. Copy the content from:
   - `/docs/system-prompt-with-tools-english.txt` for English config
   - `/docs/system-prompt-with-tools-portuguese.txt` for Portuguese config

2. In Hume platform, paste into the "System Prompt" field for each config

3. Save the configurations

### Step 4: Deploy Changes

The code changes are already implemented. You need to:

```bash
# Commit and push changes
git add .
git commit -m "Add Hume EVI tool use for real-time field capture"
git push

# Vercel will automatically deploy
```

## Tool Definitions

Here are the 8 tools configured:

| Tool Name | Database Field | When to Call |
|-----------|----------------|--------------|
| `save_submitter_name` | `submitter_name` | After confirming worker's name spelling |
| `save_contact_info` | `submitter_contact` | After collecting phone/email |
| `save_incident_date` | `incident_date` | After worker provides timeframe |
| `save_incident_location` | `incident_location` | After collecting location/department |
| `save_people_involved` | `people_involved` | After collecting involved names |
| `save_category` | `category` | After determining grievance type |
| `save_urgency` | `urgency` | After assessing urgency level |
| `save_description` | `description` | After worker describes the issue |

## How It Works

### During a Call:

1. **Worker provides info**: "My name is João Silva, J-O-A-O S-I-L-V-A"
2. **EVI decides to save it**: Calls `save_submitter_name` with `{name: "João Silva"}`
3. **Your code receives tool call**: `GrievanceTracker` detects the tool call message
4. **API updates database**: Calls `/api/save-field` with grievanceId and field data
5. **Database updated immediately**: Field saved in real-time
6. **Response sent to EVI**: Tool response confirms success
7. **Conversation continues**: EVI might say "Got it, João. Now, when did this happen?"

### Console Output:

```
📝 Creating grievance record with language: pt
✅ Grievance record created successfully: abc-123-def
🔧 Tool call received: save_submitter_name { name: 'João Silva' }
📝 Saving field "submitter_name" for grievance abc-123-def
   Value: João Silva
✅ Field "submitter_name" saved successfully
✅ Tool call success: save_submitter_name -> submitter_name = João Silva
```

## Testing

### Manual Testing:

1. Start a voice call in your app
2. Watch browser console for tool call logs
3. Check Supabase database to see fields populate in real-time
4. Test with Portuguese and English

### What to Look For:

- ✅ Tool call messages appearing in console: `🔧 Tool call received:`
- ✅ Successful saves: `✅ Field "..." saved successfully`
- ✅ Database updates in real-time (check Supabase during call)
- ✅ EVI responding naturally after saving info

### Troubleshooting:

**Problem: No tool calls received**
- Check that tools are added to Hume config
- Verify supplemental LLM is configured (Claude/Anthropic)
- Check system prompt includes tool usage instructions

**Problem: Tool calls fail**
- Check browser console for error messages
- Verify `/api/save-field` endpoint is working
- Check Supabase credentials in `.env.local`

**Problem: Wrong fields saved**
- Verify tool names match exactly in Hume config
- Check `toolToFieldMap` in `GrievanceTracker.tsx`

## Benefits of This Approach

### ✅ Redundancy Layers:

1. **Real-time tool use** - Saves fields as conversation happens
2. **Post-call AI extraction** - Your existing `/api/extract-fields` still runs
3. **Manual script** - Your `extract-grievance-fields.js` as backup

### ✅ Partial Data Capture:

If connection drops mid-call, you already have whatever was collected up to that point.

### ✅ Real-time Validation:

EVI can confirm with worker: "I've recorded your name as João Silva. Is that correct?"

### ✅ Learning Opportunity:

You're exploring Hume's tool use capabilities for future projects!

## API Endpoint: /api/save-field

### Request:
```json
POST /api/save-field
{
  "grievanceId": "abc-123-def",
  "fieldName": "submitter_name",
  "fieldValue": "João Silva"
}
```

### Response (Success):
```json
{
  "success": true,
  "fieldName": "submitter_name",
  "fieldValue": "João Silva",
  "message": "Saved submitter_name successfully"
}
```

### Response (Error):
```json
{
  "success": false,
  "error": "Failed to update database",
  "details": "..."
}
```

### Security:

- Validates field names against whitelist
- Uses Supabase service role key (server-side only)
- Prevents SQL injection
- Requires all parameters

## Next Steps

1. ✅ Add tools to Hume configurations
2. ✅ Update system prompts
3. ✅ Deploy to Vercel
4. ✅ Test with real conversations
5. ✅ Monitor console logs and database
6. ✅ Iterate based on results

## Notes

- Tool use is **optional** - your post-call extraction still works as backup
- If a tool fails, EVI continues conversation naturally
- You can add more tools later for additional fields
- Tool responses help EVI provide better confirmations to users

## Questions?

Check:
- Hume docs: https://dev.hume.ai/docs/empathic-voice-interface-evi/tool-use
- Your implementation: `/components/GrievanceTracker.tsx`
- Tool schemas: `/docs/hume-tool-schemas.json`

Happy testing! 🎉
