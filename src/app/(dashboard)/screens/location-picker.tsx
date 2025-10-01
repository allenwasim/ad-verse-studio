import dynamic from 'next/dynamic'
import { forwardRef } from 'react'

const LocationPickerClient = dynamic(() => import('./location-picker-client'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse" />,
})

// forwardRef is no longer needed here as the client component handles its own refs,
// but we'll keep the structure in case it's needed for other props in the future.
export default function LocationPicker(props: any) {
  return <LocationPickerClient {...props} />
}
