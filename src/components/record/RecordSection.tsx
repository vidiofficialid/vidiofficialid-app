'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Square, Play, RotateCcw, Check, Camera, AlertCircle } from 'lucide-react'

interface RecordSectionProps {
  campaignData: {
    transcript: string
  }
  onRecordingComplete: (videoBlob: Blob) => void
  deviceInfo: { device: string; os: string } | null
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'preview'

export function RecordSection({ campaignData, onRecordingComplete, deviceInfo }: RecordSectionProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [countdown, setCountdown] = useState(3)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Request camera access
  useEffect(() => {
    const getCameraAccess = async () => {
      try {
        // Check if MediaRecorder is supported
        if (!window.MediaRecorder) {
          setCameraError('Browser Anda tidak mendukung perekaman video. Gunakan Chrome, Firefox, atau Edge terbaru.')
          return
        }

        const constraints = {
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user',
          },
          audio: true,
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(mediaStream)
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setCameraError('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.')
          } else if (err.name === 'NotFoundError') {
            setCameraError('Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.')
          } else {
            setCameraError('Tidak dapat mengakses kamera: ' + err.message)
          }
        }
      }
    }

    getCameraAccess()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  // Update video ref when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const startCountdown = useCallback(() => {
    setRecordingState('countdown')
    setCountdown(3)

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
          }
          startRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const startRecording = useCallback(() => {
    if (!stream) return

    chunksRef.current = []

    // Get supported MIME type
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ]

    let selectedMimeType = ''
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType
        break
      }
    }

    if (!selectedMimeType) {
      setCameraError('Browser tidak mendukung format perekaman video.')
      return
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMimeType })
        const url = URL.createObjectURL(blob)
        setRecordedBlobUrl(url)

        if (previewVideoRef.current) {
          previewVideoRef.current.src = url
        }
      }

      mediaRecorder.start(1000) // Collect data every second
      setRecordingState('recording')
      setRecordingTime(0)

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          // Auto stop at 3 minutes
          if (prev >= 180) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setCameraError('Gagal memulai perekaman.')
    }
  }, [stream])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }

    setRecordingState('preview')
  }, [])

  const handleRecordClick = () => {
    if (recordingState === 'idle') {
      startCountdown()
    } else if (recordingState === 'recording') {
      stopRecording()
    }
  }

  const handleTakeAgain = () => {
    setRecordingState('idle')
    setRecordingTime(0)
    setIsPlaying(false)
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl)
      setRecordedBlobUrl(null)
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.src = ''
    }
    chunksRef.current = []
  }

  const handleFinish = () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' })
    onRecordingComplete(blob)
  }

  const togglePlayback = () => {
    if (previewVideoRef.current) {
      if (isPlaying) {
        previewVideoRef.current.pause()
      } else {
        previewVideoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle video ended
  useEffect(() => {
    const video = previewVideoRef.current
    if (video) {
      const handleEnded = () => setIsPlaying(false)
      video.addEventListener('ended', handleEnded)
      return () => video.removeEventListener('ended', handleEnded)
    }
  }, [recordingState])

  if (cameraError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Tidak Dapat Mengakses Kamera</h3>
          <p className="text-red-600 text-sm">{cameraError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        {/* Video Preview Container - Portrait 9:16 */}
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-[9/16] max-w-sm mx-auto shadow-2xl">
          {/* Live Camera Feed */}
          {recordingState !== 'preview' && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}

          {/* Recorded Video Preview */}
          {recordingState === 'preview' && (
            <video
              ref={previewVideoRef}
              playsInline
              className="w-full h-full object-cover"
              onClick={togglePlayback}
            />
          )}

          {/* Recording Status Bar */}
          {recordingState === 'recording' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
                <span className="text-white text-sm">Merekam</span>
              </div>
              <span className="text-white font-mono">{formatTime(recordingTime)}</span>
            </motion.div>
          )}

          {/* Countdown Overlay */}
          <AnimatePresence>
            {recordingState === 'countdown' && countdown > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50"
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white text-9xl font-bold"
                >
                  {countdown}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play Button Overlay for Preview */}
          {recordingState === 'preview' && !isPlaying && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={togglePlayback}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-gray-900 ml-1" />
              </div>
            </motion.button>
          )}

          {/* Recording Button */}
          {recordingState !== 'preview' && (
            <motion.button
              onClick={handleRecordClick}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20"
              disabled={recordingState === 'countdown'}
            >
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${
                    recordingState === 'recording' ? 'bg-red-600' : 'bg-red-500'
                  }`}
                >
                  {recordingState === 'recording' ? (
                    <Square className="w-8 h-8 text-white fill-white" />
                  ) : (
                    <Circle className="w-14 h-14 text-white fill-red-500" />
                  )}
                </div>
                {recordingState === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  >
                    <span className="text-white text-xs bg-black/70 px-3 py-1.5 rounded-full shadow-md">
                      Tekan untuk Merekam
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.button>
          )}

          {/* Transcript/Actions Card */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md rounded-t-3xl p-5"
          >
            {recordingState !== 'preview' ? (
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-5 h-5 text-orange-600" />
                  <h4 className="text-gray-900 font-medium text-sm">Script:</h4>
                </div>
                <div className="overflow-y-auto max-h-24 pr-2">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {campaignData.transcript}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                <h4 className="text-gray-900 text-center font-medium">Hasil rekaman sudah bagus?</h4>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTakeAgain}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Ulangi</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFinish}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <Check className="w-5 h-5" />
                    <span>Lanjutkan</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Device Info */}
        {deviceInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-gray-500"
          >
            Merekam dengan {deviceInfo.device} • {deviceInfo.os}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
