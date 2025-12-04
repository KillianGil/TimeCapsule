-- Create capsules table for time-locked messages
CREATE TABLE IF NOT EXISTS public.capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  video_path TEXT NOT NULL,
  music_title TEXT,
  note TEXT,
  location_data JSONB, -- { lat: number, lng: number, address?: string }
  unlock_date TIMESTAMPTZ NOT NULL,
  is_viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for capsules
-- Sender can see their sent capsules metadata (but not video before unlock)
CREATE POLICY "capsules_select_sender" ON public.capsules
  FOR SELECT USING (auth.uid() = sender_id);

-- Receiver can see capsules sent to them (video access controlled by unlock_date in app)
CREATE POLICY "capsules_select_receiver" ON public.capsules
  FOR SELECT USING (auth.uid() = receiver_id);

CREATE POLICY "capsules_insert_own" ON public.capsules
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "capsules_update_receiver" ON public.capsules
  FOR UPDATE USING (auth.uid() = receiver_id); -- Receiver updates is_viewed

CREATE POLICY "capsules_delete_sender" ON public.capsules
  FOR DELETE USING (auth.uid() = sender_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_capsules_sender ON public.capsules(sender_id);
CREATE INDEX IF NOT EXISTS idx_capsules_receiver ON public.capsules(receiver_id);
CREATE INDEX IF NOT EXISTS idx_capsules_unlock_date ON public.capsules(unlock_date);
CREATE INDEX IF NOT EXISTS idx_capsules_is_viewed ON public.capsules(is_viewed);
