# Integration Guide: Dashboard + Field Extractor

## Overview
This guide adds:
1. **Field Extractor**: Claude-powered script to populate database fields
2. **Dashboard**: Real-time grievance viewing interface

---

## PART 1: Field Extractor Setup

### Step 1: Install Dependencies

```bash
cd humevoice
pnpm add @anthropic-ai/sdk @supabase/supabase-js
```

### Step 2: Add Extract Script

1. Copy `extract-grievance-fields.js` to `humevoice/scripts/`
2. Make it executable:
```bash
mkdir -p scripts
mv extract-grievance-fields.js scripts/
chmod +x scripts/extract-grievance-fields.js
```

### Step 3: Add Environment Variables

In `.env.local`:
```bash
# Existing Hume vars
HUME_API_KEY=your_hume_key
HUME_SECRET_KEY=your_hume_secret

# Add these:
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Get keys from:**
- Anthropic: https://console.anthropic.com/settings/keys
- Supabase: Your project settings → API

### Step 4: Add package.json Script

In `package.json`, add to `"scripts"`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "extract-fields": "node scripts/extract-grievance-fields.js"
  }
}
```

### Step 5: Run Field Extractor

```bash
pnpm extract-fields
```

**Output will show:**
```
✓ Found 2 grievance(s)
Processing grievance 44d7b78b...
✓ Extracted fields
✓ Database updated successfully
...
Summary:
  Total grievances: 2
  Processed: 2
  Skipped: 0
  Failed: 0
```

---

## PART 2: Dashboard Integration

### Step 1: Create Dashboard Route

```bash
cd humevoice
mkdir -p app/dashboard
```

Copy `dashboard-page.tsx` to `app/dashboard/page.tsx`

### Step 2: Update Navigation Component

Edit `components/Nav.tsx`:

```typescript
import { Briefcase, BarChart3 } from "lucide-react";
import Link from "next/link";
import { ComponentThemeToggle } from "./ComponentThemeToggle";

export const Nav = () => {
  return (
    <div className="flex items-center h-14 gap-4 px-4 border-b">
      <div className="flex items-center gap-2 flex-1">
        <Briefcase className="size-6" />
        <div className="font-medium">Mozambique Labour Voice</div>
      </div>
      
      {/* Add Dashboard Link */}
      <Link 
        href="/dashboard"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <BarChart3 className="size-4" />
        Dashboard
      </Link>

      <ComponentThemeToggle />
    </div>
  );
};
```

### Step 3: Update Main Page (Optional - Add Dashboard Button)

Edit `app/page.tsx` to add a link to dashboard for non-voice users:

```typescript
import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BarChart3 } from "lucide-react";

const Chat = dynamic(() => import("@/components/Chat"), {
  ssr: false,
});

export default async function Page() {
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error('Unable to get access token');
  }

  return (
    <div className={"grow flex flex-col"}>
      {/* Dashboard Link for Quick Access */}
      <div className="absolute top-20 right-4 z-10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
        >
          <BarChart3 className="size-4" />
          <span className="text-sm font-medium">View Dashboard</span>
        </Link>
      </div>
      
      <Chat accessToken={accessToken} />
    </div>
  );
}
```

### Step 4: Test Dashboard Locally

```bash
pnpm dev
```

Visit: http://localhost:3000/dashboard

You should see:
- Stats cards with counts
- Category chart
- Filters
- Grievances table

### Step 5: Deploy

```bash
# Make sure environment variables are set in Vercel
git add .
git commit -m "Add dashboard and field extractor"
git push
```

**Then add environment variables in Vercel:**
- Dashboard: https://vercel.com/your-project/settings/environment-variables
- Add all the env vars from Step 3

---

## PART 3: Usage Workflow

### For New Grievances:

**Option A: Automatic (Recommended)**
Add this to your Chat component to auto-extract after call ends:

```typescript
// In components/Chat.tsx or similar
const handleCallEnd = async (conversationId: string) => {
  // Existing code...
  
  // Trigger field extraction
  try {
    await fetch('/api/extract-fields', {
      method: 'POST',
      body: JSON.stringify({ conversationId })
    });
  } catch (error) {
    console.error('Field extraction failed:', error);
  }
};
```

