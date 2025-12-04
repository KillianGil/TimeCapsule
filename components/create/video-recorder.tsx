"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CameraIcon, RefreshIcon, VideoIcon, CheckIcon } from "@/components/icons"

interface VideoRecorderProps {
  onVideoRecorded: (blob: Blob, url: string, location: { lat: number; lng: number } | null) => void
}

export function VideoRecorder({ onVideoRecorded }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [recordingTime, setRecordingTime] = useState(0)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const MAX_DURATION = 60 // 60 seconds max

  useEffect(() => {
    startCamera()
    getLocation()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_DURATION) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // Location permission denied - continue without location
        },
      )
    }
  }

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setError(null)
    } catch (err) {
      setError("Impossible d'accéder à la caméra. Veuillez autoriser l'accès.")
    }
  }

  const startRecording = () => {
    if (!stream) return

    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
    })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" })
      const url = URL.createObjectURL(blob)
      setRecordedBlob(blob)
      setRecordedUrl(url)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
    setRecordingTime(0)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  const retake = () => {
    setRecordedBlob(null)
    setRecordedUrl(null)
    setRecordingTime(0)
    startCamera()
  }

  const confirmVideo = () => {
    if (recordedBlob && recordedUrl) {
      onVideoRecorded(recordedBlob, recordedUrl, location)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <CameraIcon className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-foreground font-medium mb-2">Accès caméra requis</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={startCamera}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Video Preview */}
      <div className="relative flex-1 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${recordedUrl ? "hidden" : ""}`}
        />
        {recordedUrl && <video src={recordedUrl} controls className="w-full h-full object-cover" />}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-destructive/90 rounded-full">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span className="text-white font-mono text-sm">
              {formatTime(recordingTime)} / {formatTime(MAX_DURATION)}
            </span>
          </div>
        )}

        {/* Camera switch button */}
        {!recordedUrl && !isRecording && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
            onClick={switchCamera}
          >
            <RefreshIcon className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-card border-t border-border">
        {!recordedUrl ? (
          <div className="flex justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                isRecording ? "border-destructive bg-destructive/20" : "border-primary bg-primary/20"
              }`}
            >
              {isRecording ? (
                <div className="w-8 h-8 rounded-sm bg-destructive" />
              ) : (
                <VideoIcon className="w-8 h-8 text-primary" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg" onClick={retake} className="gap-2 bg-transparent">
              <RefreshIcon className="w-4 h-4" />
              Refaire
            </Button>
            <Button size="lg" onClick={confirmVideo} className="gap-2">
              <CheckIcon className="w-4 h-4" />
              Valider
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isRecording
            ? "Appuyez pour arrêter l'enregistrement"
            : recordedUrl
              ? "Validez ou recommencez l'enregistrement"
              : "Appuyez pour commencer l'enregistrement (60s max)"}
        </p>
      </div>
    </div>
  )
}
