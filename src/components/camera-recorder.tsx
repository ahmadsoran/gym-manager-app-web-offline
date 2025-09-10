'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Modal, ModalContent, ModalBody } from '@heroui/modal'
import { Button } from '@heroui/button'
import {
  IconCamera,
  IconVideo,
  IconX,
  IconPlayerStop,
  IconCheck,
  IconTrash,
  IconUpload,
  IconRefresh,
} from '@tabler/icons-react'

interface CameraRecorderProps {
  isOpen: boolean
  onClose: () => void
  onMediaCapture: (file: File, type: 'image' | 'video') => void
}

export default function CameraRecorder({
  isOpen,
  onClose,
  onMediaCapture,
}: CameraRecorderProps) {
  const [mode, setMode] = useState<'photo' | 'video'>('photo')
  const [isRecording, setIsRecording] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [isReady, setIsReady] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment'
  )

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Initialize camera
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsReady(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }, [facingMode])

  // Cleanup camera
  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsReady(false)
  }, [])

  useEffect(() => {
    if (isOpen && !previewUrl) {
      initCamera()
    } else {
      cleanupCamera()
    }

    return cleanupCamera
  }, [isOpen, initCamera, cleanupCamera, previewUrl])

  // Switch camera function
  const switchCamera = useCallback(async () => {
    if (previewUrl) return // Don't switch camera while in preview mode

    setIsReady(false)
    cleanupCamera()
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }, [previewUrl, cleanupCamera])

  const handleTakePhoto = useCallback(async () => {
    if (!videoRef.current || !isReady) return

    const canvas = document.createElement('canvas')
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `workout-photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
          const url = URL.createObjectURL(blob)
          setPreviewUrl(url)
          setCapturedFile(file)
          setMediaType('image')
          // Stop camera stream to show preview properly
          cleanupCamera()
        }
      },
      'image/jpeg',
      0.9
    )
  }, [isReady, cleanupCamera])

  const handleStartRecording = useCallback(async () => {
    if (!streamRef.current || !isReady) return

    chunksRef.current = []

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9',
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const file = new File([blob], `workout-video-${Date.now()}.webm`, {
          type: 'video/webm',
        })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setCapturedFile(file)
        setMediaType('video')
        // Stop camera stream to show preview properly
        cleanupCamera()
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [isReady, cleanupCamera])

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const handleSave = () => {
    if (capturedFile) {
      onMediaCapture(capturedFile, mediaType)
      handleClose()
    }
  }

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setCapturedFile(null)
    setIsRecording(false)
    setMode('photo')
    setFacingMode('environment') // Reset to back camera
    cleanupCamera()
    onClose()
  }

  const handleRetake = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setCapturedFile(null)
    // Restart camera after clearing preview
    setTimeout(() => {
      initCamera()
    }, 100)
  }, [previewUrl, initCamera])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const type = file.type.startsWith('image/') ? 'image' : 'video'
      onMediaCapture(file, type)
      handleClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size='full'
      hideCloseButton
      classNames={{
        base: 'bg-black',
        backdrop: 'bg-black/90',
      }}>
      <ModalContent className='bg-black text-white m-0 rounded-none h-full'>
        <ModalBody className='p-0 h-full flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-10'>
            <Button
              isIconOnly
              variant='light'
              color='default'
              className='text-white'
              onPress={handleClose}>
              <IconX size={24} />
            </Button>

            <div className='flex gap-2'>
              <Button
                size='sm'
                variant={mode === 'photo' ? 'solid' : 'light'}
                color='primary'
                onPress={() => setMode('photo')}
                startContent={<IconCamera size={16} />}>
                Photo
              </Button>
              <Button
                size='sm'
                variant={mode === 'video' ? 'solid' : 'light'}
                color='primary'
                onPress={() => setMode('video')}
                startContent={<IconVideo size={16} />}>
                Video
              </Button>
            </div>

            <div className='flex gap-2'>
              {!previewUrl && (
                <Button
                  isIconOnly
                  variant='light'
                  color='default'
                  className='text-white'
                  onPress={switchCamera}
                  disabled={!isReady || isRecording}>
                  <IconRefresh size={20} />
                </Button>
              )}

              <input
                type='file'
                accept='image/*,video/*'
                onChange={handleFileUpload}
                className='hidden'
                id='file-upload'
              />
              <Button
                isIconOnly
                variant='light'
                color='default'
                className='text-white'
                onPress={() => document.getElementById('file-upload')?.click()}>
                <IconUpload size={24} />
              </Button>
            </div>
          </div>

          {/* Camera/Preview Area */}
          <div className='flex-1 flex items-center justify-center relative'>
            {previewUrl ? (
              // Preview captured media
              <div className='w-full h-full flex items-center justify-center'>
                {mediaType === 'video' ? (
                  <video
                    src={previewUrl}
                    controls
                    className='max-w-full max-h-full object-contain'
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt='Captured'
                    className='max-w-full max-h-full object-contain'
                  />
                )}
              </div>
            ) : (
              // Camera view
              <div className='w-full h-full relative'>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className='w-full h-full object-cover'
                />

                {!isReady && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                    <div className='text-white text-center'>
                      <p className='text-lg mb-4'>Initializing Camera...</p>
                    </div>
                  </div>
                )}

                {isReady && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none'>
                    <div className='text-white text-center'>
                      <p className='text-lg mb-4'>Camera Ready</p>
                      <p className='text-sm opacity-75'>
                        {mode === 'photo'
                          ? 'Tap to take photo'
                          : 'Hold to record video'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className='absolute bottom-0 left-0 right-0 p-6 bg-black/50 backdrop-blur-sm'>
            {previewUrl ? (
              // Preview controls
              <div className='flex items-center justify-center gap-6'>
                <Button
                  isIconOnly
                  size='lg'
                  variant='solid'
                  color='danger'
                  onPress={handleRetake}
                  className='w-16 h-16'>
                  <IconTrash size={24} />
                </Button>

                <Button
                  isIconOnly
                  size='lg'
                  variant='solid'
                  color='success'
                  onPress={handleSave}
                  className='w-16 h-16'>
                  <IconCheck size={24} />
                </Button>
              </div>
            ) : (
              // Camera controls
              <div className='flex items-center justify-center'>
                {mode === 'photo' ? (
                  <Button
                    isIconOnly
                    size='lg'
                    variant='solid'
                    color='primary'
                    onPress={handleTakePhoto}
                    disabled={!isReady}
                    className='w-20 h-20 rounded-full'>
                    <IconCamera size={32} />
                  </Button>
                ) : (
                  <Button
                    isIconOnly
                    size='lg'
                    variant='solid'
                    color={isRecording ? 'danger' : 'primary'}
                    onPress={() => {
                      if (isRecording) {
                        handleStopRecording()
                      } else {
                        handleStartRecording()
                      }
                    }}
                    disabled={!isReady}
                    className={`w-20 h-20 ${
                      isRecording ? 'rounded-lg animate-pulse' : 'rounded-full'
                    } transition-all duration-200`}>
                    {isRecording ? (
                      <IconPlayerStop size={32} />
                    ) : (
                      <div className='w-6 h-6 bg-red-500 rounded-full' />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
