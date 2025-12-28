"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Video, Mic, Camera, Square, RotateCcw, Upload, CheckCircle, ChevronRight, RefreshCw, X } from "lucide-react"

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
  const [showScript, setShowScript] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const MAX_DURATION = 60 // Maximum recording duration in seconds

  // Detect iOS
  const isIOS = useCallback(() => {
    if (typeof window === 'undefined') return false
    const ua = window.navigator.userAgent
    return /iPad|iPhone|iPod/.test(ua) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  }, [])

  // Detect Safari
  const isSafari = useCallback(() => {
    if (typeof window === 'undefined') return false
    const ua = window.navigator.userAgent
    return /^((?!chrome|android).)*safari/i.test(ua)
  }, [])

  // Check for multiple cameras
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    navigator.mediaDevices?.enumerateDevices()
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

  // Attach stream to video when step changes
  useEffect(() => {
    if (step === 'recording' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play()
        .then(() => setIsVideoPlaying(true))
        .catch((e) => {
          console.error("Video play error:", e)
          if (streamRef.current) setIsVideoPlaying(true)
        })
    }
  }, [step])

  // Auto-stop recording at max duration
  useEffect(() => {
    if (isRecording && recordingTime >= MAX_DURATION) {
      handleStopRecording()
    }
  }, [recordingTime, isRecording])

  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {}
    }
    mediaRecorderRef.current = null
    setIsVideoPlaying(false)
  }, [])

  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    try {
      setError(null)
      setCameraReady(false)
      setIsVideoPlaying(false)
      stopAllTracks()

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      console.log('Starting camera, isIOS:', isIOS(), 'isSafari:', isSafari())

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: true
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
          setIsVideoPlaying(true)
        } catch (e) {
          console.log('Initial play failed:', e)
        }
      }

      setCameraReady(true)
      return true
    } catch (err: any) {
      console.error('Camera error:', err)
      setCameraReady(false)

      if (err.name === 'NotAllowedError') {
        setError('Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.')
      } else if (err.name === 'NotFoundError') {
        setError('Kamera tidak ditemukan.')
      } else if (err.name === 'NotReadableError') {
        setError('Kamera sedang digunakan aplikasi lain.')
      } else {
        setError('Gagal mengakses kamera: ' + err.message)
      }
      return false
    }
  }, [facingMode, stopAllTracks, isIOS, isSafari])

  const requestPermission = async () => {
    const success = await startCamera()
    if (success) {
      setStep('recording')
    }
  }

  const switchCamera = async () => {
    if (isRecording) return
    const newFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacing)
    await startCamera(newFacing)
  }

  const handleStartRecording = useCallback(() => {
    if (!streamRef.current) {
      setError('Kamera belum siap.')
      return
    }

    try {
      setError(null)
      chunksRef.current = []

      // For iOS Safari, don't specify mimeType - let browser decide
      const options: MediaRecorderOptions = {}
      
      // Only set mimeType for non-iOS browsers
      if (!isIOS() && !isSafari()) {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          options.mimeType = 'video/webm;codecs=vp9,opus'
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options.mimeType = 'video/webm'
        }
      }

      console.log('Starting MediaRecorder with options:', options)

      const mediaRecorder = new MediaRecorder(streamRef.current, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
          console.log('Chunk received:', event.data.size, 'total chunks:', chunksRef.current.length)
        }
      }

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event)
        setError('Terjadi kesalahan saat merekam.')
        setIsRecording(false)
      }

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, chunks:', chunksRef.current.length)
        processRecordedChunks()
      }

      // Start recording - use timeslice for better compatibility
      mediaRecorder.start(1000)
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err: any) {
      console.error('Start recording error:', err)
      setError('Gagal memulai rekaman: ' + err.message)
    }
  }, [isIOS, isSafari])

  const processRecordedChunks = useCallback(() => {
    if (chunksRef.current.length === 0) {
      setError('Tidak ada data video. Silakan coba lagi.')
      return
    }

    // Get the mimeType from the first chunk or use default
    const mimeType = chunksRef.current[0]?.type || 'video/mp4'
    console.log('Creating blob with mimeType:', mimeType)

    const blob = new Blob(chunksRef.current, { type: mimeType })
    console.log('Blob created:', blob.size, blob.type)

    if (blob.size < 1000) {
      setError('Video terlalu pendek. Rekam minimal 2 detik.')
      return
    }

    const url = URL.createObjectURL(blob)
    setRecordedBlob(blob)
    setRecordedVideoUrl(url)
    setStep('preview')
  }, [])

  const handleStopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRecording(false)

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    } else {
      // Fallback if recorder is not in recording state
      processRecordedChunks()
    }
  }, [processRecordedChunks])

  const handleReRecord = async () => {
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl)
    setRecordedBlob(null)
    setRecordedVideoUrl(null)
    setRecordingTime(0)
    setError(null)
    chunksRef.current = []
    mediaRecorderRef.current = null

    const success = await startCamera()
    if (success) setStep('recording')
  }

  const uploadVideo = async () => {
    if (!recordedBlob || isUploading) {
      return
    }

    if (recordedBlob.size < 1000) {
      setError('Video terlalu kecil. Silakan rekam ulang.')
      return
    }

    setIsUploading(true)
    setStep('uploading')
    setUploadProgress(0)
    setError(null)

    try {
      // Create a proper File object instead of just Blob
      const timestamp = Date.now()
      const blobType = recordedBlob.type || 'video/mp4'
      
      let extension = 'mp4'
      if (blobType.includes('webm')) extension = 'webm'
      else if (blobType.includes('quicktime')) extension = 'mov'
      
      const filename = 'testimonial-' + timestamp + '.' + extension

      // Convert Blob to File for better compatibility
      const file = new File([recordedBlob], filename, { type: blobType })

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        isIOS: isIOS(),
        isSafari: isSafari()
      })

      const formData = new FormData()
      formData.append('video', file)
      formData.append('campaignId', campaign.id)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await fetch('/api/testimonials/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Upload gagal. Status: ' + response.status)
      }

      const result = await response.json()
      console.log('Upload success:', result)

      setUploadProgress(100)
      stopAllTracks()
      
      setTimeout(() => {
        setStep('success')
        setIsUploading(false)
      }, 500)

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Gagal mengunggah video. Silakan coba lagi.')
      setStep('preview')
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins + ':' + secs.toString().padStart(2, '0')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          {campaign.business.logo ? (
            <Image src={campaign.business.logo} alt={campaign.business.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{campaign.business.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h1 className="font-semibold text-black">{campaign.business.name}</h1>
            <p className="text-xs text-gray-500">Video Testimonial</p>
          </div>
        </div>
      </div>

      {/* Main Content - Add padding for fixed header */}
      <div className="pt-16 pb-4 px-4 max-w-md mx-auto">
        
        {/* Intro */}
        {step === 'intro' && (
          <div className="pt-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-black mb-2">Halo, {campaign.customerName}! 👋</h1>
              <p className="text-gray-600">{campaign.business.name} mengundang Anda untuk berbagi pengalaman</p>
            </div>

            {campaign.productImage && (
              <div className="rounded-2xl overflow-hidden mb-6">
                <Image src={campaign.productImage} alt={campaign.brandName} width={400} height={300} className="w-full h-48 object-cover" />
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="font-semibold text-black mb-3">📝 Yang perlu Anda sampaikan:</h2>
              <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 text-sm">{campaign.testimonialScript}</p>
              {campaign.gestureGuide && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-yellow-800">💡 <strong>Tip:</strong> {campaign.gestureGuide}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="font-semibold text-black mb-4">Langkah-langkah:</h2>
              <div className="space-y-3">
                {['Izinkan akses kamera & mikrofon', 'Rekam video testimoni (maks 60 detik)', 'Preview dan kirim'].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setStep('permission')} 
              className="w-full bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Mulai Rekam <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Permission */}
        {step === 'permission' && (
          <div className="text-center pt-8">
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
            
            <button 
              onClick={requestPermission} 
              className="w-full bg-black text-white py-4 rounded-full font-semibold active:scale-95 transition-transform"
            >
              Izinkan Akses
            </button>
          </div>
        )}

        {/* Recording */}
        {step === 'recording' && (
          <div className="relative min-h-[calc(100vh-80px)]">
            {/* Video Preview - Full height */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[3/4]">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onPlaying={() => setIsVideoPlaying(true)}
                className="w-full h-full object-cover"
                style={{ 
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                  opacity: isVideoPlaying ? 1 : 0,
                }}
              />

              {!isVideoPlaying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                  <p className="text-white text-sm">Menyiapkan kamera...</p>
                </div>
              )}

              {/* Recording Timer - Top Left */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="text-base font-bold">{formatTime(recordingTime)}</span>
                  <span className="text-xs opacity-75">/ {formatTime(MAX_DURATION)}</span>
                </div>
              )}

              {/* Camera Ready Indicator */}
              {cameraReady && !isRecording && isVideoPlaying && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 text-white px-3 py-2 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium">Siap merekam</span>
                </div>
              )}

              {/* Switch Camera Button - Top Right */}
              {hasMultipleCameras && !isRecording && (
                <button
                  onClick={switchCamera}
                  className="absolute top-4 right-4 w-12 h-12 bg-black/60 rounded-full flex items-center justify-center text-white active:bg-black/80"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
              )}

              {/* Duration Info - Top Center */}
              {!isRecording && isVideoPlaying && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full">
                  <span className="text-xs">Maks {MAX_DURATION} detik</span>
                </div>
              )}
            </div>

            {/* Floating Script Card - Semi-transparent */}
            {showScript && (
              <div className="fixed bottom-32 left-4 right-4 max-w-md mx-auto z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-500 font-medium">📝 Script:</p>
                    <button 
                      onClick={() => setShowScript(false)}
                      className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{campaign.testimonialScript}</p>
                  {campaign.gestureGuide && (
                    <p className="text-xs text-yellow-700 mt-2">💡 {campaign.gestureGuide}</p>
                  )}
                </div>
              </div>
            )}

            {/* Show Script Button (when hidden) */}
            {!showScript && !isRecording && (
              <button
                onClick={() => setShowScript(true)}
                className="fixed bottom-32 left-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm"
              >
                📝 Lihat Script
              </button>
            )}

            {/* Error Message */}
            {error && (
              <div className="fixed bottom-32 left-4 right-4 max-w-md mx-auto z-10">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Floating Record Button - Center Bottom */}
            <div className="fixed bottom-8 left-0 right-0 flex flex-col items-center z-20">
              {!isRecording ? (
                <>
                  <button
                    onClick={handleStartRecording}
                    disabled={!cameraReady || !isVideoPlaying}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 transition-transform border-4 border-white"
                  >
                    <div className="w-8 h-8 bg-white rounded-full" />
                  </button>
                  <p className="text-sm text-gray-600 mt-2 bg-white/80 px-3 py-1 rounded-full">
                    {cameraReady && isVideoPlaying ? 'Ketuk untuk rekam' : 'Menunggu kamera...'}
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStopRecording}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform border-4 border-white animate-pulse"
                  >
                    <Square className="w-8 h-8 text-white fill-white" />
                  </button>
                  <p className="text-sm text-white mt-2 bg-red-500 px-3 py-1 rounded-full">
                    Ketuk untuk berhenti
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        {step === 'preview' && recordedVideoUrl && (
          <div className="pt-4">
            <h2 className="text-xl font-bold text-black mb-4 text-center">Preview Video</h2>
            
            {/* Video Preview */}
            <div className="rounded-2xl overflow-hidden bg-black mb-4 aspect-[3/4]">
              <video 
                src={recordedVideoUrl} 
                controls 
                playsInline
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Duration Info */}
            <div className="text-center mb-4">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                Durasi: {formatTime(recordingTime)}
              </span>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={handleReRecord} 
                disabled={isUploading}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full font-semibold flex items-center justify-center gap-2 active:bg-gray-200 disabled:opacity-50"
              >
                <RotateCcw className="w-5 h-5" /> Rekam Ulang
              </button>
              <button 
                onClick={uploadVideo} 
                disabled={isUploading}
                className="flex-1 bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 active:bg-gray-800 disabled:opacity-50"
              >
                <Upload className="w-5 h-5" /> {isUploading ? 'Mengirim...' : 'Kirim'}
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
            <p className="text-sm text-gray-500 mb-4">Durasi: {formatTime(recordingTime)}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: uploadProgress + '%' }} 
              />
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
