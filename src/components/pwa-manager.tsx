'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/button'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal'
import { IconDownload } from '@tabler/icons-react'
import OfflineIndicator from './offline-indicator'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAManager() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      if (!isInstalled) {
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
  }, [isInstalled])

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

  const dismissInstallModal = () => {
    setShowInstallModal(false)
    // Show again after 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show install modal if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      if (dismissedTime > oneDayAgo) {
        setShowInstallModal(false)
      }
    }
  }, [])

  return (
    <>
      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Install PWA Modal */}
      <Modal
        isOpen={showInstallModal && !!installPrompt && !isInstalled}
        onClose={dismissInstallModal}
        placement='bottom'
        backdrop='blur'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <IconDownload size={24} className='text-primary' />
              Install Gym Manager
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <p className='text-default-600'>
                Install Gym Manager on your device for the best experience:
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
            <Button variant='light' onPress={dismissInstallModal}>
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
