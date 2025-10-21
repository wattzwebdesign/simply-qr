import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default function ShortUrlPage() {
  // This will be handled by the API route
  redirect('/')
}
