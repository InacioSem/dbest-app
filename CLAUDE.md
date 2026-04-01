# dbest.app — AI Music Video Generator

## What This Project Is
**dbest.app** is a full-stack web app that turns a song file + artist photos into a complete music video production package. Users upload a song (MP3/WAV), 3-5 artist photos, and optionally set 20 creative parameters. The app analyzes the song, generates a storyboard, produces video clips with character-consistent lip-sync, and assembles the final video.

The app supports four languages from day one: Haitian Creole (Kreyòl Ayisyen), French, English, and Spanish. The interface, notifications, error messages, and generated subtitles all respect the user's selected language.

Target audience: independent artists and small labels across the Caribbean, the Americas, and the diaspora — Kompa, Raboday, Zouk, Twoubadou, Reggaeton, Afrobeats, and more.

## Tech Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express
- **i18n:** next-intl (frontend) + custom middleware (backend) — see Internationalization section
- **Queue:** BullMQ (Redis-backed) for async video generation jobs
- **Database:** PostgreSQL (users, projects, artist profiles, job status)
- **Storage:** Cloudflare R2 or AWS S3 (song files, photos, generated clips)
- **Package manager:** npm
- **Domain:** dbest.app

## Build & Run Commands
```bash
npm run dev          # Start both frontend + backend concurrently
npm run dev:client   # Frontend only (Next.js on port 3000)
npm run dev:server   # Backend only (Express on port 3001)
npm run build        # Production build
npm test             # Run test suite
npm run lint         # ESLint + Prettier
```

## Project Structure
```
/client                    # Next.js frontend (App Router)
  /app
    /[locale]              # Dynamic locale segment (ht, fr, en, es)
      /page.tsx            # Landing / Upload page
      /processing/page.tsx # Processing status
      /storyboard/page.tsx # Storyboard review + edit
      /gallery/page.tsx    # Results gallery + download
    /layout.tsx            # Root layout with locale provider
  /components             # Reusable UI (Button, Card, UploadZone, StoryboardTimeline, ClipGallery, LanguageSwitcher)
  /hooks                  # useProject, useJobStatus, useCreativeParams, useLocale
  /lib                    # API client, utils
  /messages               # i18n translation files
    /ht.json              # Kreyòl Ayisyen
    /fr.json              # French
    /en.json              # English
    /es.json              # Spanish
/server                   # Express backend
  /routes                 # API endpoints
  /services               # Core business logic
    /audio                # FFmpeg compression, Whisper transcription, BPM detection, Demucs separation
    /intelligence         # Claude API: lyric analysis (multilingual), storyboard generation
    /video                # EvoLink/Seedance/Kling/Veo API calls, OmniHuman/Aurora lip-sync
    /composition          # Remotion or FFmpeg timeline assembly
  /middleware             # Auth, file upload (Multer), rate limiting, locale detection
  /jobs                   # BullMQ job processors
  /i18n                   # Backend translation strings (error messages, notifications)
/shared                   # Types, constants, creative parameter definitions
/docs                     # CHANGELOG.md, architecture decisions
```

## Internationalization (i18n)

### Four Supported Languages
| Code | Language | Audience |
|------|----------|----------|
| `ht` | Kreyòl Ayisyen | Haiti, Haitian diaspora (US, Canada, France) |
| `fr` | Français | Haiti (bilingual), Francophone Caribbean, West Africa |
| `en` | English | US, UK, global default |
| `es` | Español | Dominican Republic, Puerto Rico, Latin America |

### Implementation Rules
- Use `next-intl` with the App Router's `[locale]` dynamic segment pattern.
- Default locale: `en`. Auto-detect from browser `Accept-Language` header.
- The `LanguageSwitcher` component must appear on every page (header/nav).
- All user-facing strings go in `/client/messages/{locale}.json` — NEVER hardcode text in components.
- Backend error messages and job status notifications are also translated via `/server/i18n/{locale}.json`.
- Song lyric analysis adapts to the detected language. Claude prompt specifies: "These lyrics are in [detected_language]. Analyze accordingly."
- Generated subtitle tracks default to the song's language + English translation side by side.

### Whisper Language Codes
| Language | Whisper `language` param |
|----------|------------------------|
| Kreyòl | `ht` |
| French | `fr` |
| English | `en` |
| Spanish | `es` |

