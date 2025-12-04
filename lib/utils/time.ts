export function formatTimeRemaining(unlockDate: string): string {
  const now = new Date()
  const unlock = new Date(unlockDate)
  const diff = unlock.getTime() - now.getTime()

  if (diff <= 0) return "Disponible"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (days > 365) {
    const years = Math.floor(days / 365)
    return `${years} an${years > 1 ? "s" : ""}`
  }
  if (days > 30) {
    const months = Math.floor(days / 30)
    return `${months} mois`
  }
  if (days > 0) {
    return `${days}j ${hours}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

export function isUnlocked(unlockDate: string): boolean {
  return new Date(unlockDate) <= new Date()
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
