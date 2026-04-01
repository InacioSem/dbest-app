-- dbest.app Core Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ───
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('ht', 'fr', 'en', 'es')),
  credits_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Artist Profiles ───
CREATE TABLE artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photos_urls TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  genre_tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artist_profiles_user ON artist_profiles(user_id);

-- ─── Style Presets ───
CREATE TABLE style_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description JSONB NOT NULL DEFAULT '{}',
  parameters JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC(10, 2),
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_style_presets_creator ON style_presets(creator_id);
CREATE INDEX idx_style_presets_public ON style_presets(is_public) WHERE is_public = true;

-- ─── Projects ───
CREATE TYPE project_type AS ENUM (
  'music_video', 'lyric_video', 'visualizer',
  'album_art', 'social_teaser', 'spotify_canvas'
);

CREATE TYPE pricing_tier AS ENUM ('standard', 'hd', 'premium');

CREATE TYPE project_status AS ENUM (
  'draft', 'uploading', 'processing_audio', 'analyzing_lyrics',
  'generating_storyboard', 'awaiting_approval', 'generating_clips',
  'composing', 'exporting', 'completed', 'failed'
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE SET NULL,
  project_type project_type NOT NULL DEFAULT 'music_video',
  pricing_tier pricing_tier NOT NULL DEFAULT 'standard',
  song_url TEXT,
  song_language TEXT NOT NULL DEFAULT 'en' CHECK (song_language IN ('ht', 'fr', 'en', 'es')),
  status project_status NOT NULL DEFAULT 'draft',
  cost_breakdown JSONB NOT NULL DEFAULT '{"total": 0, "items": []}',
  creative_params JSONB NOT NULL DEFAULT '{}',
  style_preset_id UUID REFERENCES style_presets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ─── Storyboards ───
CREATE TABLE storyboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  shots JSONB[] NOT NULL DEFAULT '{}',
  lyric_analysis JSONB NOT NULL DEFAULT '{}',
  approved_at TIMESTAMPTZ
);

CREATE INDEX idx_storyboards_project ON storyboards(project_id);

-- ─── Generated Clips ───
CREATE TYPE clip_status AS ENUM ('pending', 'generating', 'completed', 'failed');

CREATE TABLE generated_clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storyboard_shot_index INTEGER NOT NULL,
  clip_url TEXT,
  platform TEXT,
  generation_model TEXT,
  generation_cost NUMERIC(10, 4),
  status clip_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clips_project ON generated_clips(project_id);

-- ─── Exports ───
CREATE TYPE distribution_channel AS ENUM (
  'download', 'youtube', 'tiktok', 'spotify_canvas', 'instagram'
);

CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  channel distribution_channel NOT NULL DEFAULT 'download',
  spec JSONB NOT NULL DEFAULT '{}',
  file_url TEXT,
  published_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exports_project ON exports(project_id);

-- ─── Cost Logs ───
CREATE TABLE cost_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  tokens_or_seconds NUMERIC NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_logs_project ON cost_logs(project_id);
