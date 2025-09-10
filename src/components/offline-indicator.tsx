'use client'

import { useOfflineSync } from '@//hooks/use-offline-sync'
import { Chip } from '@heroui/chip'
import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/tooltip'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal'
import {
  IconWifi,
  IconWifiOff,
  IconCloudCheck,
  IconCloudUpload,
  IconRefresh,
} from '@tabler/icons-react'
import { useState } from 'react'

export default function OfflineIndicator() {
  const {
    isOnline,
    pendingActions,
    isSyncing,
    syncPendingActions,
    hasPendingActions,
  } = useOfflineSync()

  const [showDetails, setShowDetails] = useState(false)

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        color: 'danger' as const,
        icon: <IconWifiOff size={14} />,
        text: 'Offline',
        description: 'Working offline. Changes will sync when connected.',
      }
    }

    if (isSyncing) {
      return {
        color: 'warning' as const,
        icon: <IconCloudUpload size={14} />,
        text: 'Syncing...',
        description: 'Syncing your changes to the cloud.',
      }
    }

    if (hasPendingActions) {
      return {
        color: 'warning' as const,
        icon: <IconCloudUpload size={14} />,
        text: `${pendingActions.length} pending`,
        description: 'You have changes waiting to sync.',
      }
    }

    return {
      color: 'success' as const,
      icon: <IconWifi size={14} />,
      text: 'Online',
      description: 'All changes are synced.',
    }
  }

  const status = getStatusInfo()

  const formatActionType = (type: string) => {
    switch (type) {
      case 'add_workout':
        return 'Add workout'
      case 'update_workout':
        return 'Update workout'
      case 'delete_workout':
        return 'Delete workout'
      case 'add_media':
        return 'Add media'
      case 'remove_media':
        return 'Remove media'
      default:
        return type
    }
  }

  return (
    <>
      <div className='fixed top-4 right-4 z-40'>
        <Tooltip content={status.description} placement='bottom-end'>
          <Chip
            color={status.color}
            variant='solid'
            size='sm'
            startContent={status.icon}
            className='cursor-pointer transition-transform hover:scale-105'
            onClick={() => setShowDetails(true)}>
            {status.text}
          </Chip>
        </Tooltip>
      </div>

      {/* Sync Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        placement='center'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              {isOnline ? (
                <IconCloudCheck size={24} className='text-success' />
              ) : (
                <IconWifiOff size={24} className='text-danger' />
              )}
              Sync Status
            </div>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-default-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  {status.icon}
                  <div>
                    <p className='font-medium'>{status.text}</p>
                    <p className='text-sm text-default-500'>
                      {status.description}
                    </p>
                  </div>
                </div>
              </div>

              {hasPendingActions && (
                <div className='space-y-3'>
                  <h4 className='font-medium text-sm text-default-700'>
                    Pending Changes ({pendingActions.length})
                  </h4>
                  <div className='space-y-2 max-h-48 overflow-y-auto'>
                    {pendingActions.map((action) => (
                      <div
                        key={action.id}
                        className='flex items-center gap-3 p-2 bg-warning-50 rounded'>
                        <IconCloudUpload
                          size={16}
                          className='text-warning-600'
                        />
                        <div className='flex-1'>
                          <p className='text-sm font-medium'>
                            {formatActionType(action.type)}
                          </p>
                          <p className='text-xs text-default-500'>
                            {new Date(action.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isOnline && (
                <div className='p-3 bg-danger-50 rounded-lg'>
                  <p className='text-sm text-danger-700'>
                    You're currently offline. Your changes are saved locally and
                    will automatically sync when you're back online.
                  </p>
                </div>
              )}

              {isOnline && hasPendingActions && (
                <div className='p-3 bg-warning-50 rounded-lg'>
                  <p className='text-sm text-warning-700'>
                    Some changes are waiting to sync. This usually happens
                    automatically.
                  </p>
                </div>
              )}

              {isOnline && !hasPendingActions && !isSyncing && (
                <div className='p-3 bg-success-50 rounded-lg'>
                  <p className='text-sm text-success-700'>
                    All your changes are synced and up to date!
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setShowDetails(false)}>
              Close
            </Button>
            {isOnline && hasPendingActions && (
              <Button
                color='primary'
                onPress={syncPendingActions}
                isLoading={isSyncing}
                startContent={!isSyncing && <IconRefresh size={16} />}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
