# Voice AI Labor Grievance System - Cost Analysis 2025

## Executive Summary

This document provides a comprehensive cost analysis for operating the multilingual voice-based labor grievance collection system. Analysis includes current infrastructure costs and projections for scaling to production, including phone integration capabilities.

**Last Updated:** November 17, 2025

---

## Current System Architecture

### Active Services
1. **Hume EVI** - Voice interface (speech recognition, conversation handling, text-to-speech)
2. **Anthropic Claude Sonnet 4** - Structured field extraction from transcripts
3. **OpenAI GPT-3.5-turbo** - Portuguese to English translation
4. **Supabase** - PostgreSQL database and storage
5. **Vercel** - Hosting and serverless functions
6. **Next.js** - Frontend framework

### Typical Usage Pattern (Based on Demo Transcripts)
- **Average conversation length:** 5-10 minutes
- **Average transcript length:** 1,500-3,000 characters
- **Languages supported:** English, Portuguese
- **Conversation flow:**
  1. User starts voice conversation (Hume EVI)
  2. Transcript saved to database (Supabase)
  3. If Portuguese, translate to English (OpenAI)
  4. Extract structured fields (Claude)
  5. Display in dashboard

---

## Service Pricing Breakdown (2025)

### 1. Hume AI EVI (Voice Interface)

**Pricing:**
- **EVI 2 (Current):** $0.072/minute
- **EVI 3 (Latest):** Starting at $0.02/minute for high volume (TBA for standard pricing)
- **Volume discounts:** Available at scale

**Per Conversation (assuming 7.5 min average):**
- EVI 2: $0.54 per conversation
- EVI 3: ~$0.15 per conversation (estimated high volume)

---

### 2. Anthropic Claude API (Field Extraction)

**Model:** Claude Sonnet 4.5

**Pricing:**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Per Conversation Estimate:**
- Input: ~2,500 tokens (transcript + prompt) = $0.0075
- Output: ~200 tokens (JSON response) = $0.003
- **Total per extraction:** ~$0.0105

**Cost Optimizations Available:**
- Prompt caching: Up to 90% savings on repeated prompts
- Batch API: 50% discount for async processing

---

### 3. OpenAI GPT-3.5-turbo (Translation)

**Pricing:**
- Input: $0.50 per million tokens
- Output: $1.50 per million tokens

**Per Conversation (Portuguese only):**
- Input: ~2,000 tokens = $0.001
- Output: ~2,000 tokens = $0.003
- **Total per translation:** ~$0.004

**Note:** Only applies to Portuguese conversations (~50% if bilingual deployment)

---

### 4. Supabase (Database)

**Plans:**
- **Free:** $0/month - 500 MB database, 1 GB storage, 2 projects (pauses after 7 days inactive)
- **Pro:** $25/month - 8 GB database, 100 GB storage, 250 GB bandwidth
- **Team:** $599/month - Enhanced security, SLAs, longer retention
- **Enterprise:** Custom pricing

**Storage Costs (Pro Plan):**
- Overage: $0.021/GB/month after 100 GB

**Per Conversation Storage:**
- ~15 KB per grievance record (transcript, metadata, extracted fields)
- 1,000 conversations = ~15 MB
- 10,000 conversations = ~150 MB
- 100,000 conversations = ~1.5 GB

---

### 5. Vercel (Hosting)

**Plans:**
- **Hobby:** Free - 150K serverless function invocations/month, basic features
- **Pro:** $20/month + usage
  - 40 hours active CPU time included
  - 1 TB bandwidth included
  - Overage: $5/additional hour CPU time
  - Edge requests: $2/million

**Per Conversation Estimate:**
- ~5 serverless function calls (translation, field extraction triggers)
- Minimal CPU time (<1 second per conversation)
- Bandwidth: ~50 KB per session

**For most scenarios:** Hobby plan sufficient for testing; Pro plan needed for production

---

## Additional Services for Expansion

### 6. Twilio (Phone Integration)

**Required for:** Calling system via phone numbers instead of web interface

**Pricing:**
- **Local calls (US):**
  - Inbound: $0.0085/minute
  - Outbound: $0.0140/minute
- **Toll-free calls (US):**
  - Inbound: $0.0220/minute
  - Outbound: $0.0140/minute
- **International rates:** Vary by country (Mozambique higher)
- **Phone number rental:** ~$1-2/month per number

**Per Conversation (7.5 min avg, toll-free inbound):**
- Call cost: $0.165
- Combined with Hume EVI: $0.165 + $0.54 = **$0.705 total**

