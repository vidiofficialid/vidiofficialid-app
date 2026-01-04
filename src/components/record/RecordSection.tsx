'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Square, Play, RotateCcw, Check, Camera, AlertCircle, Smartphone } from 'lucide-react'

interface RecordSectionProps {
  campaignData: {
    transcript: string
    gestureGuide?: string
  }
  campaignId?: string
  customScript?: string
  onRecordingComplete: (videoBlob: Blob) => void
  deviceInfo: { device: string; os: string } | null
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'preview'
type LogEventType = 'info' | 'warning' | 'error'
type LogStage = 'camera_init' | 'recording' | 'preview' | 'upload'

// Helper function to log events to server
const logRecordingEvent = async (
  campaignId: string | undefined,
  stage: LogStage,
  eventType: LogEventType,
  message: string,
  additionalData?: Record<string, unknown>
) => {
  const browserInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    online: navigator.onLine,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    orientation: screen.orientation?.type || 'unknown',
  }

  try {
    await fetch('/api/recording-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaignId,
        stage,
        event_type: eventType,
        error_message: message,
        browser_info: browserInfo,
        additional_data: additionalData,
      }),
    })
  } catch (e) {
    console.error('Failed to send log:', e)
  }
}

export function RecordSection({ campaignData, campaignId, customScript, onRecordingComplete, deviceInfo }: RecordSectionProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [countdown, setCountdown] = useState(3)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLandscape, setIsLandscape] = useState(false)
  const [needsRotation, setNeedsRotation] = useState(false)

  // Detect iOS
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mimeTypeRef = useRef<string>('')
  const streamDimensionsRef = useRef<{ width: number; height: number } | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true

    const getCameraAccess = async () => {
      try {
        // Check browser support
        if (typeof window === 'undefined') {
          logRecordingEvent(campaignId, 'camera_init', 'error', 'Window undefined - SSR context')
          return
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          const msg = 'Browser tidak mendukung getUserMedia'
          logRecordingEvent(campaignId, 'camera_init', 'error', msg)
          setCameraError(msg)
          return
        }

        if (!window.MediaRecorder) {
          const msg = 'Browser tidak mendukung MediaRecorder'
          logRecordingEvent(campaignId, 'camera_init', 'error', msg)
          setCameraError(msg)
          return
        }

        logRecordingEvent(campaignId, 'camera_init', 'info', 'Requesting camera access')

        // Simple constraints for maximum compatibility
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 720 },
            height: { ideal: 1280 },
          },
          audio: true,
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

        // Log successful stream acquisition and save original dimensions
        const videoTrack = mediaStream.getVideoTracks()[0]
        const settings = videoTrack?.getSettings()

        // Save stream dimensions to compare with video element dimensions
        if (settings?.width && settings?.height) {
          streamDimensionsRef.current = { width: settings.width, height: settings.height }
        }

        logRecordingEvent(campaignId, 'camera_init', 'info', 'Camera stream acquired', {
          videoWidth: settings?.width,
          videoHeight: settings?.height,
          facingMode: settings?.facingMode,
          deviceId: settings?.deviceId,
          trackLabel: videoTrack?.label,
        })

        if (mounted) {
          setStream(mediaStream)
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream

            // Log when video metadata loads and detect iOS dimension swap
            videoRef.current.onloadedmetadata = () => {
              const video = videoRef.current
              if (video) {
                const isLandscapeVideo = video.videoWidth > video.videoHeight
                setIsLandscape(isLandscapeVideo)

                // Detect iOS Safari dimension swap (stream is portrait but video renders landscape)
                const streamDims = streamDimensionsRef.current
                if (streamDims && isIOS) {
                  const streamIsPortrait = streamDims.height > streamDims.width
                  const videoIsLandscape = video.videoWidth > video.videoHeight

                  // If stream was portrait but video is landscape, iOS swapped the dimensions
                  if (streamIsPortrait && videoIsLandscape) {
                    setNeedsRotation(true)
                    logRecordingEvent(campaignId, 'camera_init', 'warning', 'iOS dimension swap detected - applying rotation', {
                      streamWidth: streamDims.width,
                      streamHeight: streamDims.height,
                      videoWidth: video.videoWidth,
                      videoHeight: video.videoHeight,
                    })
                  }
                }

                logRecordingEvent(campaignId, 'camera_init', 'info', 'Video metadata loaded', {
                  videoWidth: video.videoWidth,
                  videoHeight: video.videoHeight,
                  isLandscape: isLandscapeVideo,
                  needsRotation: streamDimensionsRef.current && isIOS &&
                    (streamDimensionsRef.current.height > streamDimensionsRef.current.width) &&
                    (video.videoWidth > video.videoHeight),
                })
              }
            }

            // Log if video fails to play
            videoRef.current.onerror = (e) => {
              logRecordingEvent(campaignId, 'camera_init', 'error', 'Video element error', {
                error: String(e),
              })
            }
          }
        } else {
          mediaStream.getTracks().forEach(track => track.stop())
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        const errorName = err instanceof Error ? err.name : 'UnknownError'

        logRecordingEvent(campaignId, 'camera_init', 'error', `Camera access failed: ${errorName}`, {
          errorMessage,
          errorName,
          errorStack: err instanceof Error ? err.stack : undefined,
        })

        if (mounted) {
          if (errorName === 'NotAllowedError') {
            setCameraError('Izin kamera ditolak. Silakan izinkan akses kamera.')
          } else if (errorName === 'NotFoundError') {
            setCameraError('Kamera tidak ditemukan.')
          } else if (errorName === 'NotReadableError') {
            setCameraError('Kamera sedang digunakan aplikasi lain.')
          } else {
            setCameraError(`Tidak dapat mengakses kamera: ${errorMessage}`)
          }
        }
      }
    }

    getCameraAccess()

    return () => {
      mounted = false
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [campaignId])

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, [stream])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (videoRef.current && stream && recordingState !== 'preview') {
      videoRef.current.srcObject = stream
    }
  }, [stream, recordingState])

  // Canvas drawing for rotated preview (fixes iOS landscape issue)
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || !stream || recordingState === 'preview' || !needsRotation) {
      // Cancel any existing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawFrame = () => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        // Video is landscape (width > height), we need to rotate to portrait
        if (video.videoWidth > video.videoHeight) {
          // Set canvas to portrait dimensions (swap width/height)
          canvas.width = video.videoHeight
          canvas.height = video.videoWidth

          // Clear and draw rotated
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.save()

          // Move to center
          ctx.translate(canvas.width / 2, canvas.height / 2)
          // Rotate 90 degrees clockwise (positive)
          ctx.rotate(90 * Math.PI / 180)
          // Mirror horizontally for front camera (selfie)
          ctx.scale(-1, 1)
          // Draw centered
          ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2)

          ctx.restore()
        } else {
          // Normal portrait - just mirror
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.save()
          ctx.scale(-1, 1)
          ctx.drawImage(video, -video.videoWidth, 0)
          ctx.restore()
        }
      }
      animationFrameRef.current = requestAnimationFrame(drawFrame)
    }

    drawFrame()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [stream, recordingState, needsRotation])

  useEffect(() => {
    if (recordingState === 'preview' && recordedBlob) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      const url = URL.createObjectURL(recordedBlob)
      setPreviewUrl(url)
      if (previewVideoRef.current) {
        previewVideoRef.current.src = url
        previewVideoRef.current.load()
      }
    }
  }, [recordingState, recordedBlob])

  const startRecording = useCallback(() => {
    if (!stream) {
      logRecordingEvent(campaignId, 'recording', 'error', 'No stream available for recording')
      return
    }

    chunksRef.current = []
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
    let selectedMimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || ''

    if (!selectedMimeType) {
      logRecordingEvent(campaignId, 'recording', 'error', 'No supported MIME type found', {
        testedMimeTypes: mimeTypes,
      })
      setCameraError('Browser tidak mendukung format perekaman.')
      return
    }

    logRecordingEvent(campaignId, 'recording', 'info', 'Starting recording', {
      selectedMimeType,
    })
    mimeTypeRef.current = selectedMimeType

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType, videoBitsPerSecond: 1000000 })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })
        setRecordedBlob(blob)
        console.log('Recording complete, blob size:', (blob.size / 1024 / 1024).toFixed(2), 'MB')
      }

      mediaRecorder.start(1000)
      setRecordingState('recording')
      setRecordingTime(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) { stopRecording(); return prev }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      setCameraError('Gagal memulai perekaman.')
    }
  }, [stream])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    setRecordingState('preview')
  }, [])

  const startCountdown = useCallback(() => {
    setRecordingState('countdown')
    setCountdown(3)
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
          startRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [startRecording])

  const handleRecordClick = () => {
    if (recordingState === 'idle') startCountdown()
    else if (recordingState === 'recording') stopRecording()
  }

  const handleTakeAgain = () => {
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
    setRecordedBlob(null)
    chunksRef.current = []
    setRecordingState('idle')
    setRecordingTime(0)
    setIsPlaying(false)
  }

  const handleFinish = () => {
    if (recordedBlob) onRecordingComplete(recordedBlob)
  }

  const togglePlayback = async () => {
    if (!previewVideoRef.current) return
    try {
      if (isPlaying) { previewVideoRef.current.pause(); setIsPlaying(false) }
      else { await previewVideoRef.current.play(); setIsPlaying(true) }
    } catch (err) { console.error('Playback error:', err) }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  useEffect(() => {
    const video = previewVideoRef.current
    if (video) {
      const onEnded = () => setIsPlaying(false)
      video.addEventListener('ended', onEnded)
      return () => video.removeEventListener('ended', onEnded)
    }
  }, [recordingState])

  // Update layout in return statement
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-[9/16] shadow-2xl">

          {/* Camera Error Screen - User Friendly */}
          {cameraError && (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center justify-center p-6 z-40">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
              >
                <Camera className="w-10 h-10 text-red-500" />
              </motion.div>

              <h3 className="text-white font-bold text-xl mb-3 text-center">
                Izin Kamera Diperlukan
              </h3>

              <p className="text-gray-300 text-sm text-center mb-6 leading-relaxed">
                Untuk merekam video testimonial, Anda perlu mengizinkan akses kamera dan mikrofon.
              </p>

              {/* Visual Step Guide */}
              <div className="bg-white/10 rounded-2xl p-4 mb-6 w-full">
                <p className="text-orange-400 text-xs font-medium mb-3">CARA MENGIZINKAN:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
                    <p className="text-white text-sm">Ketuk ikon 🔒 di sebelah kiri alamat website</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
                    <p className="text-white text-sm">Pilih <b>"Izin"</b> atau <b>"Permissions"</b></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</span>
                    <p className="text-white text-sm">Ubah <b>Kamera</b> dan <b>Mikrofon</b> menjadi <b>"Izinkan"</b></p>
                  </div>
                </div>
              </div>

              {/* Retry Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="w-full bg-orange-500 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Muat Ulang Halaman
              </motion.button>

              {/* Error detail for debugging */}
              <p className="text-gray-500 text-xs mt-4 text-center">
                {cameraError}
              </p>
            </div>
          )}

          {(recordingState === 'idle' || recordingState === 'countdown' || recordingState === 'recording') && !cameraError && (
            <>
              {/* Hidden video element - source for canvas when rotation needed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
                style={{ display: needsRotation ? 'none' : 'block' }}
              />
              {/* Canvas for rotated preview (iOS landscape fix) */}
              {needsRotation && (
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                />
              )}
            </>
          )}

          {recordingState === 'preview' && (
            <video ref={previewVideoRef} playsInline className="w-full h-full object-cover" />
          )}

          {/* Landscape Warning Overlay */}
          <AnimatePresence>
            {isLandscape && recordingState === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 p-6"
              >
                <motion.div
                  animate={{ rotate: [0, -90, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="mb-4"
                >
                  <Smartphone className="w-16 h-16 text-orange-400" />
                </motion.div>
                <h3 className="text-white font-bold text-lg mb-2 text-center">
                  Putar HP Anda
                </h3>
                <p className="text-white/80 text-sm text-center">
                  Pegang HP secara vertikal (portrait) untuk hasil video yang lebih baik
                </p>
                <button
                  onClick={() => setIsLandscape(false)}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium"
                >
                  Lanjutkan Tetap
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Script Overlay - Moved to Top */}
          {(recordingState === 'idle' || recordingState === 'countdown' || recordingState === 'recording') && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }}
              className="absolute top-0 left-0 right-0 bg-black/30 backdrop-blur-sm p-5 z-20">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-orange-400" />
                <h4 className="text-white font-medium text-sm">
                  {customScript ? 'Script Anda:' : 'Script:'}
                </h4>
              </div>
              <div className="overflow-y-auto max-h-32 text-shadow-sm scrollbar-thin scrollbar-thumb-white/20">
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line font-medium text-shadow">
                  {customScript || campaignData.transcript}
                </p>
              </div>
            </motion.div>
          )}

          {recordingState === 'recording' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32 left-0 right-0 flex justify-center z-20">
              <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-white font-mono">{formatTime(recordingTime)}</span>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {recordingState === 'countdown' && countdown > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }} className="text-white text-9xl font-bold">
                  {countdown}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {recordingState === 'preview' && !isPlaying && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              onClick={togglePlayback} className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-gray-900 ml-1" />
              </div>
            </motion.button>
          )}

          {(recordingState === 'idle' || recordingState === 'recording') && (
            <motion.div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
              <motion.button onClick={handleRecordClick} whileTap={{ scale: 0.9 }}>
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${recordingState === 'recording' ? 'bg-red-600' : 'bg-red-500'}`}>
                    {recordingState === 'recording' ? <Square className="w-8 h-8 text-white fill-white" />
                      : <Circle className="w-14 h-14 text-white fill-red-500" />}
                  </div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className={`text-white text-xs px-3 py-1.5 rounded-full shadow-md ${recordingState === 'recording' ? 'bg-red-600' : 'bg-black/70'}`}>
                      {recordingState === 'recording' ? 'Tekan untuk Stop' : 'Tekan untuk Merekam'}
                    </span>
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>
          )}


          {recordingState === 'preview' && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-t-3xl p-5">
              <h4 className="text-gray-900 text-center font-medium mb-4">Hasil rekaman sudah bagus?</h4>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleTakeAgain}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-xl flex items-center justify-center gap-2 font-medium">
                  <RotateCcw className="w-5 h-5" /> Ulangi
                </motion.button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleFinish}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium">
                  <Check className="w-5 h-5" /> Lanjutkan
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {deviceInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-sm text-gray-500">
            {deviceInfo.device} • {deviceInfo.os}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
