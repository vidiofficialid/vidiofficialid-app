"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Video, Mic, Camera, Square, RotateCcw, Upload, CheckCircle, ChevronRight, RefreshCw } from "lucide-react"

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
  const [isUploading, setIsUploading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const MAX_DURATION = 60

  const isIOS = useCallback(() => {
    if (typeof window === 'undefined') return false
    const ua = window.navigator.userAgent
    return /iPad|iPhone|iPod/.test(ua) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  }, [])

  const isSafari = useCallback(() => {
    if (typeof window === 'undefined') return false
    const ua = window.navigator.userAgent
    return /^((?!chrome|android).)*safari/i.test(ua)
  }, [])

  useEffect(() => {
    if (typeof navigator === 'undefined') return
    navigator.mediaDevices?.enumerateDevices()
      .then(devices => {
        const videoInputs = devices.filter(d => d.kind === 'videoinput')
        setHasMultipleCameras(videoInputs.length > 1)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      stopAllTracks()
      if (timerRef.current) clearInterval(timerRef.current)
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl)
    }
  }, [recordedVideoUrl])

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
      try { mediaRecorderRef.current.stop() } catch (e) {}
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

      if (videoRef.current) videoRef.current.srcObject = null

      // Lower resolution for smaller file size
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 480, max: 640 },
          height: { ideal: 640, max: 960 },
          frameRate: { ideal: 24, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
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
      } else {
        setError('Gagal mengakses kamera: ' + err.message)
      }
      return false
    }
  }, [facingMode, stopAllTracks])

  const requestPermission = async () => {
    const success = await startCamera()
    if (success) setStep('recording')
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

      const options: MediaRecorderOptions = {
        videoBitsPerSecond: 800000, // 800kbps for smaller file
        audioBitsPerSecond: 64000,  // 64kbps audio
      }
      
      if (!isIOS() && !isSafari()) {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          options.mimeType = 'video/webm;codecs=vp9,opus'
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options.mimeType = 'video/webm'
        }
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event)
        setError('Terjadi kesalahan saat merekam.')
        setIsRecording(false)
      }

      mediaRecorder.onstop = () => {
        processRecordedChunks()
      }

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

    const mimeType = chunksRef.current[0]?.type || 'video/mp4'
    const blob = new Blob(chunksRef.current, { type: mimeType })

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
    if (!recordedBlob || isUploading) return

    if (recordedBlob.size < 1000) {
      setError('Video terlalu kecil. Silakan rekam ulang.')
      return
    }

    setIsUploading(true)
    setStep('uploading')
    setUploadProgress(0)
    setError(null)

    try {
      const timestamp = Date.now()
      const blobType = recordedBlob.type || 'video/mp4'
      
      let extension = 'mp4'
      if (blobType.includes('webm')) extension = 'webm'
      
      const filename = 'testimonial-' + timestamp + '.' + extension
      const file = new File([recordedBlob], filename, { type: blobType })

      console.log('Uploading:', { name: file.name, type: file.type, size: file.size })

      const formData = new FormData()
      formData.append('video', file)
      formData.append('campaignId', campaign.id)

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => prev >= 90 ? 90 : prev + 10)
      }, 500)

      const response = await fetch('/api/testimonials/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Upload gagal. Status: ' + response.status)
      }

      setUploadProgress(100)
      stopAllTracks()
      
      setTimeout(() => {
        setStep('success')
        setIsUploading(false)
      }, 500)

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Gagal mengunggah video.')
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
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3">
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

      <div className="max-w-md mx-auto">
        {/* Intro */}
        {step === 'intro' && (
          <div className="p-4 pt-6">
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
            
            <button onClick={() => setStep('permission')} className="w-full bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
              Mulai Rekam <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Permission */}
        {step === 'permission' && (
          <div className="p-4 pt-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Izinkan Akses</h1>
            <p className="text-gray-600 mb-8">Kami memerlukan akses ke kamera dan mikrofon</p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
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
            
            <button onClick={requestPermission} className="w-full bg-black text-white py-4 rounded-full font-semibold active:scale-95 transition-transform">
              Izinkan Akses
            </button>
          </div>
        )}

        {/* Recording - Full Screen Style */}
        {step === 'recording' && (
          <div className="relative" style={{ height: 'calc(100vh - 64px)' }}>
            {/* Video Preview - Full Screen */}
            <div className="absolute inset-0">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onPlaying={() => setIsVideoPlaying(true)}
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />

              {!isVideoPlaying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                  <p className="text-white text-sm">Menyiapkan kamera...</p>
                </div>
              )}

              {/* Top Status Bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                {/* Status Indicator */}
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                  <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
                  <span className="text-sm font-medium">
                    {isRecording ? 'recording' : 'Siap merekam'}
                  </span>
                </div>

                {/* Timer */}
                <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                  <span className="text-sm font-bold">
                    {isRecording ? formatTime(recordingTime) : formatTime(MAX_DURATION)}
                  </span>
                </div>
              </div>

              {/* Switch Camera - Top Right Below Status */}
              {hasMultipleCameras && !isRecording && (
                <button
                  onClick={switchCamera}
                  className="absolute top-20 right-4 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:bg-black/70"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}

              {/* Record Button - Right Side */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
                {!isRecording ? (
                  <>
                    <button
                      onClick={handleStartRecording}
                      disabled={!cameraReady || !isVideoPlaying}
                      className="w-16 h-16 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 transition-transform"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4), inset 0 0 0 3px rgba(255,255,255,0.3)'
                      }}
                    >
                      <div className="w-6 h-6 bg-white rounded-full" />
                    </button>
                    <p className="text-white text-xs mt-2 text-center font-medium drop-shadow-lg">
                      tap for<br/>recording
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStopRecording}
                      className="w-16 h-16 rounded-full flex items-center justify-center active:scale-90 transition-transform animate-pulse"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4), inset 0 0 0 3px rgba(255,255,255,0.3)'
                      }}
                    >
                      <Square className="w-6 h-6 text-white fill-white" />
                    </button>
                    <p className="text-white text-xs mt-2 text-center font-medium drop-shadow-lg">
                      tap to<br/>stop
                    </p>
                  </>
                )}
              </div>

              {/* Script Card - Bottom, Scrollable */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-h-40 overflow-hidden">
                  <p className="text-xs text-gray-500 font-semibold mb-2">Script :</p>
                  <div className="max-h-20 overflow-y-auto">
                    <p className="text-sm text-gray-700 leading-relaxed">{campaign.testimonialScript}</p>
                  </div>
                  {campaign.gestureGuide && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-yellow-700 font-semibold">Gesture :</p>
                      <p className="text-sm text-yellow-600">{campaign.gestureGuide}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="absolute top-32 left-4 right-4">
                  <div className="bg-red-500/90 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-sm text-white text-center">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        {step === 'preview' && recordedVideoUrl && (
          <div className="p-4 pt-6">
            <h2 className="text-xl font-bold text-black mb-4 text-center">Preview Video</h2>
            
            <div className="rounded-2xl overflow-hidden bg-black mb-4 aspect-[3/4]">
              <video src={recordedVideoUrl} controls playsInline className="w-full h-full object-cover" />
            </div>

            <div className="text-center mb-4">
              <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                Durasi: {formatTime(recordingTime)}
              </span>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={handleReRecord} disabled={isUploading} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full font-semibold flex items-center justify-center gap-2 active:bg-gray-200 disabled:opacity-50">
                <RotateCcw className="w-5 h-5" /> Rekam Ulang
              </button>
              <button onClick={uploadVideo} disabled={isUploading} className="flex-1 bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 active:bg-gray-800 disabled:opacity-50">
                <Upload className="w-5 h-5" /> {isUploading ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </div>
        )}

        {/* Uploading */}
        {step === 'uploading' && (
          <div className="p-4 pt-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Mengunggah Video...</h2>
            <p className="text-sm text-gray-500 mb-6">Durasi: {formatTime(recordingTime)}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: uploadProgress + '%' }} />
            </div>
            <p className="text-sm text-gray-500">{uploadProgress}%</p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="p-4 pt-12 text-center">
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