---

### 7. ElevenLabs (Alternative Voice Provider)

**Use Case:** Enhanced voice quality, custom voices, or alternative to Hume for TTS only

**Pricing:**
- **Free:** 10,000 credits/month (~10 minutes audio)
- **Starter:** $5/month - 30,000 credits
- **Creator:** $22/month - 100,000 credits
- **Pro:** $99/month - 500,000 credits
- **Conversational AI:** $0.10/minute (recently reduced 50%)

**Per Conversation:**
- Text-to-speech only: ~$0.75 (7.5 min)
- Would require separate STT solution (Whisper)

---

### 8. OpenAI Whisper (Alternative Speech-to-Text)

**Use Case:** Alternative to Hume for speech recognition only

**Pricing:**
- Whisper: $0.006/minute
- GPT-4o Mini Transcribe: $0.003/minute (cheaper)

**Per Conversation (7.5 min):**
- Whisper: $0.045
- GPT-4o Mini: $0.0225

**Note:** Would require separate solution for response generation and TTS. Hume EVI is more cost-effective as an all-in-one solution.

---

## Cost Scenarios

### Scenario 1: Pilot/Testing Phase
**Volume:** 50 conversations/month
**Languages:** 50% English, 50% Portuguese
**Infrastructure:** Web-based only

| Service | Calculation | Monthly Cost |
|---------|-------------|--------------|
| Hume EVI (EVI 2) | 50 × $0.54 | $27.00 |
| Claude Field Extraction | 50 × $0.0105 | $0.53 |
| OpenAI Translation | 25 × $0.004 | $0.10 |
| Supabase | Free plan | $0.00 |
| Vercel | Hobby plan | $0.00 |
| **TOTAL** | | **$27.63/month** |

**Per conversation cost:** $0.55

---

### Scenario 2: Small Deployment
**Volume:** 500 conversations/month
**Languages:** 50% English, 50% Portuguese
**Infrastructure:** Web-based

| Service | Calculation | Monthly Cost |
|---------|-------------|--------------|
| Hume EVI (EVI 2) | 500 × $0.54 | $270.00 |
| Claude Field Extraction | 500 × $0.0105 | $5.25 |
| OpenAI Translation | 250 × $0.004 | $1.00 |
| Supabase | Pro plan | $25.00 |
| Vercel | Pro plan | $20.00 |
| **TOTAL** | | **$321.25/month** |

**Per conversation cost:** $0.64

---

### Scenario 3: Medium Production
**Volume:** 2,000 conversations/month
**Languages:** 50% English, 50% Portuguese
**Infrastructure:** Web + Phone (Twilio)
**Split:** 60% web, 40% phone

| Service | Calculation | Monthly Cost |
|---------|-------------|--------------|
| Hume EVI (EVI 2) | 2,000 × $0.54 | $1,080.00 |
| Twilio (phone calls) | 800 × 7.5 min × $0.022 | $132.00 |
| Claude Field Extraction | 2,000 × $0.0105 | $21.00 |
| OpenAI Translation | 1,000 × $0.004 | $4.00 |
| Supabase | Pro plan + overage | $30.00 |
| Vercel | Pro plan + overage | $30.00 |
| **TOTAL** | | **$1,297.00/month** |

**Per conversation cost:** $0.65

---

### Scenario 4: Large Scale Production
**Volume:** 10,000 conversations/month
**Languages:** 50% English, 50% Portuguese
**Infrastructure:** Web + Phone (Twilio)
**Split:** 40% web, 60% phone
**Optimizations:** EVI 3 pricing, prompt caching enabled

| Service | Calculation | Monthly Cost |
|---------|-------------|--------------|
| Hume EVI (EVI 3) | 10,000 × $0.15 | $1,500.00 |
| Twilio (phone calls) | 6,000 × 7.5 min × $0.022 | $990.00 |
| Claude (w/ caching) | 10,000 × $0.0015 | $15.00 |
| OpenAI Translation | 5,000 × $0.004 | $20.00 |
| Supabase | Team plan | $599.00 |
| Vercel | Pro plan + overage | $50.00 |
| **TOTAL** | | **$3,174.00/month** |

**Per conversation cost:** $0.32

**Annual projection:** $38,088

---

### Scenario 5: Enterprise Scale
**Volume:** 50,000 conversations/month
**Languages:** 40% English, 60% other languages
**Infrastructure:** Multi-channel (Web, Phone, potential video)
**Optimizations:** Volume discounts negotiated

