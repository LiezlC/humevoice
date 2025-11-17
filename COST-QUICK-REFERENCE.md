# Cost Analysis Quick Reference

**Last Updated:** November 17, 2025

## Per-Conversation Costs by Scenario

| Scenario | Volume/Month | Monthly Cost | Per Conversation | Phone Integration |
|----------|--------------|--------------|------------------|-------------------|
| **Pilot** | 50 | $27.63 | $0.55 | No |
| **Small** | 500 | $321.25 | $0.64 | No |
| **Medium** | 2,000 | $1,297.00 | $0.65 | 40% phone |
| **Large** | 10,000 | $3,174.00 | $0.32 | 60% phone |
| **Enterprise** | 50,000 | $12,820.00 | $0.26 | 70% phone |

## Service Costs per Conversation (7.5 min average)

| Service | Cost | Notes |
|---------|------|-------|
| **Hume EVI 2** | $0.54 | Current voice interface |
| **Hume EVI 3** | $0.15 | Future pricing (high volume) |
| **Claude Extraction** | $0.0105 | With prompt caching: $0.0015 |
| **OpenAI Translation** | $0.004 | Portuguese conversations only |
| **Twilio Phone** | $0.165 | Toll-free inbound (US rates) |
| **Whisper STT** | $0.045 | Alternative to Hume (STT only) |
| **ElevenLabs TTS** | $0.75 | Alternative to Hume (TTS only) |
| **HeyGen Training Video** | $0.50-0.99/min | Pre-recorded avatar videos |
| **HeyGen Interactive Avatar** | $0.10-0.198/min | Real-time streaming Q&A |

## Monthly Service Subscriptions

| Service | Free Tier | Pro Tier | Team/Enterprise |
|---------|-----------|----------|-----------------|
| **Supabase** | $0 (500 MB DB, 2 projects, pauses after 7 days) | $25 (8 GB DB, 100 GB storage) | $599+ |
| **Vercel** | $0 (Hobby: 150K invocations) | $20 + usage | $200+ custom |
| **Anthropic** | $5 credit (one-time) | Pay-as-you-go | Enterprise pricing |
| **OpenAI** | $0 | Pay-as-you-go | Custom pricing |
| **Hume** | Free credits (limited) | Pay-as-you-go | Volume discounts |
| **Twilio** | $0 | Pay-as-you-go + phone rental | Custom pricing |
| **HeyGen** | $0 (3 videos/month) | $24-29 (Creator) or $99-330 (API) | Custom pricing |

## Cost Breakdown by Component

### Current Stack (Web-Only)
```
For 500 conversations/month:
├─ Hume EVI (84%):           $270.00
├─ Supabase (8%):            $25.00
├─ Vercel (6%):              $20.00
├─ Claude (2%):              $5.25
└─ OpenAI (<1%):             $1.00
TOTAL:                       $321.25
```

### With Phone Integration
```
For 2,000 conversations/month (40% phone):
├─ Hume EVI (83%):           $1,080.00
├─ Twilio (10%):             $132.00
├─ Supabase (2%):            $30.00
├─ Vercel (2%):              $30.00
├─ Claude (2%):              $21.00
└─ OpenAI (<1%):             $4.00
TOTAL:                       $1,297.00
```

## Quick Estimates

### For Client Quotes

**Basic Formula:**
```
Monthly Cost = (Volume × $0.55) + Base Infrastructure

Where Base Infrastructure:
- Pilot/Testing: $0 (free tiers)
- Small Deployment: $45/month (Supabase Pro + Vercel Pro)
- Production: $50-100/month (with overages)
- Enterprise: $800-2,000/month (Team plans + support)
```

**With Phone:**
```
Add: Volume × Phone % × $0.165
```

**Example:** 1,000 conversations/month, 30% via phone
```
Base: 1,000 × $0.55 = $550
Phone: 1,000 × 0.30 × $0.165 = $49.50
Infrastructure: $50
TOTAL: ~$650/month
```

## Key Questions for Estimates