Auto-detect when possible, but let users override via the upload form's language selector.

### Cultural Context in Lyric Analysis
Claude's lyric intelligence prompt adapts per language:
- **Kreyòl:** Recognize Vodou, Rara, carnival, diaspora, Haitian history references
- **French:** Recognize Antillean, West African, and metropolitan French cultural contexts
- **English:** Standard analysis with Caribbean English dialect awareness
- **Spanish:** Recognize Reggaeton, Bachata, Salsa, Latin American cultural references

## Architecture — The Pipeline
The app runs a 6-step pipeline for each video project:

1. **Audio Processing** — FFmpeg compresses WAV→MP3 (Whisper 25MB limit), Whisper transcribes with detected/selected language code, Demucs separates vocals/instrumentals, librosa detects BPM + beat markers
2. **Lyric Intelligence** — Claude API analyzes lyrics in the song's language: translates to English (if not already English), extracts themes/imagery/cultural references, generates scene descriptions per section, maps emotional arc, suggests color palette
3. **Storyboard Generation** — Claude API produces 15-25 shot descriptions using lyric intelligence + user's creative parameters + song structure timing
4. **Asset Generation (parallel)** — Lip-sync via OmniHuman/Aurora (FAL.AI), B-roll via Seedance/Kling/Veo (EvoLink), Environments via Nano Banana Pro, Enhancement via Vmake
5. **Composition** — Remotion or FFmpeg assembles timeline, syncs cuts to beats, applies color grading, adds optional bilingual subtitles (song language + English)
6. **Platform Adaptation** — Exports 16:9 (YouTube), 9:16 (TikTok/Reels), 1:1 (Instagram/Spotify Canvas), plus 3-5 highlight clips

## Critical Implementation Rules

### Language Handling
- Kreyòl is NOT French. Never fall back to French models or translations for Kreyòl content.
- Always auto-detect song language, but let users override manually.
- The UI language and the song language are independent. A French-speaking user may upload a Kreyòl song.
- All four languages must be complete before any public launch — no partial translations.

### Character Consistency (Seedance @-reference system)
- Every video generation prompt MUST use `@image1`, `@image2` etc. referencing uploaded artist photos.
- NEVER drop the @-reference tag — without it, the model generates a random face.
- Always reference outfit: `@image1 wearing the same outfit from @image2`.
- Use the "Frame Loop" technique: generate one clip → extract best frame → use that frame as reference for next clip.

### File Size Handling
- Always compress audio before Whisper: `ffmpeg -i input.wav -ac 1 -ar 16000 -b:a 48k output.mp3`
- This reduces ~38MB WAV to ~5-7MB with zero transcription quality loss.

### Demo Mode
- The app has a `USE_DEMO_MODE` env var toggle.
- When true, all API calls return realistic mock data (sample storyboard JSON, placeholder video URLs).
- This lets the full UI/UX flow be tested without paid API keys.
- Demo mode storyboard should include sample data in all four languages.

### API Keys (all stored in .env, NEVER exposed to frontend)
- `EVOLINK_API_KEY` + `EVOLINK_BASE_URL` — Video generation gateway (Seedance, Kling, Veo)
- `OPENAI_API_KEY` — Whisper transcription
- `ANTHROPIC_API_KEY` — Claude lyric analysis + storyboard
- `FAL_API_KEY` — OmniHuman/Aurora lip-sync
- `GEMINI_API_KEY` — Nano Banana Pro image generation
- `HEYGEN_API_KEY` — Backup lip-sync

### Video Generation Pattern (async)
All video APIs use submit → poll → fetch:
```javascript
// 1. Submit job, get task_id
const job = await submitGeneration(params);
// 2. Poll every 15 seconds until status === 'succeeded' or 'failed'
const result = await pollForResult(job.id);
// 3. Download result video from URL
await downloadClip(result.video_url, outputPath);
```

