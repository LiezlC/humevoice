# HumeVoice Labor Grievance Tracker - Project Summary

## Project Overview
A multilingual voice-based labor grievance collection system for industrial operations in Mozambique. Workers can report workplace concerns via voice conversation in their preferred language (English or Portuguese), and the system automatically captures, translates, and stores the conversations in a Supabase database.

## Tech Stack
- **Framework**: Next.js 14 with TypeScript
- **Voice AI**: Hume EVI (Empathic Voice Interface) with voice-react SDK
- **Database**: Supabase (PostgreSQL)
- **Translation**: OpenAI GPT-3.5-turbo
- **Deployment**: Vercel

## Language Support
- **English** (en): Config ID `989fee36-dddf-459f-b2bf-e90644d3aadf`
- **Portuguese** (pt): Config ID `f1ff7e4d-ea13-4d3f-a1fb-2f3d36580aae`

**Note**: Initially attempted to support Afrikaans and Swahili, but Hume EVI only supports 11 languages (English, Portuguese, Spanish, French, German, Italian, Japanese, Korean, Russian, Hindi, Arabic). Afrikaans and Swahili are not supported.

## Environment Variables Required
```env
# Hume API
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mgjtmqivjcagapkmsjox.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (for translation)
OPENAI_API_KEY=your_openai_api_key
```

## Key Files and Their Purpose

### `components/StartCall.tsx`
- Language selection UI (English/Portuguese)
- Initiates voice connection with appropriate Hume config ID
- Passes selected language to parent component for tracking

**Important**: Uses separate local `Language` type (`'en' | 'pt'`) vs Supabase's full `Language` type (includes `'af' | 'sw'`)

### `components/GrievanceTracker.tsx`
- Invisible component that tracks conversation lifecycle
- Creates initial grievance record when call connects
- Captures messages continuously in `savedMessagesRef` (important for race condition)
- Extracts grievance data (category, urgency, description) from conversation
- Translates non-English conversations to English via API route
- Updates database with full transcript and extracted data when call ends

**Critical Fix**: Uses `savedMessagesRef` to capture messages before Hume SDK clears them on disconnect

### `app/api/translate/route.ts`
- Server-side API route for translation
- Keeps OpenAI API key secure (not exposed to browser)
- Calls OpenAI GPT-3.5-turbo for Portuguese → English translation

**Why needed**: Client components can't access non-`NEXT_PUBLIC_` environment variables

### `utils/supabase.ts`
- TypeScript interfaces and types for database
- Functions: `saveLaborGrievance()`, `updateLaborGrievance()`
- Exports: `Language`, `Category`, `Urgency`, `Status` types

