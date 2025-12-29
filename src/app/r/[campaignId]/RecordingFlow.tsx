"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Video, Mic, Camera, Square, RotateCcw, Upload, CheckCircle, ChevronRight, AlertCircle, RefreshCw } from "lucide-react"

interface Campaign {
  id: string
  title: string
  brandName: string
  testimonialScript: string
  gestureGuide: string | null
  customerName: string
  productImage: string | null
  business: {
    name: string
    logo: string | null
  }
}

type Step = 'intro' | 'permission' | 'recording' | 'preview' | 'uploading' | 'success'

export default function RecordingFlow({ campaign }: { campaign: Campaign }) {
  const [step, setStep] = useState<Step>('intro')
  const [error, setError] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Check for multiple cameras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoInputs = devices.filter(d => d.kind === 'videoinput')
        setHasMultipleCameras(videoInputs.length > 1)
      })
      .catch(() => {})
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllTracks()
      if (timerRef.current) clearInterval(timerRef.current)
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl)
    }
  }, [recordedVideoUrl])

  // FIX: Attach stream to video element when step changes to 'recording'
  // This solves the race condition between setStep and video element mounting
  useEffect(() => {
    if (step === 'recording' && videoRef.current && streamRef.current) {
      console.log("Mounting stream to video element on step change")
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play()
        .then(() => {
          console.log("Video playing successfully")
          setIsVideoPlaying(true)
        })
        .catch(e => {
          console.error("Error playing video:", e)
          // Still mark as playing if stream exists
          if (streamRef.current) setIsVideoPlaying(true)
        })
    }
  }, [step])

  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsVideoPlaying(false)
  }, [])

  // Start camera - simplified, let useEffect handle video attachment
  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    try {
      setError(null)
      setCameraReady(false)
      setIsVideoPlaying(false)
      stopAllTracks()

      // Clear existing srcObject
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      console.log('Requesting camera with facing mode:', facing)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true
      })

      streamRef.current = stream
      console.log('Stream obtained:', stream.id)

      // If videoRef exists (e.g., when switching camera in recording mode), attach immediately
      if (videoRef.current) {
        console.log('VideoRef exists, attaching stream directly')
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
          setIsVideoPlaying(true)
        } catch (e) {
          console.log('Direct play failed, will retry:', e)
        }
      }
      
      // Mark camera as ready - useEffect will handle attachment if videoRef wasn't ready
      setCameraReady(true)
      return true
    } catch (err: any) {
      console.error('Camera error:', err)
      setCameraReady(false)
      
      if (err.name === 'NotAllowedError') {
        setError('Akses kamera ditolak. Izinkan akses kamera di browser.')
      } else if (err.name === 'NotFoundError') {
        setError('Kamera tidak ditemukan.')
      } else {
        setError(`Gagal mengakses kamera: ${err.message}`)
      }
      return false
    }
  }, [facingMode, stopAllTracks])

  // Request permission
  const requestPermission = async () => {
    const success = await startCamera()
    if (success) {
      setStep('recording')
    }
  }

  // Switch camera
  const switchCamera = async () => {
    if (isRecording) return
    const newFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacing)
    await startCamera(newFacing)
  }

  // Start recording
  const handleStartRecording = async () => {
    if (!streamRef.current) {
      setError('Kamera belum siap.')
      return
    }

    try {
      setError(null)
      const RecordRTC = (await import('recordrtc')).default

      const recorder = new RecordRTC(streamRef.current, {
        type: 'video',
        mimeType: 'video/webm',
        disableLogs: true,
      })

      recorder.startRecording()
      recorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err: any) {
      setError(`Gagal memulai rekaman: ${err.message}`)
    }
  }

  // Stop recording
  const handleStopRecording = () => {
    if (!recorderRef.current) return

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob()
      const url = URL.createObjectURL(blob)
      setRecordedBlob(blob)
      setRecordedVideoUrl(url)
      setIsRecording(false)
      setStep('preview')
    })
  }

  // Re-record
  const handleReRecord = async () => {
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl)
    setRecordedBlob(null)
    setRecordedVideoUrl(null)
    setRecordingTime(0)
    setError(null)
    recorderRef.current = null

    // Start camera first
    const success = await startCamera()
    // Then change step - useEffect will handle stream attachment
    if (success) setStep('recording')
  }

  // Upload video
  const uploadVideo = async () => {
    if (!recordedBlob) {
      setError('Video tidak ditemukan.')
      return
    }

    setStep('uploading')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', recordedBlob, 'testimonial.webm')
      formData.append('campaignId', campaign.id)

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch('/api/testimonials/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      setUploadProgress(100)
      stopAllTracks()

      setTimeout(() => setStep('success'), 500)

    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah.')
      setStep('preview')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {campaign.business.logo ? (
            <Image src={campaign.business.logo} alt={campaign.business.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 bg-[#FDC435] rounded-lg flex items-center justify-center">
              <span className="font-bold text-black">{campaign.business.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-black">{campaign.business.name}</p>
            <p className="text-xs text-gray-500">Video Testimonial</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Intro */}
        {step === 'intro' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-[#FDC435] rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Halo, {campaign.customerName}! 👋</h1>
            <p className="text-gray-600 mb-8">Terima kasih telah bersedia memberikan testimonial untuk <strong>{campaign.brandName}</strong></p>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 text-left">
              <h2 className="font-semibold text-black mb-4">Panduan Singkat:</h2>
              <div className="space-y-3">
                {['Izinkan akses kamera dan mikrofon', 'Ikuti script yang tersedia', 'Rekam video (30-60 detik)', 'Kirim video Anda'].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={() => setStep('permission')} className="w-full bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-800">
              Mulai Rekam <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Permission */}
        {step === 'permission' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Izinkan Akses</h1>
            <p className="text-gray-600 mb-8">Kami memerlukan akses ke kamera dan mikrofon</p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3 mb-6">
              <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Kamera</p>
              </div>
              <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
                <Mic className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Mikrofon</p>
              </div>
            </div>
            
            <button onClick={requestPermission} className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800">
              Izinkan Akses
            </button>
          </div>
        )}

        {/* Recording */}
        {step === 'recording' && (
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 mb-4 aspect-[3/4]">
              {/* Video element with event handlers */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onPlaying={() => {
                  console.log('Video onPlaying event fired')
                  setIsVideoPlaying(true)
                }}
                onCanPlay={() => {
                  console.log('Video onCanPlay event fired')
                }}
                className="w-full h-full object-cover"
                style={{ 
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
                  opacity: isVideoPlaying ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
              />

              {/* Loading overlay - shown when video not playing yet */}
              {!isVideoPlaying && cameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                  <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                  <p className="text-white text-sm">Menyiapkan kamera...</p>
                </div>
              )}

              {/* Camera status indicator */}
              {cameraReady && !isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full z-10">
                  <div className={`w-2 h-2 rounded-full ${isVideoPlaying ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                  <span className="text-xs font-medium">
                    {isVideoPlaying ? 'Kamera aktif' : 'Menghubungkan...'}
                  </span>
                </div>
              )}

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full z-10">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                </div>
              )}

              {/* Switch camera */}
              {hasMultipleCameras && !isRecording && (
                <button
                  onClick={switchCamera}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 z-10"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4 max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">📝 Script:</p>
              <p className="text-sm text-gray-700 leading-relaxed">{campaign.testimonialScript}</p>
            </div>

            {campaign.gestureGuide && (
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200 mb-4">
                <p className="text-xs text-yellow-700">💡 Tip: {campaign.gestureGuide}</p>
              </div>
            )}

            <div className="flex justify-center">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  disabled={!cameraReady}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                  <div className="w-8 h-8 bg-white rounded-full" />
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg animate-pulse"
                >
                  <Square className="w-8 h-8 text-white fill-white" />
                </button>
              )}
            </div>
            <p className="text-center text-sm text-gray-500 mt-3">
              {isRecording ? 'Ketuk untuk berhenti' : cameraReady ? 'Ketuk untuk rekam' : 'Menunggu kamera...'}
            </p>
          </div>
        )}

        {/* Preview */}
        {step === 'preview' && recordedVideoUrl && (
          <div>
            <h2 className="text-xl font-bold text-black mb-4 text-center">Preview Video</h2>
            <div className="rounded-2xl overflow-hidden bg-black mb-4 aspect-[3/4]">
              <video src={recordedVideoUrl} controls playsInline className="w-full h-full object-cover" />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={handleReRecord} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-200">
                <RotateCcw className="w-5 h-5" /> Rekam Ulang
              </button>
              <button onClick={uploadVideo} className="flex-1 bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-800">
                <Upload className="w-5 h-5" /> Kirim
              </button>
            </div>
          </div>
        )}

        {/* Uploading */}
        {step === 'uploading' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Mengunggah Video...</h2>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 mt-6">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-sm text-gray-500">{uploadProgress}%</p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Terima Kasih! 🎉</h1>
            <p className="text-gray-600 mb-6">Video testimonial Anda berhasil dikirim ke <strong>{campaign.business.name}</strong></p>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Tim akan meninjau video Anda. Terima kasih! 🙏</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
