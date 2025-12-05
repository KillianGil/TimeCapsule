export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Capsule {
  id: string
  sender_id: string
  receiver_id: string
  title: string | null
  video_path: string
  music_title: string | null
  music_artist: string | null
  music_preview_url: string | null
  music_cover_url: string | null
  note: string | null
  location_data: {
    lat: number
    lng: number
    address?: string
  } | null
  unlock_date: string
  is_viewed: boolean
  viewed_at: string | null
  created_at: string
  // Joined data
  sender?: Profile
  receiver?: Profile
}

export interface Friendship {
  id: string
  requester_id: string
  receiver_id: string
  status: "pending" | "accepted" | "blocked"
  created_at: string
  updated_at: string
  // Joined data
  requester?: Profile
  receiver?: Profile
}

export type CapsuleFilter = "all" | "received" | "sent" | "locked" | "unlocked"
