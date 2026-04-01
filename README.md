# 🎬 dbest.app

**AI Music Video Generator** — Turn a song and artist photos into a professional music video.

Supports **Haitian Creole (Kreyòl)**, **French**, **English**, and **Spanish** from day one.

## Quick Start

```bash
# 1. Clone and install
git clone <your-repo-url>
cd dbest-app
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — at minimum set USE_DEMO_MODE=true

# 3. Run in demo mode (no API keys needed)
npm run dev

# 4. Test the API
curl -X POST http://localhost:3001/api/projects \
  -F "song=@your-song.mp3" \
  -F "photos=@artist-photo.jpg" \
  -F "artistName=My Artist" \
  -F "songLanguage=ht"
```

## How It Works

1. **Upload** a song + 3-5 artist photos
2. **AI analyzes** lyrics, tempo, mood, and cultural context
3. **Storyboard** is generated with 15-25 cinematic shots
4. **Video clips** are generated with character-consistent lip-sync
5. **Final video** is assembled and exported for all platforms

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + Tailwind + Framer Motion |
| Backend | Express + TypeScript |
| AI | Claude (lyrics), Whisper (transcription), Seedance/Kling (video), OmniHuman (lip-sync) |
| Queue | BullMQ + Redis |
| Database | PostgreSQL |
| Storage | Cloudflare R2 / AWS S3 |

## Project Structure

```
CLAUDE.md              ← Claude Code reads this automatically
client/                ← Next.js frontend (4 languages)
server/                ← Express backend
  services/audio/      ← FFmpeg + Whisper + BPM detection
  services/intelligence/ ← Claude lyric analysis + storyboard
  services/video/      ← Video generation (Seedance, OmniHuman)
  services/distribution/ ← Export channels (download, YouTube, TikTok)
shared/types/          ← TypeScript types shared between client + server
docs/CHANGELOG.md      ← Session progress tracking
```

## License

Proprietary — © 2026 dbest.app