Then create `app/api/extract-fields/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    // Run extraction script
    await execAsync('pnpm extract-fields');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Extraction failed' },
      { status: 500 }
    );
  }
}
```

**Option B: Manual**
Run after each demo:
```bash
pnpm extract-fields
```

### For Demo Presentation:

1. **Show Voice Interface** (https://your-app.vercel.app)
   - Start ChatGPT test caller
   - Conduct conversation in Portuguese
   - Complete the call

2. **Run Extractor** (if not automatic)
   ```bash
   pnpm extract-fields
   ```

3. **Show Dashboard** (https://your-app.vercel.app/dashboard)
   - Click "Dashboard" in nav
   - Show stats updating
   - Show category breakdown
   - Demonstrate filters
   - Show structured data in table

4. **Explain Value**:
   > "Notice how the voice conversation is automatically:
   > - Transcribed in original language
   > - Translated to English
   > - Fields extracted and structured
   > - Made searchable and filterable
   > - Ready for management review
   >
   > This turns unstructured voice data into actionable insights."

---

## PART 4: Customization

### Add More Categories

Edit both files:

1. `scripts/extract-grievance-fields.js`:
```javascript
"category": "One of: wages, overtime, safety, discrimination, harassment, working_conditions, contracts, benefits, other"
```

2. `app/dashboard/page.tsx`:
```typescript
<option value="contracts">Contracts</option>
<option value="benefits">Benefits</option>
```

### Change Color Scheme

In `app/dashboard/page.tsx`, update colors:
```typescript
// Stats cards
border-red-500  // High urgency
border-yellow-500  // Medium
border-green-500  // Low

// Category chart
bg-purple-600  // Change to your brand color
```

### Add Export Functionality

Add to dashboard:
```typescript
const exportToCSV = () => {
  const csv = [
    ['Date', 'Name', 'Location', 'Category', 'Urgency', 'Description'],
    ...filteredGrievances.map(g => [
      formatDate(g.created_at),
      g.submitter_name || 'Anonymous',
      g.incident_location || '',
      g.category || '',
      g.urgency,
      g.description
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grievances.csv';
  a.click();
};
```

---

## PART 5: Troubleshooting

### Extractor Issues:

**"ANTHROPIC_API_KEY not set"**
→ Add to `.env.local` and restart

**"Failed to fetch grievances"**
→ Check SUPABASE_SERVICE_ROLE_KEY (not anon key!)

**"Extraction failed"**
→ Check transcript isn't empty
→ Verify Claude API quota

### Dashboard Issues:

**"Cannot find module @supabase/supabase-js"**
→ Run `pnpm add @supabase/supabase-js`

**Dashboard shows no data**
→ Check Supabase URL/keys
→ Verify table name is `labor_grievances`
→ Check browser console for errors

**Filters not working**
→ Clear browser cache
→ Check field names match database schema

---

## PART 6: Demo Checklist

Before your Mozambique demo:

- [ ] Field extractor tested on existing data
- [ ] Dashboard accessible at /dashboard route
- [ ] Navigation link visible
- [ ] Stats cards showing correct counts
- [ ] Category chart displaying
- [ ] Filters working
- [ ] Table showing all grievances
- [ ] Mobile responsive (test on phone)
- [ ] ChatGPT voice test successful
- [ ] New conversation → auto-extraction → dashboard update flow tested

---

## Quick Start Commands:

```bash
# Setup
cd humevoice
pnpm add @anthropic-ai/sdk @supabase/supabase-js

# Add environment variables to .env.local

# Extract existing grievance fields
pnpm extract-fields

# Start dev server
pnpm dev

# Visit
# Main: http://localhost:3000
# Dashboard: http://localhost:3000/dashboard

# Deploy
git add .
git commit -m "Add dashboard and field extraction"
git push
```

---

You're ready! The dashboard gives clients instant visibility into how the voice data is captured and structured.
