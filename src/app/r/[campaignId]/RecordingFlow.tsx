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

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Get supported MIME type
  const getSupportedMimeType = useCallback(() => {
    if (typeof MediaRecorder === 'undefined') return ''
    
    // iOS Safari prefers mp4
    if (isIOS() || isSafari()) {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        return 'video/mp4'
      }
      // Fallback - let browser decide
      return ''
    }
    
    // Other browsers prefer webm
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ]
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return ''
  }, [isIOS, isSafari])

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

  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {
        // Ignore
      }
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

      console.log('Starting camera, facing:', facing, 'isIOS:', isIOS(), 'isSafari:', isSafari())

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
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

      const mimeType = getSupportedMimeType()
      console.log('Starting recording with mimeType:', mimeType || 'default')

      const options: MediaRecorderOptions = {}
      if (mimeType) {
        options.mimeType = mimeType
      }
      
      // Lower bitrate for iOS to prevent issues
      if (isIOS()) {
        options.videoBitsPerSecond = 1000000 // 1 Mbps
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size)
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error)
        setError('Terjadi kesalahan saat merekam: ' + (event.error?.message || 'Unknown error'))
        setIsRecording(false)
      }

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, chunks:', chunksRef.current.length)
        
        if (chunksRef.current.length === 0) {
          setError('Tidak ada data video yang terekam. Silakan coba lagi.')
          return
        }

        // Determine blob type
        const recordedMimeType = mediaRecorder.mimeType || mimeType || 'video/mp4'
        console.log('Creating blob with type:', recordedMimeType)
        
        const blob = new Blob(chunksRef.current, { type: recordedMimeType })
        console.log('Blob created:', blob.size, blob.type)

        if (blob.size < 1000) {
          setError('Video terlalu pendek. Silakan rekam minimal 2 detik.')
          return
        }

        const url = URL.createObjectURL(blob)
        setRecordedBlob(blob)
        setRecordedVideoUrl(url)
        setStep('preview')
      }

      // Request data every second for iOS compatibility
      mediaRecorder.start(1000)
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      console.log('Recording started')
    } catch (err: any) {
      console.error('Start recording error:', err)
      setError('Gagal memulai rekaman: ' + err.message)
    }
  }, [getSupportedMimeType, isIOS])

  const handleStopRecording = useCallback(() => {
    console.log('Stopping recording...')
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRecording(false)

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {
        console.error('Stop error:', e)
        setError('Gagal menghentikan rekaman.')
      }
    } else {
      console.log('MediaRecorder not active')
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        setRecordedBlob(blob)
        setRecordedVideoUrl(url)
        setStep('preview')
      } else {
        setError('Tidak ada data video.')
      }
    }
  }, [])

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
    if (!recordedBlob) {
      setError('Video tidak ditemukan.')
      return
    }

    if (recordedBlob.size < 1000) {
      setError('Video terlalu kecil. Silakan rekam ulang.')
      return
    }

    setStep('uploading')
    setUploadProgress(0)

    try {
      // Determine file extension
      let extension = 'mp4'
      const blobType = recordedBlob.type.toLowerCase()
      if (blobType.includes('webm')) {
        extension = 'webm'
      } else if (blobType.includes('quicktime') || blobType.includes('mov')) {
        extension = 'mov'
      }

      const filename = 'testimonial-' + Date.now() + '.' + extension

      console.log('Uploading:', {
        filename,
        type: recordedBlob.type,
        size: recordedBlob.size,
        isIOS: isIOS(),
        isSafari: isSafari()
      })

      const formData = new FormData()
      formData.append('video', recordedBlob, filename)
      formData.append('campaignId', campaign.id)

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90))
      }, 200)

      const response = await fetch('/api/testimonials/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload gagal')
      }

      setUploadProgress(100)
      stopAllTracks()

      setTimeout(() => setStep('success'), 500)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Gagal mengunggah video.')
      setStep('preview')
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
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
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

      <div className="p-4 max-w-md mx-auto">
        {/* Intro */}
        {step === 'intro' && (
          <div>
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
              <h2 className="font-semibold text-black mb-3 flex items-center gap-2">📝 Yang perlu Anda sampaikan:</h2>
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
                {['Izinkan akses kamera & mikrofon', 'Rekam video testimoni Anda', 'Preview dan kirim'].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={() => setStep('permission')} className="w-full bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-98 transition-transform">
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
            
            <button onClick={requestPermission} className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 active:scale-98 transition-transform">
              Izinkan Akses
            </button>
          </div>
        )}

        {/* Recording */}
        {step === 'recording' && (
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 mb-4 aspect-[3/4]">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                webkit-playsinline="true"
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

              {cameraReady && !isRecording && isVideoPlaying && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-medium">Siap merekam</span>
                </div>
              )}

              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                </div>
              )}

              {hasMultipleCameras && !isRecording && (
                <button
                  onClick={switchCamera}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white active:bg-black/80"
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
                  disabled={!cameraReady || !isVideoPlaying}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 bg-white rounded-full" />
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse active:scale-95 transition-transform"
                >
                  <Square className="w-8 h-8 text-white fill-white" />
                </button>
              )}
            </div>
            <p className="text-center text-sm text-gray-500 mt-3">
              {isRecording ? 'Ketuk untuk berhenti' : cameraReady && isVideoPlaying ? 'Ketuk untuk rekam' : 'Menunggu kamera...'}
            </p>
          </div>
        )}

        {/* Preview */}
        {step === 'preview' && recordedVideoUrl && (
          <div>
            <h2 className="text-xl font-bold text-black mb-4 text-center">Preview Video</h2>
            <div className="rounded-2xl overflow-hidden bg-black mb-4 aspect-[3/4]">
              <video 
                src={recordedVideoUrl} 
                controls 
                playsInline 
                webkit-playsinline="true"
                className="w-full h-full object-cover" 
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={handleReRecord} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full font-semibold flex items-center justify-center gap-2 active:bg-gray-200 transition-colors">
                <RotateCcw className="w-5 h-5" /> Rekam Ulang
              </button>
              <button onClick={uploadVideo} className="flex-1 bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 active:bg-gray-800 transition-colors">
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
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: uploadProgress + '%' }} />
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
