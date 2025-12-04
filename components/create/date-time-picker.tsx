"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, LockIcon } from "@/components/icons"

interface DateTimePickerProps {
  initialDate: Date | null
  onDateSelected: (date: Date) => void
}

const presetOptions = [
  { label: "Dans 1 semaine", days: 7 },
  { label: "Dans 1 mois", days: 30 },
  { label: "Dans 3 mois", days: 90 },
  { label: "Dans 6 mois", days: 180 },
  { label: "Dans 1 an", days: 365 },
  { label: "Dans 5 ans", days: 365 * 5 },
]

export function DateTimePicker({ initialDate, onDateSelected }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [customDate, setCustomDate] = useState("")
  const [customTime, setCustomTime] = useState("12:00")

  const minDate = new Date()
  minDate.setMinutes(minDate.getMinutes() + 1)

  const handlePresetSelect = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    date.setHours(12, 0, 0, 0)
    setSelectedDate(date)
    setCustomDate(date.toISOString().split("T")[0])
    setCustomTime("12:00")
  }

  const handleCustomDateChange = (dateStr: string) => {
    setCustomDate(dateStr)
    if (dateStr) {
      const [hours, minutes] = customTime.split(":").map(Number)
      const date = new Date(dateStr)
      date.setHours(hours, minutes, 0, 0)
      setSelectedDate(date)
    }
  }

  const handleCustomTimeChange = (timeStr: string) => {
    setCustomTime(timeStr)
    if (customDate) {
      const [hours, minutes] = timeStr.split(":").map(Number)
      const date = new Date(customDate)
      date.setHours(hours, minutes, 0, 0)
      setSelectedDate(date)
    }
  }

  const handleSubmit = () => {
    if (selectedDate && selectedDate > minDate) {
      onDateSelected(selectedDate)
    }
  }

  const formatPreviewDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <LockIcon className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Quand déverrouiller ?</h2>
        <p className="text-sm text-muted-foreground">Choisissez la date à laquelle la capsule sera disponible</p>
      </div>

      {/* Preset options */}
      <div className="space-y-2">
        <Label>Choix rapide</Label>
        <div className="grid grid-cols-2 gap-2">
          {presetOptions.map((option) => (
            <Button
              key={option.days}
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => handlePresetSelect(option.days)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom date/time */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Date et heure personnalisées
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            value={customDate}
            onChange={(e) => handleCustomDateChange(e.target.value)}
            min={minDate.toISOString().split("T")[0]}
          />
          <Input type="time" value={customTime} onChange={(e) => handleCustomTimeChange(e.target.value)} />
        </div>
      </div>

      {/* Preview */}
      {selectedDate && selectedDate > minDate && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
          <p className="text-sm text-muted-foreground mb-1">Ouverture prévue</p>
          <p className="text-lg font-semibold text-primary capitalize">{formatPreviewDate(selectedDate)}</p>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!selectedDate || selectedDate <= minDate} className="w-full" size="lg">
        Continuer
      </Button>
    </div>
  )
}