### `utils/translate.ts`
- **DEPRECATED**: Original client-side translation (didn't work due to env var access)
- Kept for reference but not used anymore
- Replaced by `/api/translate` route

## Database Schema

### Table: `labor_grievances`

```sql
CREATE TABLE public.labor_grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT,
  language TEXT NOT NULL, -- 'en', 'pt', 'af', 'sw'
  transcript TEXT, -- Original language transcript
  transcript_en TEXT, -- English translation
  submitter_name TEXT,
  submitter_contact TEXT,
  incident_date DATE,
  incident_location TEXT,
  people_involved TEXT,
  category TEXT, -- 'wages', 'hours', 'safety', 'discrimination', 'harassment', 'contracts', 'discipline', 'union', 'conditions', 'training', 'other'
  description TEXT NOT NULL,
  urgency TEXT, -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'resolved', 'closed'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Important**: Row Level Security (RLS) must be disabled or have permissive policies:
```sql
ALTER TABLE public.labor_grievances DISABLE ROW LEVEL SECURITY;
```

## How It Works - Flow Diagram

1. **User selects language** → StartCall.tsx
2. **Clicks "Start Conversation"** → Connects to Hume with appropriate config ID
3. **Call connects** → GrievanceTracker creates initial database record
4. **During conversation** → Messages captured continuously in ref
5. **User ends call** → Status changes to "disconnected"
6. **GrievanceTracker triggers save**:
   - Builds transcript from saved messages
   - Extracts category, urgency, description via keyword matching
   - Sends transcript to `/api/translate` if Portuguese
   - Updates database record with all data
7. **Data viewable in Supabase dashboard**

## Major Issues Resolved

### Issue 1: Agent Not Speaking Immediately
**Problem**: Agent silent until user spoke first
**Cause**: Using sessionSettings without proper config IDs
**Solution**: Created EVI configs in Hume Portal with system prompts, used config IDs instead

### Issue 2: Unsupported Languages (Afrikaans/Swahili)
**Problem**: Gibberish audio output
**Cause**: Hume EVI doesn't support these languages
**Solution**: Removed unsupported languages, kept English and Portuguese only

### Issue 3: Messages Cleared Before Save
**Problem**: 49 messages captured, but dropped to 0 before save logic ran
**Cause**: Hume SDK clears messages array on disconnect, before useEffect runs
**Solution**: Created `savedMessagesRef` to capture messages continuously while connected

### Issue 4: Translation API Key Not Found
**Problem**: "OPENAI_API_KEY not set" in production
**Cause**: Client components can't access non-NEXT_PUBLIC env vars
**Solution**: Created server-side API route `/api/translate` that has access to env vars

### Issue 5: Transcript Not Saving to Database
**Problem**: Update returned empty array `[]`, transcript remained NULL
**Cause**: Row Level Security (RLS) blocking UPDATE operations
**Solution**: Disabled RLS on `labor_grievances` table

## Current Status - What's Working ✅

- ✅ Language selection (English/Portuguese)
- ✅ Voice conversation with immediate agent greeting
- ✅ Message capture during conversation
- ✅ Automatic database record creation
- ✅ Full transcript saving (original language)
- ✅ English translation of Portuguese conversations
- ✅ Basic category/urgency extraction via keywords
- ✅ Timestamped records in Supabase

## Known Limitations / Future Improvements

### 1. Incomplete Transcriptions
- Voice recognition isn't 100% accurate
- Some messages may be missed if connection is poor

### 2. Basic Category Extraction
Current implementation uses simple keyword matching:
```typescript
if (textContent.includes("wage")) data.category = "wages";
if (textContent.includes("urgent")) data.urgency = "high";
```

**Potential improvements:**
- Use AI/LLM to analyze full transcript for better categorization
- Extract structured data (names, dates, locations) more reliably
- Sentiment analysis for urgency determination

### 3. Limited Field Population
The following fields are often empty:
- `submitter_name`
- `submitter_contact`
- `incident_date`
- `incident_location`
- `people_involved`

**Why**: Current keyword extraction doesn't capture these specifically

**Future**: Could add specific questions in Hume config or post-processing analysis

### 4. No User Authentication
Currently using Supabase anon key with RLS disabled - anyone can read/write

**Future**: Add authentication if needed for privacy/security

## Debugging Tips

### Check if transcript is being generated:
```typescript
console.log("📝 Transcript length:", transcript.length, "characters");
console.log("📝 First 200 chars:", transcript.substring(0, 200));
```

### Check database update payload:
```typescript
console.log("💾 Updating database with:", {
  grievanceId,
  transcriptLength: transcript.length,
  transcript_enLength: transcriptEn.length,
  ...grievanceData
});
```

### Check database response:
```typescript
const result = await updateLaborGrievance(grievanceId, updateData);
console.log("✅ Database update result:", result);
```

**Important**: If result is `[]`, the update failed (likely RLS or permissions issue)

## Quick Reference Commands

```bash
# Install dependencies
pnpm install

# Run locally
npm run dev

# Build
npm run build

# Check git status
git status

# Deploy (auto-deploys via Vercel if connected to GitHub)
git push
```

## Contact & Support
- **Hume Docs**: https://dev.hume.ai/docs
- **Supabase URL**: https://mgjtmqivjcagapkmsjox.supabase.co
- **GitHub Repo**: https://github.com/LiezlC/humevoice

---

**Last Updated**: 2025-11-12
**Status**: Working - transcripts saving successfully to database
