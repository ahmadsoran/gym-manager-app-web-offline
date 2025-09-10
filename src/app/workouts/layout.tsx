'use client'
import { PhotoProvider } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
export default function WorkoutsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='space-y-6'>{<PhotoProvider>{children}</PhotoProvider>}</div>
  )
}
