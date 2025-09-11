'use client'
import { useEffect } from 'react'
import { Button } from '@heroui/button'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal'
import { IconDownload } from '@tabler/icons-react'
import { usePWAStore } from '@//store/pwa-store'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAManager() {
  const {
    installPrompt,
    isInstalled,
    isDismissed,
    showInstallModal,
    setInstallPrompt,
    setIsInstalled,
    setShowInstallModal,
    dismissInstall,
  } = usePWAStore()

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = window.matchMedia(
      '(display-mode: standalone)'
    ).matches
    setIsInstalled(checkInstalled)

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setInstallPrompt(promptEvent)

      // Only show modal if not installed and not dismissed
      if (!checkInstalled && !isDismissed) {
        setShowInstallModal(true)
      }
    }

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setShowInstallModal(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isDismissed, setInstallPrompt, setIsInstalled, setShowInstallModal])

  const handleInstallClick = async () => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
      }

      setInstallPrompt(null)
      setShowInstallModal(false)
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  const handleDismiss = () => {
    dismissInstall()
  }

  if (isInstalled && !showInstallModal) {
    return null
  }

  return (
    <>
      {/* Install PWA Modal */}
      <Modal
        isOpen={showInstallModal && !!installPrompt && !isInstalled}
        onClose={handleDismiss}
        placement='bottom'
        backdrop='blur'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <IconDownload size={24} className='text-primary' />
              Install Workout Manager
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <p className='text-default-600'>
                Install Workout Manager on your device for the best experience:
              </p>
              <ul className='space-y-2 text-sm text-default-500'>
                <li className='flex items-center gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full' />
                  Works offline with all your data
                </li>
                <li className='flex items-center gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full' />
                  Faster loading and better performance
                </li>
                <li className='flex items-center gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full' />
                  Native app-like experience
                </li>
                <li className='flex items-center gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full' />
                  Add to home screen for quick access
                </li>
              </ul>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={handleDismiss}>
              Maybe Later
            </Button>
            <Button color='primary' onPress={handleInstallClick}>
              Install App
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
