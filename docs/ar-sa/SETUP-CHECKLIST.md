# Arabic Language Setup Checklist

## ✅ Completed Setup

1. **Frontend UI** - Fully configured with Arabic translations and RTL support
2. **System Prompts** - Both with-tools and no-tools versions ready
3. **Database** - Arabic language type configured in Supabase
4. **Translation System** - Arabic-to-English translation ready
5. **Claude Transcriber** - Can process Arabic transcripts directly
6. **Tester Agent Prompt** - Created for testing the system

---

## 🔧 Required Actions

### 1. Create Arabic Agent in Hume EVI

1. Go to [Hume EVI Dashboard](https://platform.hume.ai/)
2. Navigate to "EVI Configurations" → "Create New Configuration"
3. **Name**: "GrieVoice - Arabic (Saudi)"
4. **Language**: Select "Arabic"
5. **Voice Settings**: Choose an appropriate Arabic voice
6. **System Prompt**: Copy and paste content from ONE of these files:
   - **Recommended**: `docs/ar-sa/system-prompt-with-tools.txt` (for production with tool integration)
   - **Alternative**: `docs/ar-sa/system-prompt-no-tools.txt` (for simple testing)
7. **Tools Configuration** (if using with-tools version):
   - Add the same tools as your English/Portuguese agents:
     - `save_submitter_name`
     - `save_incident_date`
     - `save_incident_location`
     - `save_people_involved`
     - `save_category`
     - `save_description`
     - `save_urgency`
     - `save_contact_info`
8. **Save Configuration**
9. **Copy the Config ID** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 2. Update Frontend Code

**File**: `components/StartCall.tsx`

**Line 80** - Replace the placeholder:

```typescript
// BEFORE:
ar: 'PLACEHOLDER_ARABIC_CONFIG_ID'

// AFTER:
ar: 'YOUR-ACTUAL-CONFIG-ID-HERE'
```

Example:
```typescript
const configIds = {
  en: '989fee36-dddf-459f-b2bf-e90644d3aadf',
  pt: 'f1ff7e4d-ea13-4d3f-a1fb-2f3d36580aae',
  ar: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'  // ← Your actual ID
};
```

### 3. Verify Database

Check that your Supabase `labor_grievances` table accepts `'ar'` as a language value:

```sql
-- Check if language column allows 'ar'
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'labor_grievances'
  AND column_name = 'language';
```

The column should be `TEXT` type (it is, according to schema).

---

## 🧪 Testing the Arabic Agent

### Option 1: Test with Tester Agent

Use the tester agent prompt to simulate a worker:

**File**: `docs/ar-sa/tester-agent-prompt.txt`

Create a second Hume configuration:
1. Name: "GrieVoice Tester - Arabic"
2. Paste the tester prompt
3. Have the tester agent call the main Arabic grievance agent

### Option 2: Manual Testing

Test yourself by:
1. Selecting Arabic (🇸🇦 العربية) in the UI
2. Speaking in Saudi dialect Arabic
3. Reporting a test grievance with details:
   - Name
   - Date of incident
   - Location
   - People involved
   - Category (wages, safety, etc.)
   - Description
   - Urgency level

### Expected Behavior

✅ Agent greets you in Arabic (Saudi dialect)
✅ Agent asks follow-up questions in Arabic
✅ Agent shows empathy and professionalism
✅ Agent collects all required information
✅ Transcript saved to database with `language = 'ar'`
✅ English translation generated automatically
✅ Claude extracts structured fields from the transcript

---

## 📋 System Prompt File Paths

For reference when configuring Hume:

| Prompt Type | File Path |
|-------------|-----------|
| **Arabic (with tools)** | `docs/ar-sa/system-prompt-with-tools.txt` |
| **Arabic (no tools)** | `docs/ar-sa/system-prompt-no-tools.txt` |
| **Arabic Tester** | `docs/ar-sa/tester-agent-prompt.txt` |
| **English (with tools)** | `docs/system-prompt-with-tools-english.txt` |
| **English (no tools)** | `docs/system-prompt-no-tools-english.txt` |
| **Portuguese (with tools)** | `docs/system-prompt-with-tools-portuguese.txt` |
| **Portuguese (no tools)** | `docs/system-prompt-no-tools-portuguese.txt` |

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] Arabic config ID added to `StartCall.tsx` line 80
- [ ] Can select Arabic language in UI
- [ ] Voice connection works with Arabic config
- [ ] Agent speaks in Saudi Arabic dialect
- [ ] Conversation transcript saves to database
- [ ] Language field = `'ar'` in database
- [ ] Translation to English works
- [ ] Claude field extraction works
- [ ] All structured fields populate correctly

---

## 🆘 Troubleshooting

### Issue: "Config ID not found"
→ Check that you copied the correct config ID from Hume dashboard

### Issue: Agent doesn't speak Arabic
→ Verify you selected "Arabic" as the language in Hume config
→ Ensure you pasted the Arabic system prompt, not English

### Issue: Translation not working
→ Check `OPENAI_API_KEY` is set in environment variables
→ Verify OpenAI API quota/billing

### Issue: Database won't accept Arabic records
→ Confirm `language` column in Supabase is type TEXT
→ Check Row Level Security policies allow inserts

### Issue: Fields not extracting
→ Check `ANTHROPIC_API_KEY` is set
→ Verify the `/api/extract-fields` endpoint is accessible
→ Check Anthropic API quota/billing

---

## 📞 Support

For questions about:
- **Hume EVI**: Check [Hume Documentation](https://docs.hume.ai/)
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **System Issues**: Contact help@mozambiquelabour.com
