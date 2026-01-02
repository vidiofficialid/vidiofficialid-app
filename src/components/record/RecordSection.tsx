'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Square, Play, RotateCcw, Check, Camera, AlertCircle } from 'lucide-react'

interface RecordSectionProps {
  campaignData: {
    transcript: string
    gestureGuide?: string
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
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mimeTypeRef = useRef<string>('')

  useEffect(() => {
    let mounted = true
    
    const getCameraAccess = async () => {
      try {
        if (typeof window === 'undefined' || !window.MediaRecorder) {
          setCameraError('Browser Anda tidak mendukung perekaman video.')
          return
        }

        const constraints = {
          video: { width: { ideal: 720 }, height: { ideal: 1280 }, facingMode: 'user' },
          audio: true,
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        
        if (mounted) {
          setStream(mediaStream)
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
          }
        } else {
          mediaStream.getTracks().forEach(track => track.stop())
        }
      } catch (err) {
        if (mounted && err instanceof Error) {
          setCameraError(err.name === 'NotAllowedError' 
            ? 'Izin kamera ditolak.' 
            : 'Tidak dapat mengakses kamera.')
        }
      }
    }

    getCameraAccess()

    return () => {
      mounted = false
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [])

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
    if (!stream) return

    chunksRef.current = []
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
    let selectedMimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || ''

    if (!selectedMimeType) {
      setCameraError('Browser tidak mendukung format perekaman.')
      return
    }

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

  if (cameraError) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Tidak Dapat Mengakses Kamera</h3>
          <p className="text-red-600 text-sm">{cameraError}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-[9/16] shadow-2xl">
          {(recordingState === 'idle' || recordingState === 'countdown' || recordingState === 'recording') && (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          )}

          {recordingState === 'preview' && (
            <video ref={previewVideoRef} playsInline className="w-full h-full object-cover" />
          )}

          {recordingState === 'recording' && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-white text-sm">REC</span>
              </div>
              <span className="text-white font-mono">{formatTime(recordingTime)}</span>
            </motion.div>
          )}

          <AnimatePresence>
            {recordingState === 'countdown' && countdown > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50">
                <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }} className="text-white text-9xl font-bold">
                  {countdown}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {recordingState === 'preview' && !isPlaying && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              onClick={togglePlayback} className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-gray-900 ml-1" />
              </div>
            </motion.button>
          )}

          {(recordingState === 'idle' || recordingState === 'recording') && (
            <motion.button onClick={handleRecordClick} whileTap={{ scale: 0.9 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${
                  recordingState === 'recording' ? 'bg-red-600' : 'bg-red-500'}`}>
                  {recordingState === 'recording' ? <Square className="w-8 h-8 text-white fill-white" /> 
                    : <Circle className="w-14 h-14 text-white fill-red-500" />}
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-white text-xs px-3 py-1.5 rounded-full shadow-md ${
                    recordingState === 'recording' ? 'bg-red-600' : 'bg-black/70'}`}>
                    {recordingState === 'recording' ? 'Tekan untuk Stop' : 'Tekan untuk Merekam'}
                  </span>
                </motion.div>
              </div>
            </motion.button>
          )}

          {(recordingState === 'idle' || recordingState === 'countdown' || recordingState === 'recording') && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md rounded-t-3xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-orange-600" />
                <h4 className="text-gray-900 font-medium text-sm">Script:</h4>
              </div>
              <div className="overflow-y-auto max-h-20">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{campaignData.transcript}</p>
              </div>
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