| Service | Calculation | Monthly Cost |
|---------|-------------|--------------|
| Hume EVI (negotiated rate) | 50,000 × $0.12 | $6,000.00 |
| Twilio (70% phone) | 35,000 × 7.5 min × $0.020 | $5,250.00 |
| Claude (batch API) | 50,000 × $0.001 | $50.00 |
| OpenAI Translation | 30,000 × $0.004 | $120.00 |
| Supabase | Enterprise plan | $1,200.00 |
| Vercel | Pro plan + enterprise features | $200.00 |
| **TOTAL** | | **$12,820.00/month** |

**Per conversation cost:** $0.26

**Annual projection:** $153,840

---

## Alternative Architecture Scenarios

### Option A: ElevenLabs + Whisper (Instead of Hume)
**Pros:** Potentially higher voice quality, more voice customization
**Cons:** More complex integration, separate services to manage

**Cost per conversation:**
- Whisper STT: $0.045
- ElevenLabs TTS: $0.75
- GPT-4 for response generation: ~$0.10
- **Total:** $0.895 (65% more expensive than Hume EVI 2)

**Conclusion:** Not cost-effective for this use case. Hume EVI provides better value.

---

### Option B: Multi-Language Expansion
**Adding:** Afrikaans, Swahili support via translation

**Challenge:** Hume EVI doesn't natively support these languages
**Solution:** Use Whisper for STT (supports 99+ languages) + GPT-4 for translation + ElevenLabs multilingual for TTS

**Additional costs per conversation:**
- Translation chain: +$0.02-0.04
- Alternative voice synthesis: +$0.20

**Recommendation:** Evaluate demand before implementing; significant complexity increase

---

### Option C: Video Agent Integration
**Use Case:** Visual documentation of workplace issues

**Additional services needed:**
- Video storage (Supabase storage or S3)
- Video processing/transcription
- Increased bandwidth (Vercel or CDN)

**Estimated additional costs:**
- Storage: $0.05-0.10/GB/month
- Processing: $0.50-2.00 per video
- Bandwidth: Included in most scenarios up to 1TB

**Recommendation:** Pilot separately; may require dedicated video solution

---

## Hidden Costs & Considerations

### 1. Development & Maintenance
- **Initial setup:** Already complete
- **Ongoing maintenance:** 5-10 hours/month (~$500-1,000 developer time)
- **Feature additions:** Variable
- **Monitoring & debugging:** Minimal with current stack

### 2. Compliance & Security
- **Data privacy:** Supabase Team/Enterprise for HIPAA, SOC 2 (~$575/month additional)
- **Audit logs:** Included in Supabase Team plan
- **Backup storage:** ~$10-20/month additional

### 3. Support & Training
- **End-user support:** Variable (depends on volume)
- **API support:** Included in all pricing
- **Documentation:** One-time cost (mostly complete)

### 4. Geographic Considerations
**Mozambique-specific factors:**
- International calling rates via Twilio: Higher than US rates (~$0.10-0.30/min)
- SMS notifications (if added): ~$0.05-0.10 per message
- Local phone numbers: Limited availability, may require SIP trunking

---

## Optimization Strategies

### Short-term (0-3 months)
1. **Use Supabase Free tier** while in pilot ($25/month savings)
2. **Use Vercel Hobby plan** for testing ($20/month savings)
3. **Implement Claude prompt caching** (up to 90% savings on field extraction)
4. **Batch process translations** overnight (50% savings with OpenAI batch API)

### Medium-term (3-12 months)
1. **Negotiate Hume EVI volume discount** at 1,000+ conversations/month
2. **Upgrade to EVI 3** when generally available (~70% cost reduction)
3. **Implement conversation length optimization** (reduce avg from 7.5 to 5 minutes)
4. **Cache common translations** (reduce duplicate translation costs)

### Long-term (12+ months)
1. **Self-host Whisper** for STT if volume exceeds 100K minutes/month
2. **Negotiate enterprise agreements** with Anthropic, Hume
3. **Implement tiered storage** (archive old grievances to cheaper storage)
4. **Regional optimization** (use local inference for latency-sensitive operations)

---

## Break-even Analysis

### When does phone integration become viable?

**Web-only cost per conversation:** $0.55
**Phone-enabled cost per conversation:** $0.72
**Difference:** $0.17 per call

**Question:** Is the $0.17 premium worth accessibility gains?

