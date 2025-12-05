// iTunes Search API service for music search
// Returns 30-second previews from Apple Music/iTunes

export interface MusicTrack {
    id: number
    title: string
    artist: string
    cover: string
    previewUrl: string
}

export async function searchMusic(query: string): Promise<MusicTrack[]> {
    if (!query || query.trim().length < 2) {
        return []
    }

    try {
        const encodedQuery = encodeURIComponent(query.trim())
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodedQuery}&media=music&entity=song&limit=5`
        )

        if (!response.ok) {
            throw new Error('iTunes API error')
        }

        const data = await response.json()

        return data.results.map((track: any) => ({
            id: track.trackId,
            title: track.trackName,
            artist: track.artistName,
            cover: track.artworkUrl100?.replace('100x100', '300x300') || track.artworkUrl60,
            previewUrl: track.previewUrl,
        }))
    } catch (error) {
        console.error('Music search error:', error)
        return []
    }
}
