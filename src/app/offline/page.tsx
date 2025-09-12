import OfflinePageContainer from '@/components/container/offline.container'
import { generateMetadata } from '@/lib/metadata'
export const metadata = generateMetadata({
  title: 'Offline Mode',
  description:
    'You are currently offline. Access your saved workouts and continue training without an internet connection.',
  keywords: ['offline', 'no internet', 'cached workouts', 'PWA offline mode'],
  url: '/offline',
})
export default function OfflinePage() {
  return <OfflinePageContainer />
}