**Considerations:**
- Workers without smartphones: Phone essential
- Areas with poor internet: Phone more reliable
- Privacy concerns: Phone may reduce barrier to reporting
- Cultural factors: Voice call may be more trusted

**Conclusion:** If >30% of target users cannot access web interface, phone integration justified despite higher costs.

---

## Recommendations by Deployment Phase

### Phase 1: Proof of Concept (Month 1-2)
- **Infrastructure:** Free/Hobby tiers only
- **Services:** Hume EVI 2, Claude, OpenAI, Supabase Free, Vercel Hobby
- **Expected volume:** 10-50 conversations
- **Monthly cost:** $15-30
- **Focus:** Validate approach, gather feedback

### Phase 2: Pilot Deployment (Month 3-6)
- **Infrastructure:** Pro tiers, web-only
- **Services:** Same as Phase 1, upgrade to paid plans
- **Expected volume:** 200-500 conversations/month
- **Monthly cost:** $150-350
- **Focus:** Refine UX, train users, validate translations

### Phase 3: Production Launch (Month 6-12)
- **Infrastructure:** Phone + web, optimized pricing
- **Services:** Add Twilio, negotiate EVI 3 pricing
- **Expected volume:** 1,000-5,000 conversations/month
- **Monthly cost:** $800-2,000
- **Focus:** Scale operations, gather data for improvements

### Phase 4: Full Scale (Month 12+)
- **Infrastructure:** Multi-channel, enterprise support
- **Services:** Enterprise agreements, advanced features
- **Expected volume:** 5,000-50,000+ conversations/month
- **Monthly cost:** $3,000-15,000+
- **Focus:** Optimize costs, expand capabilities, integrate analytics

---

## Questions for Potential Clients

### Before providing estimates:
1. **Expected monthly volume?** (Conversations per month)
2. **Geographic distribution?** (Affects Twilio rates)
3. **Language mix?** (Translation costs)
4. **Access method preference?** (Web vs phone split)
5. **Average conversation length?** (Affects all per-minute charges)
6. **Compliance requirements?** (HIPAA, SOC 2, etc.)
7. **Data retention needs?** (Affects storage costs)
8. **Integration requirements?** (Existing HR systems, etc.)
9. **Reporting/analytics needs?** (May require additional tools)
10. **Expected growth trajectory?** (For volume discount negotiations)

---

## Sample Quote Template

```
COST ESTIMATE: Voice-Based Grievance System
Client: [Name]
Date: [Date]
Prepared by: [Your Name]

ASSUMPTIONS:
- Monthly volume: [X] conversations
- Average conversation length: [Y] minutes
- Language split: [%] English, [%] Portuguese, [%] Other
- Access methods: [%] Web, [%] Phone
- Deployment phase: [Pilot/Production/Enterprise]

MONTHLY COSTS:
Voice Interface (Hume EVI):          $[X]
Field Extraction (Claude):           $[X]
Translation (OpenAI):                $[X]
Phone Integration (Twilio):          $[X]
Database (Supabase):                 $[X]
Hosting (Vercel):                    $[X]
                                     ----
TOTAL MONTHLY:                       $[X]
Per conversation:                    $[X]

ANNUAL PROJECTION:                   $[X]

ONE-TIME SETUP:
Phone number setup:                  $[X]
Custom configuration:                $[X]
Training/documentation:              $[X]

OPTIONAL ADD-ONS:
Video integration:                   +$[X]/month
Advanced analytics:                  +$[X]/month
Multi-language expansion:            +$[X]/month
Dedicated support:                   +$[X]/month
```

---

## Conclusion

The Voice AI Labor Grievance System demonstrates strong cost-effectiveness, with per-conversation costs ranging from $0.26 (enterprise scale) to $0.65 (small deployment).

**Key Findings:**
1. **Hume EVI** is the most cost-effective all-in-one voice solution
2. **Phone integration** adds ~$0.17 per call but may be essential for accessibility
3. **Economies of scale** are significant (52% cost reduction from small to enterprise)
4. **Claude Sonnet 4** provides excellent value for field extraction
5. **Translation costs** are negligible (<2% of total)

**Next Steps:**
1. Identify target deployment phase
2. Estimate realistic monthly volume
3. Determine phone integration necessity
4. Request volume discounts from vendors
5. Create client-specific quote

For questions or custom scenarios, please reach out with specific requirements.

---

**Document Version:** 1.0
**Last Updated:** November 17, 2025
**Contact:** [Your contact information]