## The 20 Creative Parameters
All optional. Stored in `shared/creativeParams.ts`. Grouped into 5 categories:
1. **Cinematography** (1-5): Camera Movement, Shot Types, Camera Angle, Lens Style, Focus Technique
2. **Visual Style** (6-10): Color Palette, Lighting Style, Visual Texture, Art Style, Visual Effects
3. **Narrative** (11-14): Setting/Location, Mood/Atmosphere, Time of Day, Weather
4. **Character** (15-17): Character Presence, Wardrobe Style, Performance Energy
5. **Editing** (18-20): Cut Pace, Transition Style, Lip-sync Amount

Parameter labels and option names must be translated in all four languages. When empty, defaults are derived from song analysis (Claude infers from lyrics + BPM + genre).

## UI Design Direction
Dark, modern, "studio-like" interface. Deep purple-to-dark-blue gradient backgrounds, glassmorphism cards, smooth micro-interactions. The brand name "dbest" should feel confident and clean — think high-end recording studio meets Caribbean warmth. Use distinctive typography, not Inter/Roboto/Arial. Must feel professional and creative — NOT generic AI aesthetic.

The LanguageSwitcher should be prominent but elegant — a flag or locale code in the top nav that opens a dropdown. Users should be able to switch language at any time without losing their project state.

## Code Style
- TypeScript everywhere (strict mode)
- Functional components with hooks, no class components
- Use `async/await`, never raw `.then()` chains
- Error handling: try-catch with user-friendly messages for API failures (translated)
- Logging: Winston on backend
- All API routes return consistent `{ success, data, error }` shape
- All user-facing strings accessed via `useTranslations()` hook — zero hardcoded text

## Revenue Model

### Phase 1: Per-Video Pricing (Launch)
- Pay-per-video with tiered quality levels (720p, 1080p, 4K)
- No subscription required — zero commitment friction for indie artists
- Estimated cost to user: $15–$49 per video depending on tier
- API costs per video: ~$25–$55 (margin improves with volume)

### Phase 2: Premium Done-For-You Tier
- Human-reviewed storyboard + manual quality checks
- Custom style refinement and re-generation
- Priority queue + faster turnaround
- Price: $200–$500 per video

### Phase 3: Platform Marketplace
- Creators sell Style Presets, transition packs, and storyboard templates
- dbest.app takes a percentage cut on each sale
- Top creators become "Verified Producers" with profile pages
- Revenue flywheel: creators attract more creators

### Architecture Implications
- Users table needs a `credits` or `balance` field from day one (not subscription flags)
- Every pipeline run must track cost breakdown (which APIs were called, how much each cost)
- Project model needs a `pricing_tier` field that affects which APIs/resolutions are used
- Build a `CostTracker` service that logs per-project API spend for margin analysis

## Scaling Architecture (Build for These from Day One)

### Priority 1: Distribution Channels (Pluggable Export System)
Do NOT hardcode export as "download MP4." Build a `DistributionChannel` interface:

```typescript
// server/services/distribution/types.ts
interface DistributionChannel {
  id: string;                          // 'youtube' | 'tiktok' | 'spotify_canvas' | 'instagram' | 'download'
  name: string;
  specs: {
    aspectRatio: string;               // '16:9' | '9:16' | '1:1'
    maxDuration: number;               // seconds
    maxFileSize: number;               // bytes
    resolution: string;                // '1080p' | '4K'
    format: string;                    // 'mp4' | 'mov' | 'webm'
    metadataFields: string[];          // ['title', 'description', 'tags', 'thumbnail']
  };
  export(project: Project): Promise<ExportResult>;        // Render to spec
  publish(exportResult: ExportResult, auth: AuthToken): Promise<PublishResult>;  // Upload to platform
}
```

Start with `DownloadChannel` only. YouTube, TikTok, Spotify Canvas, Instagram become new adapter classes later — same interface, no pipeline changes. The Platform Adaptation step (Step 6) already renders per-spec; distribution just adds the upload/publish layer.

**Folder structure:**
```
/server/services/distribution/
  types.ts                 # DistributionChannel interface
  download.channel.ts      # Default: local download
  youtube.channel.ts       # Future: YouTube Data API v3
  tiktok.channel.ts        # Future: TikTok Content Posting API
  spotify.channel.ts       # Future: Spotify Canvas upload
  instagram.channel.ts     # Future: Instagram Graph API
  registry.ts              # Channel registry — returns available channels per user
```

### Priority 2: Multiple Content Types (ProjectType System)
The pipeline currently assumes "music video" as the only output. Build it as one of several `ProjectType`s that share the same audio analysis engine but branch at asset generation:

```typescript
// shared/projectTypes.ts
type ProjectType =
  | 'music_video'          // Full video with lip-sync + b-roll (current MVP)
  | 'lyric_video'          // Animated text over backgrounds, synced to timestamps
  | 'visualizer'           // Audio-reactive abstract animation (no artist face needed)
  | 'album_art'            // Static or animated cover art from song mood
  | 'social_teaser'        // 15-30 second clips optimized for TikTok/Reels
  | 'spotify_canvas';      // 3-8 second looping clip for Spotify
```

**What they share:** Steps 1-2 (audio processing + lyric intelligence) are identical for ALL types. Step 3 (storyboard) adapts its output format per type. Steps 4-6 branch entirely.

**Build now:** The upload form must include a `projectType` selector. The pipeline router checks `projectType` and calls the right generator. Even if only `music_video` is implemented at launch, the routing exists so adding `lyric_video` is just a new generator, not a new pipeline.

### Priority 3: Marketplace (Style Presets as First-Class Entities)
The 20 creative parameters are currently form state. They need to become a **saveable, nameable, shareable entity** called a `StylePreset`:

```typescript
// shared/types/stylePreset.ts
interface StylePreset {
  id: string;
  name: string;                        // "Midnight Kompa" or "Neon Raboday"
  description: string;                 // Translated in all 4 languages
  creatorId: string;                   // Who made it
  parameters: CreativeParameters;      // The 20 params (partial — only set ones)
  thumbnail?: string;                  // Preview image
  tags: string[];                      // ['kompa', 'romantic', 'cinematic']
  isPublic: boolean;                   // Visible in marketplace
  price?: number;                      // null = free, number = paid
  usageCount: number;                  // How many videos made with this preset
  createdAt: Date;
}
```

**Database model from day one:** `style_presets` table with `creator_id` foreign key. Even before the marketplace launches, users can save and reuse their own presets. The marketplace just flips `isPublic` to true and adds pricing.

**Build now:** After generating a video, offer "Save these settings as a Style Preset." This costs nothing to build and immediately adds value.

### Priority 4: AI Music Production (Future Module)
Not needed in the codebase now, but the architecture should accommodate it:
- The `/server/services/` pattern means adding `/server/services/music-production/` later is clean
- The project model's `ProjectType` enum can expand to include `beat`, `remix`, `master`
- Audio processing services (FFmpeg, BPM detection) are already shared infrastructure

### Priority 5: B2B / Label Tools (Future Module)
Architecture prep:
- Users already have a `projects` relationship — adding `organizations` with `members` is a standard multi-tenancy pattern
- Artist profiles are already a separate entity — labels just get a dashboard that manages multiple artist profiles
- "Visual Identity Kit" = a StylePreset locked to an artist, auto-applied to all their projects

### Priority 6: Live / Real-Time (Lowest Priority)
No architecture changes needed now. This would be a fundamentally different product (WebSocket-based, real-time rendering) that shares the audio analysis engine but little else. Don't design for it.

## Database Schema (Core Tables)

Build these from day one to support scaling:

```
users
  id, email, name, locale (ht|fr|en|es), credits_balance, created_at

artist_profiles
  id, user_id, name, photos_urls[], description, genre_tags[]

projects
  id, user_id, artist_profile_id, project_type (enum), pricing_tier,
  song_url, song_language, status (enum), cost_breakdown (jsonb),
  creative_params (jsonb), style_preset_id (nullable), created_at

storyboards
  id, project_id, shots (jsonb[]), lyric_analysis (jsonb), approved_at

generated_clips
  id, project_id, storyboard_shot_index, clip_url, platform,
  generation_model, generation_cost, status, created_at

exports
  id, project_id, channel (enum), spec (jsonb), file_url,
  published_url (nullable), published_at (nullable)

style_presets
  id, creator_id, name, description (jsonb — multilingual),
  parameters (jsonb), thumbnail_url, tags[], is_public, price,
  usage_count, created_at

cost_logs
  id, project_id, api_name, endpoint, tokens_or_seconds,
  cost_usd, created_at
```

## Current Focus
See @docs/CHANGELOG.md for session progress tracking.
