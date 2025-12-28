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
  const [isInitializing, setIsInitializing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const warmupDoneRef = useRef<boolean>(false)
  const chunksRef = useRef<Blob[]>([])

  // Detect iOS
  const isIOS = useCallback(() => {
    if (typeof navigator === 'undefined') return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  }, [])

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

  // Attach stream to video element when step changes to 'recording'
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

  // Warm-up for iOS - initialize the encoder
  const doIOSWarmup = useCallback(async (stream: MediaStream) => {
    if (!isIOS() || warmupDoneRef.current) return
    
    console.log('iOS: Performing warm-up...')
    setIsInitializing(true)
    
    try {
      const RecordRTC = (await import('recordrtc')).default
      
      const warmupRecorder = new RecordRTC(stream, {
        type: 'video',
        disableLogs: true,
      })
      
      warmupRecorder.startRecording()
      
      // Wait 800ms for encoder to initialize
      await new Promise(resolve => setTimeout(resolve, 800))
      
      await new Promise<void>((resolve) => {
        warmupRecorder.stopRecording(() => {
          warmupRecorder.destroy()
          resolve()
        })
      })
      
      warmupDoneRef.current = true
      console.log('iOS: Warm-up complete')
    } catch (e) {
      console.log('iOS: Warm-up error (continuing anyway):', e)
      warmupDoneRef.current = true
    } finally {
      setIsInitializing(false)
    }
  }, [isIOS])

  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    try {
      setError(null)
      setCameraReady(false)
      setIsVideoPlaying(false)
      stopAllTracks()

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      console.log('Requesting camera with facing mode:', facing)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 1280 }
        },
        audio: true
      })

      streamRef.current = stream
      console.log('Stream obtained:', stream.id)

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
      
      // Do iOS warm-up after stream is ready
      await doIOSWarmup(stream)
      
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
  }, [facingMode, stopAllTracks, doIOSWarmup])

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
    warmupDoneRef.current = false // Reset warmup for new camera
    await startCamera(newFacing)
  }

  const handleStartRecording = async () => {
    if (!streamRef.current) {
      setError('Kamera belum siap.')
      return
    }

    try {
      setError(null)
      chunksRef.current = []
      
      const RecordRTC = (await import('recordrtc')).default
      
      console.log('Starting recording, isIOS:', isIOS())

      const recorderOptions: any = {
        type: 'video',
        disableLogs: false,
        // Use timeSlice for chunked recording (helps with iOS)
        timeSlice: isIOS() ? 1000 : undefined,
        ondataavailable: isIOS() ? (blob: Blob) => {
          if (blob && blob.size > 0) {
            chunksRef.current.push(blob)
            console.log('Chunk received:', blob.size)
          }
        } : undefined,
      }

      // For non-iOS, set mimeType
      if (!isIOS()) {
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            recorderOptions.mimeType = 'video/webm;codecs=vp9'
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            recorderOptions.mimeType = 'video/webm'
          }
        }
      }

      const recorder = new RecordRTC(streamRef.current, recorderOptions)

      recorder.startRecording()
      recorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err: any) {
      console.error('Recording error:', err)
      setError(`Gagal memulai rekaman: ${err.message}`)
    }
  }

  const handleStopRecording = () => {
    if (!recorderRef.current) return

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRecording(false)

    recorderRef.current.stopRecording(() => {
      let blob: Blob
      
      // For iOS with chunked recording, combine chunks
      if (isIOS() && chunksRef.current.length > 0) {
        console.log('iOS: Combining', chunksRef.current.length, 'chunks')
        blob = new Blob(chunksRef.current, { type: 'video/mp4' })
      } else {
        blob = recorderRef.current.getBlob()
      }
      
      console.log('Final blob:', blob.type, blob.size)
      
      if (blob.size < 1000) {
        setError('Video terlalu pendek atau gagal direkam. Silakan coba lagi.')
        setStep('recording')
        return
      }
      
      const url = URL.createObjectURL(blob)
      setRecordedBlob(blob)
      setRecordedVideoUrl(url)
      setStep('preview')
      
      // Cleanup
      chunksRef.current = []
    })
  }

  const handleReRecord = async () => {
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl)
    setRecordedBlob(null)
    setRecordedVideoUrl(null)
    setRecordingTime(0)
    setError(null)
    recorderRef.current = null
    chunksRef.current = []

    const success = await startCamera()
    if (success) setStep('recording')
  }

  const uploadVideo = async () => {
    if (!recordedBlob) {
      setError('Video tidak ditemukan.')
      return
    }

    // Validate blob size
    if (recordedBlob.size < 1000) {
      setError('Video terlalu kecil. Silakan rekam ulang.')
      return
    }

    setStep('uploading')
    setUploadProgress(0)

    try {
      const blobType = recordedBlob.type || 'video/mp4'
      let extension = 'mp4'
      if (blobType.includes('webm')) extension = 'webm'
      else if (blobType.includes('mov')) extension = 'mov'
      
      const filename = `testimonial.${extension}`
      
      console.log('Uploading video:', { 
        blobType, 
        extension, 
        size: recordedBlob.size,
        isIOS: isIOS()
      })

      const formData = new FormData()
      formData.append('video', recordedBlob, filename)
      formData.append('campaignId', campaign.id)

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90))
      }, 300)

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
      console.error('Upload error:', err)
      setError(err.message || 'Gagal mengunggah. Silakan coba lagi.')
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
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onPlaying={() => {
                  console.log('Video onPlaying event fired')
                  setIsVideoPlaying(true)
                }}
                className="w-full h-full object-cover"
                style={{ 
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
                  opacity: isVideoPlaying ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
              />

              {/* Loading/Initializing overlay */}
              {(!isVideoPlaying || isInitializing) && cameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                  <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                  <p className="text-white text-sm">
                    {isInitializing ? 'Menyiapkan perekam...' : 'Menyiapkan kamera...'}
                  </p>
                </div>
              )}

              {/* Camera status */}
              {cameraReady && !isRecording && !isInitializing && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full z-10">
                  <div className={`w-2 h-2 rounded-full ${isVideoPlaying ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                  <span className="text-xs font-medium">
                    {isVideoPlaying ? 'Siap merekam' : 'Menghubungkan...'}
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
              {hasMultipleCameras && !isRecording && !isInitializing && (
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
                  disabled={!cameraReady || isInitializing}
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
              {isRecording ? 'Ketuk untuk berhenti' : isInitializing ? 'Mohon tunggu...' : cameraReady ? 'Ketuk untuk rekam' : 'Menunggu kamera...'}
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