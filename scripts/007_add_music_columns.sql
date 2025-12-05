-- Migration: Add music columns to capsules table
-- Run this in Supabase SQL Editor

ALTER TABLE capsules ADD COLUMN IF NOT EXISTS music_preview_url TEXT;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS music_artist TEXT;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS music_cover_url TEXT;

-- Note: music_title already exists in the table