1. **How many conversations per month?** ___________
2. **What % will be via phone?** ___________
3. **What % are in Portuguese?** ___________
4. **Average conversation length?** ___________ (default: 7.5 min)
5. **Do you need HIPAA/SOC2 compliance?** ___________

## Cost Optimization Checklist

- [ ] Enable Claude prompt caching (90% savings on extraction)
- [ ] Use OpenAI batch API for translations (50% savings)
- [ ] Negotiate Hume volume discount at 1,000+ calls/month
- [ ] Upgrade to Hume EVI 3 when available (70% savings)
- [ ] Implement conversation length limits (reduce avg time)
- [ ] Use Supabase free tier during pilot phase
- [ ] Use Vercel hobby tier for initial testing
- [ ] Cache common translations to avoid duplicate API calls
- [ ] Monitor and optimize serverless function usage
- [ ] Archive old grievances to cheaper storage

## Red Flags (Cost Warnings)

| Warning Sign | Impact | Action |
|--------------|--------|--------|
| Avg conversation >15 min | 2x costs | Add conversation time limits |
| >50% Portuguese users | Higher translation costs | Consider bilingual agents |
| >80% phone usage | Higher telecom costs | Optimize call routing |
| Rapid unplanned growth | Budget overruns | Set up usage alerts |
| Complex integrations | Development costs | Budget for engineering time |
| International calls | 3-5x costs | Use local phone numbers |

## ROI Considerations

### Cost per Grievance vs Traditional Methods

| Method | Cost per Report | Notes |
|--------|-----------------|-------|
| **Paper forms** | $5-15 | Printing, distribution, data entry |
| **Email/web form** | $2-5 | Manual review, translation, categorization |
| **Voice AI (this system)** | $0.26-0.65 | Automated, multilingual, structured data |

**Savings:** 80-95% cost reduction vs traditional methods at scale

### Additional ROI Benefits
- **Time savings:** 10-15 min saved per grievance on manual data entry
- **Accessibility:** Reach workers who cannot write/type
- **Data quality:** Structured extraction vs manual notes
- **Response time:** Real-time alerts for critical issues
- **Compliance:** Automatic audit trail and documentation

## Optional Add-On: HeyGen Training Videos

### Use Case
Create AI avatar training videos to educate workers about:
- Workplace rights and procedures
- How to use the grievance system
- Safety protocols and emergency procedures
- Multilingual onboarding content

### Pricing Options

| Plan | Monthly Cost | Best For | Cost per Video Minute |
|------|--------------|----------|----------------------|
| **Creator Plan** | $24-29 | Small libraries (<15 videos) | Unlimited (subscription) |
| **API Pro** | $99 | Medium volume (10-50 videos) | $0.99/minute |
| **API Scale** | $330 | High volume (50+ videos) | $0.50/minute |

### Sample Training Library Cost
**12 training videos (5 min each) in 2 languages = 120 minutes total**

- **Creator Plan:** $29/month (ongoing subscription)
- **API Pro:** $118.80 one-time
- **API Scale:** $60 one-time

### Interactive Training Avatar
**For real-time Q&A support:**
- API Pro: $0.198/minute streaming
- API Scale: $0.10/minute streaming
- Use case: Workers ask questions, avatar provides video answers

### ROI vs Traditional Training
- **Traditional:** $50-100 per worker for in-person training
- **HeyGen:** $29-60 one-time for unlimited worker access
- **Breakeven:** After training just 1-2 workers

### Quick Add-On Pricing for Quotes

**Add to any scenario:**
- **Basic Training:** +$29/month (Creator Plan)
- **Advanced Training:** +$99/month (API Pro with custom generation)
- **Interactive Support:** +$330/month (API Scale with real-time avatar Q&A)

---

## Contact for Custom Analysis

For scenarios not covered here or custom pricing:
- Volume >50,000 conversations/month
- Multi-region deployment (Africa, Asia, etc.)
- Custom integrations (SAP, Workday, etc.)
- Video agent capabilities
- Advanced analytics requirements
- White-label solutions

---

**See full analysis:** [COST-ANALYSIS.md](./COST-ANALYSIS.md)
